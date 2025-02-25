import ollama
from typing import List, Dict, Any, Optional
import json
import logging
import re
import asyncio
from pathlib import Path
from functools import partial
from tools.search_web_serp import search_web_serp
from tools.search_web_ddg import search_web_ddg
from tools.get_page_content import get_page_content
from tools.extract_vocabulary import extract_vocabulary
from tools.generate_song_id import generate_song_id
from tools.save_results import save_results

# Get the app's root logger
logger = logging.getLogger('song_vocab')

class ToolRegistry:
    def __init__(self, lyrics_path: Path, vocabulary_path: Path):
        self.lyrics_path = lyrics_path
        self.vocabulary_path = vocabulary_path
        self.tools = {
            'search_web_serp': search_web_serp,
            'search_web_ddg': search_web_ddg,
            'get_page_content': get_page_content,
            'extract_vocabulary': extract_vocabulary,
            'generate_song_id': generate_song_id,
            'save_results': partial(save_results, lyrics_path=lyrics_path, vocabulary_path=vocabulary_path)
        }
    
    def get_tool(self, name: str):
        return self.tools.get(name)

class SongLyricsAgent:
    def __init__(self, stream_llm=True):
        logger.info("Initializing SongLyricsAgent")
        self.base_path = Path(__file__).parent
        self.prompt_path = self.base_path / "prompts" / "Lyrics-Angent.md"
        self.lyrics_path = self.base_path / "outputs" / "lyrics"
        self.vocabulary_path = self.base_path / "outputs" / "vocabulary"
        self.stream_llm = stream_llm
        
        # Create output directories
        self.lyrics_path.mkdir(parents=True, exist_ok=True)
        self.vocabulary_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Output directories created: {self.lyrics_path}, {self.vocabulary_path}")
        
        # Initialize Ollama client and tool registry
        logger.info("Initializing Ollama client and tool registry")
        try:
            self.client = ollama.Client()
            self.tools = ToolRegistry(self.lyrics_path, self.vocabulary_path)
            logger.info("Initialization successful")
        except Exception as e:
            logger.error(f"Failed to initialize: {e}")
            raise
    
    def parse_llm_action(self, content: str) -> Optional[tuple[str, Dict[str, Any]]]:
        """Parse the LLM's response to extract tool name and arguments."""
        # Look for tool calls in the format: Tool: tool_name(arg1="value1", arg2="value2")
        match = re.search(r'Tool:\s*(\w+)\((.*?)\)', content)
        if not match:
            return None
        
        tool_name = match.group(1)
        args_str = match.group(2)
        
        # Parse arguments
        args = {}
        for arg_match in re.finditer(r'(\w+)="([^"]*?)"', args_str):
            args[arg_match.group(1)] = arg_match.group(2)
        
        return tool_name, args
    
    async def execute_tool(self, tool_name: str, args: Dict[str, Any]) -> Any:
        """Execute a tool with the given arguments."""
        tool = self.tools.get_tool(tool_name)
        if not tool:
            raise ValueError(f"Unknown tool: {tool_name}")
        
        logger.info(f"Executing tool {tool_name} with args: {args}")
        try:
            result = await tool(**args) if asyncio.iscoroutinefunction(tool) else tool(**args)
            logger.info(f"Tool {tool_name} execution successful")
            return result
        except Exception as e:
            logger.error(f"Tool {tool_name} execution failed: {e}")
            raise

    def _get_llm_response(self, conversation):
        """Get response from LLM with optional streaming.
        
        Args:
            conversation (list): List of conversation messages
            
        Returns:
            dict: Response object with 'content' key
        """
        if self.stream_llm:
            # Stream response and collect tokens
            full_response = ""
            logger.info("🔄 Streaming tokens:")
            for chunk in self.client.chat(
                model="llama3.2:3b",
                messages=conversation,
                stream=True
            ):
                content = chunk.get('message', {}).get('content', '')
                if content:
                    logger.info(f"Token: {content}")
                    full_response += content
            
            # Create response object similar to non-streaming format
            return {'content': full_response}
        else:
            # Non-streaming response
            response = self.client.chat(
                model="llama3.2:3b",
                messages=conversation
            )
            logger.debug(f"Raw LLM response: {response}")
            return response

    
    async def process_request(self, message: str) -> str:
        """Process a user request using the ReAct framework."""
        logger.info("="*50)
        logger.info(f"Starting new request: {message}")
        logger.info("="*50)
        
        # Initialize conversation with system prompt and user message
        conversation = [
            {"role": "system", "content": self.prompt_path.read_text()},
            {"role": "user", "content": message}
        ]
        
        max_turns = 10
        current_turn = 0
        
        while current_turn < max_turns:
            try:
                logger.info(f"\n[Turn {current_turn + 1}/{max_turns}]")
                logger.info("-"*30)
                
                # Get LLM's next action
                logger.info("🤔 Getting next action from LLM...")
                try:
                    # Log the request payload
                    logger.info("📤 Sending to Ollama:")
                    logger.info(f"Model: llama3.2:3b")
                    for msg in conversation[-2:]:  # Show last 2 messages for context
                        logger.info(f"Message ({msg['role']}): {msg['content'][:200]}...")

                    response = self._get_llm_response(conversation)
                    
                    if not isinstance(response, dict) or 'content' not in response:
                        raise ValueError(f"Unexpected response format from LLM: {response}")
                    
                    # Parse the action
                    action = self.parse_llm_action(response['content'])
                    
                    if not action:
                        if 'FINISHED' in response['content']:
                            logger.info("✅ LLM indicated task is complete")
                            logger.info("="*50)
                            return response['content']
                        else:
                            logger.warning("❌ No tool call found in LLM response")
                            conversation.append({"role": "system", "content": "Please specify a tool to use or indicate FINISHED if done."})
                            continue
                except Exception as e:
                    logger.error(f"❌ Error getting LLM response: {e}")
                    logger.debug("Last conversation state:", exc_info=True)
                    for msg in conversation[-2:]:
                        logger.debug(f"Message ({msg['role']}): {msg['content']}")
                    raise
                
                # Execute the tool
                tool_name, tool_args = action
                logger.info(f"🔧 Executing tool: {tool_name}")
                logger.info(f"📝 Arguments: {tool_args}")
                result = await self.execute_tool(tool_name, tool_args)
                logger.info(f"✅ Tool execution complete")
                
                # Add the interaction to conversation
                conversation.extend([
                    {"role": "assistant", "content": response['content']},
                    {"role": "system", "content": f"Tool {tool_name} result: {json.dumps(result)}"}
                ])
                
                current_turn += 1
                
            except Exception as e:
                logger.error(f"❌ Error in turn {current_turn + 1}: {e}")
                logger.error(f"Stack trace:", exc_info=True)
                conversation.append({"role": "system", "content": f"Error: {str(e)}. Please try a different approach."})
        
        raise Exception("Reached maximum number of turns without completing the task")
        raise Exception("Failed to get results within maximum turns")
