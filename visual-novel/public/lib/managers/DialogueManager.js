/**
 * DialogueManager.js
 * Handles dialogue display, progression, and choices
 */
class DialogueManager {
    constructor(globalManagers,scene) {
        this.g = globalManagers;
        this.scene = scene;
        
        this.sceneId = null; // this is the current scene
        
        // dialogueData[dialogueId] = dialogueNode
        this.dialogueData = null; // contains all dialogue data for the current scene.
        this.dialogueId = null; // this is the current dialogue
        this.dialogueNode = null; // this is the current dialogue node

        this.dialogueState = null; // contains the current dialogue state

        this.mappings = null; // contains character names and IDs
    }
    
    create() {
        // This will be called after the UI is created
        //const language = this.g.settings.get('language');
        //const textSpedd = this.g.settings.get('textSpeed');
        //const autoAdvanced = this.g.settings.get('autoAdvanced');
        //const autoSpeed = this.g.settings.get('autoSpeed');
        //const typewriterEffect = this.g.settings.get('typewriterEffect');
        this.loadMappings();
        this.loadSceneData();
        this.loadDialogueNode();
    }
    
    // checks if the dialogue is loaded for rendering.
    isLoaded(){
        return this.dialogueData && this.dialogueNode && this.mappings;
    }

    loadMappings(){
        this.mappings = this.scene.cache.json.get('mappings');
    }

    loadSceneData() {
        const sceneId = this.g.saves.get('sceneId');
        
        try {
            const cacheKey = `scene-${sceneId}`;
            this.dialogueData = this.scene.cache.json.get(cacheKey);
            if (!this.dialogueData) {
                console.error(`No dialogue data found for scene: ${cacheKey}`);
                return;
            }
            
            // Start from the beginning or from the saved position
            this.dialogueId = this.g.saves.get('dialogueId') || this.dialogueData.startAt;
        } catch (error) {
            console.error(`Error loading scene data for ${sceneId}:`, error);
        }
    }
    
    loadDialogueNode() {
        this.dialogueNode = this.dialogueData.dialogue[this.dialogueId];
        this.dialogueState = 'speaker'
        if (!this.dialogueNode) {
            console.error(`Dialogue node not found for ID: ${this.dialogueId}`);
            return;
        }
    }
   
    isChoices(){
        return this.dialogueNode.choices && this.dialogueNode.choices.length > 0;
    }    

    // next
    // choice
    // response
    advance(action,value=null) {
        console.log('advance',arguments)
        if (action == 'next') {
            // advance based on default_next_id
            
            // check if default_next_id exists if not throw an error.
            if (!this.dialogueNode.default_next_id){
                console.error('No default_next_id found for dialogue node:', this.dialogueNode);
                return;
            }

            this.dialogueId = this.dialogueNode.default_next_id;
            this.dialogueNode = this.dialogueData.dialogue[this.dialogueId];
        } else if (action == 'choice') {
            // we are assuming the choice is an integer
            const choice = this.dialogueData.dialogue[this.dialogueId].choices[value];
            // if there is a response we need to show it.
            // if we are advancing from response lets check for next_id otherwise fallback to default_next_id
        }
    }
    
    handleChoice(choice) {
        // Process the player's choice
        this.choosingOption = false;
        this.scene.uiManager.clearChoices();
        
        if (choice.next) {
            this.currentDialogueId = choice.next;
            this.startDialogue();
        } else if (choice.nextScene) {
            this.goToNextScene(choice.nextScene);
        } else {
            console.error('Choice has no next dialogue or scene', choice);
        }
    }
    
    goToNextScene(sceneId) {
        // Update game settings
        this.scene.gameSettings.currentScene = sceneId;
        this.scene.gameSettings.currentDialogueId = null; // Reset dialogue ID for new scene
        
        // Save the game state before changing scenes
        this.scene.saveManager.saveGameState();
        
        // Start transition to the new scene
        try {
            this.scene.sound.play('transition');
        } catch (e) {
            console.warn('Transition sound not available');
        }
        
        // Add a visual transition
        this.scene.cameras.main.fade(500, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                // Restart the current scene with the new scene data
                this.scene.scene.restart({
                    gameSettings: this.scene.gameSettings
                });
            }
        });
    }

    getJapaneseText(){
        return this.dialogueNode.japanese;
    }

    getEnglishText(){
        return this.dialogueNode.english;
    }

    getSpeakerName() {
        // get speakerId from dialogue node
        const speakerId = this.dialogueNode.speakerId;       

        if (speakerId == 'player') {
            return 'Player';
        }

        if (!this.mappings) {
            console.error('Mappings not loaded');
            return speakerId;
        }
        
        return this.mappings.characterNames[speakerId] || speakerId;
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = DialogueManager;
}
