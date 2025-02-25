from duckduckgo_search import DDGS
from duckduckgo_search.exceptions import DuckDuckGoSearchException
from typing import List, Dict
import asyncio
import logging
import time
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger(__name__)

# Rate limiting configuration
MAX_RETRIES = 3
BASE_DELAY = 2  # seconds
MAX_DELAY = 10  # seconds

class RateLimiter:
    def __init__(self, requests_per_minute=30):
        self.requests_per_minute = requests_per_minute
        self.requests = []
        self.last_request_time = None
    
    def wait_if_needed(self):
        now = datetime.now()
        # Remove requests older than 1 minute
        self.requests = [t for t in self.requests if now - t < timedelta(minutes=1)]
        
        if len(self.requests) >= self.requests_per_minute:
            # Wait until the oldest request is more than 1 minute old
            wait_time = 60 - (now - self.requests[0]).total_seconds()
            if wait_time > 0:
                logger.info(f"Rate limit reached, waiting {wait_time:.1f} seconds")
                time.sleep(wait_time)
        
        # If this isn't the first request, ensure at least 100ms between requests
        if self.last_request_time:
            elapsed = (now - self.last_request_time).total_seconds()
            if elapsed < 0.1:
                time.sleep(0.1 - elapsed)
        
        self.requests.append(now)
        self.last_request_time = now

# Global rate limiter instance
rate_limiter = RateLimiter()

async def search_web_ddg(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """
    Search the web for Japanese song lyrics using DuckDuckGo.
    
    Args:
        query (str): Search query for the song lyrics
        max_results (int): Maximum number of search results to return
        
    Returns:
        List[Dict[str, str]]: List of search results with title and url
    """
    logger.info(f"Starting web search for: {query}")
    
    # Add Japanese-specific keywords to improve results
    japanese_keywords = ["歌詞", "lyrics", "日本語"]
    enhanced_query = f"{query} {' '.join(japanese_keywords)}"
    logger.info(f"Enhanced query: {enhanced_query}")
    
    # Run the search in a thread pool since DDGS is synchronous
    logger.debug("Running DuckDuckGo search in thread pool")
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(None, _perform_search_with_retry, enhanced_query, max_results)
    
    logger.info(f"Found {len(results)} search results")
    for i, result in enumerate(results):
        logger.debug(f"Result {i+1}:\n  Title: {result['title']}\n  URL: {result['url']}\n  Snippet: {result['snippet'][:100]}...")
    
    return results

def _perform_search_with_retry(query: str, max_results: int) -> List[Dict[str, str]]:
    """
    Perform DuckDuckGo search with retry logic.
    """
    retry_count = 0
    while retry_count < MAX_RETRIES:
        try:
            # Apply rate limiting
            rate_limiter.wait_if_needed()
            
            # Attempt the search
            return _perform_search(query, max_results)
            
        except DuckDuckGoSearchException as e:
            retry_count += 1
            if "Ratelimit" in str(e):
                delay = min(BASE_DELAY * (2 ** retry_count), MAX_DELAY)
                logger.warning(f"Rate limit hit, retrying in {delay} seconds (attempt {retry_count}/{MAX_RETRIES})")
                time.sleep(delay)
            else:
                logger.error(f"DuckDuckGo search error: {e}")
                break
        except Exception as e:
            logger.error(f"Unexpected error during search: {e}")
            break
    
    return []

def _perform_search(query: str, max_results: int) -> List[Dict[str, str]]:
    """
    Perform the actual DuckDuckGo search.
    """
    results = []
    try:
        logger.debug(f"Opening DuckDuckGo session for query: {query}")
        with DDGS() as ddgs:
            logger.debug(f"Requesting {max_results} results from DuckDuckGo")
            for r in ddgs.text(query, max_results=max_results):
                result = {
                    "title": r['title'],
                    "url": r['link'],
                    "snippet": r['body']
                }
                results.append(result)
                logger.debug(f"Received result: {result['title']} ({result['url']})")
    except Exception as e:
        logger.error(f"Error during DuckDuckGo search: {str(e)}", exc_info=True)
        raise
    
    return results