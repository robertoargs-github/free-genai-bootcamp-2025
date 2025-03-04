/**
 * DialogueManager.js
 * Handles dialogue display, progression, and choices
 */
class DialogueManager {
    constructor(scene) {
        this.scene = scene;
        
        // Text display properties
        this.textSpeed = scene.gameSettings.textSpeed || 30; // ms per character
        this.isTyping = false;
        this.dialogueComplete = false;
        this.choosingOption = false;
        
        // Scene data
        this.currentScene = null;
        this.currentDialogueId = null;
        this.dialogueData = null;
        this.typingEffect = null;
    }
    
    create() {
        // This will be called after the UI is created
        this.loadSceneData();
    }
    
    loadSceneData() {
        // Load the current scene data from the cache
        const sceneId = this.scene.gameSettings.currentScene;
        this.currentScene = sceneId;
        
        try {
            this.dialogueData = this.scene.cache.json.get(sceneId);
            if (!this.dialogueData) {
                console.error(`No dialogue data found for scene: ${sceneId}`);
                return;
            }
            
            // Start from the beginning or from the saved position
            this.currentDialogueId = this.scene.gameSettings.currentDialogueId || this.dialogueData.startAt;
            this.startDialogue();
        } catch (error) {
            console.error(`Error loading scene data for ${sceneId}:`, error);
        }
    }
    
    startDialogue() {
        if (!this.dialogueData || !this.currentDialogueId) {
            console.error('Cannot start dialogue: missing data or dialogue ID');
            return;
        }
        
        const dialogueNode = this.dialogueData.dialogue[this.currentDialogueId];
        if (!dialogueNode) {
            console.error(`Dialogue node not found for ID: ${this.currentDialogueId}`);
            return;
        }
        
        this.displayDialogue(dialogueNode);
    }
    
    displayDialogue(dialogueNode) {
        // If there's a character defined, update the character display
        if (dialogueNode.character) {
            this.scene.characterManager.updateCharacter(dialogueNode.character);
        }
        
        // If there's a location defined, update the background
        if (dialogueNode.location) {
            this.scene.characterManager.updateBackground(dialogueNode.location);
        }
        
        // Display the speaker's name
        const speakerName = this.getSpeakerName(dialogueNode.speaker);
        this.scene.nameText.setText(speakerName);
        
        // Display the dialogue text with typing effect
        if (this.scene.japaneseText && (this.scene.gameSettings.language === 'japanese' || this.scene.gameSettings.language === 'dual')) {
            this.displayTextWithTypingEffect(this.scene.japaneseText, dialogueNode.japanese || '');
        }
        
        if (this.scene.englishText && (this.scene.gameSettings.language === 'english' || this.scene.gameSettings.language === 'dual')) {
            this.displayTextWithTypingEffect(this.scene.englishText, dialogueNode.english || '', true);
        }
        
        // Save current position
        this.scene.gameSettings.currentDialogueId = dialogueNode.id;
        this.scene.saveManager.saveGameState();
    }
    
    displayTextWithTypingEffect(textObject, content, isEnglish = false) {
        // Clear any existing typing effect
        if (this.typingEffect) {
            this.typingEffect.stop();
        }
        
        // Reset text
        textObject.setText('');
        
        // Set up the typing effect
        this.isTyping = true;
        this.dialogueComplete = false;
        
        let currentCharIndex = 0;
        const totalChars = content.length;
        
        // Start the typing effect timer
        this.typingEffect = this.scene.time.addEvent({
            delay: this.textSpeed,
            callback: () => {
                // Add the next character
                if (currentCharIndex < totalChars) {
                    textObject.setText(textObject.text + content[currentCharIndex]);
                    currentCharIndex++;
                } else {
                    // Typing is complete
                    this.onTypingComplete();
                }
            },
            callbackScope: this,
            repeat: totalChars - 1
        });
    }
    
    onTypingComplete() {
        this.isTyping = false;
        this.dialogueComplete = true;
        
        // Auto-advance if in auto mode
        if (this.scene.autoMode) {
            this.scene.time.delayedCall(2000, this.advanceDialogue, [], this);
        }
        
        // Skip immediately if in skip mode
        if (this.scene.skipMode) {
            this.advanceDialogue();
        }
    }
    
    completeTypingImmediately() {
        if (!this.isTyping) return;
        
        // Stop the typing effect
        if (this.typingEffect) {
            this.typingEffect.remove();
            this.typingEffect = null;
        }
        
        // Show the full text immediately
        const dialogueNode = this.dialogueData.dialogue[this.currentDialogueId];
        
        if (dialogueNode) {
            if (this.scene.japaneseText && (this.scene.gameSettings.language === 'japanese' || this.scene.gameSettings.language === 'dual')) {
                this.scene.japaneseText.setText(dialogueNode.japanese || '');
            }
            
            if (this.scene.englishText && (this.scene.gameSettings.language === 'english' || this.scene.gameSettings.language === 'dual')) {
                this.scene.englishText.setText(dialogueNode.english || '');
            }
        }
        
        // Mark typing as complete
        this.onTypingComplete();
    }
    
    advanceDialogue() {
        if (!this.dialogueComplete || this.choosingOption) return;
        
        // Get the current dialogue node
        const currentNode = this.dialogueData.dialogue[this.currentDialogueId];
        
        // If there are choices, show them
        if (currentNode.choices && currentNode.choices.length > 0) {
            this.scene.uiManager.showChoices(currentNode.choices);
            return;
        }
        
        // If there's a next dialogue, go to it
        if (currentNode.next) {
            this.currentDialogueId = currentNode.next;
            this.startDialogue();
            return;
        }
        
        // If there's a next scene, go to it
        if (currentNode.nextScene) {
            this.goToNextScene(currentNode.nextScene);
            return;
        }
        
        // If we get here, the scenario is complete
        console.log('Scenario complete');
        this.scene.uiManager.showNotification('Scenario complete!');
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
    
    getSpeakerName(speakerId) {
        if (!speakerId) return '';
        
        // Get character data - in a more complex system, this might come from a separate data store
        const characterData = {
            'alex': 'Alex Thompson',
            'yamamoto': 'Yamamoto Sensei',
            'minji': 'Kim Min-ji',
            'carlos': 'Carlos Garcia',
            'hiroshi': 'Tanaka Hiroshi',
            'yuki': 'Nakamura Yuki',
            'kenji': 'Suzuki Kenji',
            'akiko': 'Watanabe Akiko',
            'narrator': 'Narrator'
        };
        
        return characterData[speakerId] || speakerId;
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = DialogueManager;
}
