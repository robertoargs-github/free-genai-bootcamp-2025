class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        
        // Text display properties
        this.textSpeed = 30; // ms per character
        this.dialogueText = null;
        this.nameText = null;
        this.typingEffect = null;
        this.isTyping = false;
        this.dialogueComplete = false;
        this.autoMode = false;
        this.skipMode = false;
        
        // Scene data
        this.currentScene = null;
        this.currentDialogueId = null;
        this.dialogueData = null;
        
        // UI elements
        this.dialogueBox = null;
        this.nameBox = null;
        this.choiceButtons = [];
        
        // Characters and backgrounds
        this.background = null;
        this.character = null;
        
        // Language settings
        this.languageMode = 'dual'; // 'japanese', 'english', or 'dual'
    }

    init(data) {
        // Initialize scene with provided data (sceneId)
        this.sceneId = data && data.sceneId ? data.sceneId : (config.gameSettings.currentScene || 'scene001');
        
        // Initialize or reset game state variables
        this.isTyping = false;
        this.dialogueComplete = false;
        this.choosingOption = false;
        this.autoAdvanceTimer = null;
        this.skipTimer = null;
        
        // Load language preference
        if (localStorage.getItem('japaneseVNSettings')) {
            try {
                const settings = JSON.parse(localStorage.getItem('japaneseVNSettings'));
                this.languageMode = settings.language || 'dual';
            } catch (e) {
                console.error('Error loading settings:', e);
                this.languageMode = 'dual';
            }
        }
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create the background
        this.createBackground();
        
        // Create character placeholder
        this.createCharacter();
        
        // Create UI elements (dialogue box, name box)
        this.createUI();
        
        // Create text objects for dialogue
        const dialogY = height - 120;
        
        // Japanese text (positioned above English text in dual mode)
        this.japaneseText = this.add.text(width / 2, dialogY - 30, '', {
            fontFamily: 'Noto Sans JP, Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);
        
        // English text
        this.dialogueText = this.add.text(width / 2, dialogY, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);
        
        // Name text
        this.nameText = this.add.text(width / 2 - 400, height - 190, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#222222',
            padding: { x: 10, y: 5 }
        });
        
        // Create UI control buttons
        this.createUIControls();
        
        // Load scene data
        const dataLoaded = this.loadSceneData();
        if (!dataLoaded) {
            console.error('Failed to load scene data');
            this.showNotification('Error: Failed to load scene data');
            return;
        }
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Start dialogue
        this.startDialogue();
    }

    update() {
        // This method is called every frame
        // Check if auto mode is enabled and current dialogue is complete
        if (this.autoMode && this.dialogueComplete && !this.choosingOption) {
            // Wait a moment before advancing to next dialogue
            if (!this.autoAdvanceTimer) {
                this.autoAdvanceTimer = this.time.addEvent({
                    delay: 2000, // 2 seconds
                    callback: () => {
                        this.advanceDialogue();
                        this.autoAdvanceTimer = null;
                    },
                    callbackScope: this
                });
            }
        }
    }
    
    createBackground() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add a default background if we can't find the proper one
        this.background = this.add.image(width / 2, height / 2, 'apartment')
            .setDisplaySize(width, height);
    }
    
    createCharacter() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Position for character (center, slightly lower than middle)
        const characterX = width / 2;
        const characterY = height / 2 + 100;
        
        // Add a default character sprite if needed
        this.character = this.add.image(characterX, characterY, 'alex')
            .setVisible(false); // Start hidden until we know which character to show
    }
    
    createUI() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create dialogue box at the bottom
        this.dialogueBox = this.add.image(width / 2, height - 120, 'dialog-box')
            .setDisplaySize(1000, 200);
        
        // Create name box on the left side of dialogue box
        this.nameBox = this.add.image(width / 2 - 400, height - 200, 'name-box')
            .setDisplaySize(200, 50);
    }
    
    createUIControls() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create control buttons (Auto, Skip, Save, Load, Settings)
        const buttonSpacing = 60;
        const buttonY = 40;
        const buttonSize = 40;
        
        // Auto button
        this.autoButton = this.add.image(width - buttonSpacing * 5, buttonY, 'auto-icon')
            .setDisplaySize(buttonSize, buttonSize)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('click');
                this.toggleAutoMode();
            });
        
        // Skip button
        this.skipButton = this.add.image(width - buttonSpacing * 4, buttonY, 'skip-icon')
            .setDisplaySize(buttonSize, buttonSize)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('click');
                this.toggleSkipMode();
            });
        
        // Save button
        this.saveButton = this.add.image(width - buttonSpacing * 3, buttonY, 'save-icon')
            .setDisplaySize(buttonSize, buttonSize)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('click');
                this.saveGame();
            });
        
        // Load button
        this.loadButton = this.add.image(width - buttonSpacing * 2, buttonY, 'load-icon')
            .setDisplaySize(buttonSize, buttonSize)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('click');
                this.loadGame();
            });
        
        // Settings button
        this.settingsButton = this.add.image(width - buttonSpacing, buttonY, 'settings-icon')
            .setDisplaySize(buttonSize, buttonSize)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('click');
                this.openSettings();
            });
        
        // Language toggle button
        this.languageButton = this.add.image(buttonSpacing, buttonY, 'language-icon')
            .setDisplaySize(buttonSize, buttonSize)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('click');
                this.toggleLanguage();
            });
        
        // Help button
        this.helpButton = this.add.image(buttonSpacing * 2, buttonY, 'help-icon')
            .setDisplaySize(buttonSize, buttonSize)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('click');
                this.scene.launch('LanguageHelp');
                this.scene.pause();
            });
    }
    
    loadSceneData() {
        // Load scene data from cache
        try {
            this.currentScene = this.cache.json.get(this.sceneId);
            if (!this.currentScene) {
                console.error(`Scene data not found for ${this.sceneId}`);
                return false;
            }
            
            // Update the current location background
            this.updateBackground(this.currentScene.location_id);
            
            // Update the current character
            this.updateCharacter(this.currentScene.character_id);
            
            // Set the initial dialogue
            this.dialogueData = this.currentScene.dialogue;
            this.currentDialogueId = '000'; // Start with the first dialogue
            
            return true;
        } catch (e) {
            console.error('Error loading scene data:', e);
            return false;
        }
    }
    
    updateBackground(locationId) {
        // Update the background image based on the location
        if (this.background && locationId) {
            this.background.setTexture(locationId);
        }
    }
    
    updateCharacter(characterId) {
        // Update the character image based on the character ID
        if (this.character && characterId) {
            this.character.setTexture(characterId);
            this.character.setVisible(true);
        }
    }
    
    startDialogue() {
        // Reset text elements
        this.dialogueText.setText('');
        this.japaneseText.setText('');
        this.nameText.setText('');
        
        // Clear any existing choices
        this.clearChoices();
        
        // Get the current dialogue node
        const dialogueNode = this.dialogueData[this.currentDialogueId];
        if (!dialogueNode) {
            console.error(`Dialogue node not found for ID: ${this.currentDialogueId}`);
            return;
        }
        
        // Set speaker name
        const speakerName = dialogueNode.speaker === 'player' ? 'You' : this.getSpeakerName(dialogueNode.speaker);
        this.nameText.setText(speakerName);
        
        // Display dialogue text with typing effect
        this.displayDialogue(dialogueNode);
    }
    
    getSpeakerName(speakerId) {
        // Convert speaker ID to display name
        const speakerMap = {
            'alex': 'Alex',
            'yamamoto': 'Yamamoto Sensei',
            'minji': 'Min-ji',
            'carlos': 'Carlos',
            'hiroshi': 'Hiroshi',
            'yuki': 'Yuki',
            'kenji': 'Kenji',
            'akiko': 'Akiko',
            'player': 'You'
        };
        
        return speakerMap[speakerId] || speakerId;
    }
    
    displayDialogue(dialogueNode) {
        // Stop any existing typing effect
        if (this.typingEffect) {
            this.typingEffect.stop();
        }
        
        // Reset typing state
        this.isTyping = true;
        this.dialogueComplete = false;
        
        // Get text based on language setting
        const japaneseText = dialogueNode.japanese || '';
        const englishText = dialogueNode.english || '';
        
        // Position the Japanese text above the English text
        const yOffset = this.languageMode === 'dual' ? -30 : 0;
        this.japaneseText.y = this.dialogueText.y + yOffset;
        
        // Set up the typing effect for Japanese text if needed
        if (this.languageMode === 'japanese' || this.languageMode === 'dual') {
            this.displayTextWithTypingEffect(this.japaneseText, japaneseText);
        }
        
        // Set up the typing effect for English text if needed
        if (this.languageMode === 'english' || this.languageMode === 'dual') {
            // If both languages are shown, delay the English slightly
            const delay = this.languageMode === 'dual' ? 500 : 0;
            
            this.time.delayedCall(delay, () => {
                this.displayTextWithTypingEffect(this.dialogueText, englishText, true);
            });
        }
    }
    
    displayTextWithTypingEffect(textObject, content, isEnglish = false) {
        // If skip mode is enabled, display the text instantly
        if (this.skipMode) {
            textObject.setText(content);
            if (isEnglish) {
                this.onTypingComplete();
            }
            return;
        }
        
        // Set up typing effect
        let currentChar = 0;
        const textSpeed = config.gameSettings.textSpeed || this.textSpeed;
        
        // Start typing sound
        const typingSound = this.sound.add('typing', {
            volume: 0.2,
            loop: true
        });
        typingSound.play();
        
        this.typingEffect = this.time.addEvent({
            delay: textSpeed,
            callback: () => {
                // Add the next character
                textObject.setText(content.substring(0, currentChar + 1));
                currentChar++;
                
                // Check if typing is complete
                if (currentChar >= content.length) {
                    typingSound.stop();
                    this.typingEffect.remove();
                    
                    // If this is the English text (or only text), mark dialogue as complete
                    if (isEnglish || this.languageMode === 'japanese') {
                        this.onTypingComplete();
                    }
                }
            },
            callbackScope: this,
            repeat: content.length - 1
        });
    }
    
    onTypingComplete() {
        // Mark dialogue as complete
        this.isTyping = false;
        this.dialogueComplete = true;
        
        // Check if there are choices to display
        const currentDialogue = this.dialogueData[this.currentDialogueId];
        if (currentDialogue.choices && currentDialogue.choices.length > 0) {
            this.showChoices(currentDialogue.choices);
        }
    }
    
    showChoices(choices) {
        // Mark that we're now choosing an option
        this.choosingOption = true;
        
        // Create buttons for each choice
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const startY = height - 280; // Position above the dialogue box
        const choiceSpacing = 60; // Vertical spacing between choices
        
        choices.forEach((choice, index) => {
            // Get text based on language mode
            let choiceText = '';
            
            if (this.languageMode === 'japanese') {
                choiceText = choice.japanese;
            } else if (this.languageMode === 'english') {
                choiceText = choice.english;
            } else {
                // Dual mode
                choiceText = `${choice.english}\n${choice.japanese}`;
            }
            
            // Create choice button
            const button = this.add.image(width / 2, startY - (index * choiceSpacing), 'choice-box')
                .setDisplaySize(800, 50)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    button.setTint(0xaaaaff);
                })
                .on('pointerout', () => {
                    button.clearTint();
                })
                .on('pointerdown', () => {
                    this.sound.play('click');
                    this.handleChoice(choice);
                });
                
            // Add text on top of button
            const text = this.add.text(width / 2, startY - (index * choiceSpacing), choiceText, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 780 }
            }).setOrigin(0.5);
            
            // Store reference to button and text for later removal
            this.choiceButtons.push({ button, text });
        });
    }
    
    handleChoice(choice) {
        // Clear choice buttons
        this.clearChoices();
        
        // Process the choice response if there is one
        if (choice.response) {
            // Display the response
            const dialogueNode = { ...choice.response };
            
            // Set speaker name
            const speakerName = dialogueNode.speaker === 'player' ? 'You' : this.getSpeakerName(dialogueNode.speaker);
            this.nameText.setText(speakerName);
            
            // Display response
            this.displayDialogue(dialogueNode);
            
            // Wait for player to click to continue
            this.input.once('pointerdown', () => {
                // Then proceed to the next dialogue
                if (choice.next_id) {
                    this.currentDialogueId = choice.next_id;
                    this.startDialogue();
                }
            });
        } else {
            // Just go to the next dialogue indicated by the choice
            if (choice.next_id) {
                this.currentDialogueId = choice.next_id;
                this.startDialogue();
            }
        }
        
        // No longer choosing an option
        this.choosingOption = false;
    }
    
    clearChoices() {
        // Remove all choice buttons and text
        this.choiceButtons.forEach(item => {
            item.button.destroy();
            item.text.destroy();
        });
        
        // Clear the array
        this.choiceButtons = [];
    }
    
    setupInputHandlers() {
        // Add click/tap handler to advance dialogue
        this.input.on('pointerdown', (pointer) => {
            // Ignore if clicking on a UI element
            if (this.isClickingUIElement(pointer)) {
                return;
            }
            
            // If text is still typing, complete it immediately
            if (this.isTyping) {
                this.completeTypingImmediately();
                return;
            }
            
            // If dialogue is complete and we're not choosing an option, advance
            if (this.dialogueComplete && !this.choosingOption) {
                this.advanceDialogue();
            }
        });
        
        // Add keyboard handlers
        this.input.keyboard.on('keydown-SPACE', () => {
            // Space advances dialogue just like clicking
            if (this.isTyping) {
                this.completeTypingImmediately();
            } else if (this.dialogueComplete && !this.choosingOption) {
                this.advanceDialogue();
            }
        });
        
        // ESC key to open settings
        this.input.keyboard.on('keydown-ESC', () => {
            this.openSettings();
        });
    }
    
    isClickingUIElement(pointer) {
        // Check if the pointer is over a UI button or choice button
        const uiButtons = [
            this.autoButton, this.skipButton, this.saveButton, 
            this.loadButton, this.settingsButton, this.languageButton, 
            this.helpButton
        ];
        
        // Check UI buttons
        for (const button of uiButtons) {
            if (button.getBounds().contains(pointer.x, pointer.y)) {
                return true;
            }
        }
        
        // Check choice buttons
        for (const item of this.choiceButtons) {
            if (item.button.getBounds().contains(pointer.x, pointer.y)) {
                return true;
            }
        }
        
        return false;
    }
    
    completeTypingImmediately() {
        // Stop the typing effect
        if (this.typingEffect) {
            this.typingEffect.remove();
        }
        
        // Get the current dialogue node
        const dialogueNode = this.dialogueData[this.currentDialogueId];
        
        // Show complete text immediately
        if (this.languageMode === 'japanese' || this.languageMode === 'dual') {
            this.japaneseText.setText(dialogueNode.japanese || '');
        }
        
        if (this.languageMode === 'english' || this.languageMode === 'dual') {
            this.dialogueText.setText(dialogueNode.english || '');
        }
        
        // Mark typing as complete
        this.isTyping = false;
        this.dialogueComplete = true;
        
        // Check for choices
        if (dialogueNode.choices && dialogueNode.choices.length > 0) {
            this.showChoices(dialogueNode.choices);
        }
    }
    
    advanceDialogue() {
        // Get the current dialogue node
        const currentDialogue = this.dialogueData[this.currentDialogueId];
        
        // Check if there's a next dialogue ID specified
        if (currentDialogue.default_next_id) {
            // Move to the next dialogue within this scene
            this.currentDialogueId = currentDialogue.default_next_id;
            this.startDialogue();
        } else if (currentDialogue.next_scene_id) {
            // Go to a new scene
            this.goToNextScene(currentDialogue.next_scene_id);
        } else {
            // No next dialogue specified, just return to menu for now
            // In a full game, you might handle this differently
            console.warn('No next dialogue or scene specified. Returning to menu.');
            this.scene.start('Menu');
        }
    }
    
    goToNextScene(sceneId) {
        // Save current progress
        this.saveGameState();
        
        // Mark current scene as completed
        if (!config.gameSettings.playerProgress.completedScenes.includes(this.sceneId)) {
            config.gameSettings.playerProgress.completedScenes.push(this.sceneId);
        }
        
        // Update current scene
        config.gameSettings.currentScene = sceneId;
        
        // Restart the game scene with the new scene ID
        this.scene.restart({ sceneId: sceneId });
    }
    
    saveGameState() {
        // Save the current game state to localStorage
        const saveData = {
            currentScene: config.gameSettings.currentScene,
            playerProgress: config.gameSettings.playerProgress
        };
        
        localStorage.setItem('japaneseVNSave', JSON.stringify(saveData));
    }
    
    saveGame() {
        // Save the current game state and show a notification
        this.saveGameState();
        
        // Show a save confirmation
        this.showNotification('Game saved!');
    }
    
    loadGame() {
        // Check if there's a saved game
        if (localStorage.getItem('japaneseVNSave')) {
            try {
                const savedGame = JSON.parse(localStorage.getItem('japaneseVNSave'));
                config.gameSettings.currentScene = savedGame.currentScene;
                config.gameSettings.playerProgress = savedGame.playerProgress;
                
                // Restart the scene with the saved scene
                this.scene.restart({ sceneId: savedGame.currentScene });
            } catch (e) {
                console.error('Error loading saved game:', e);
                this.showNotification('Error loading save!');
            }
        } else {
            this.showNotification('No saved game found!');
        }
    }
    
    showNotification(message) {
        // Show a temporary notification message
        const width = this.cameras.main.width;
        
        const notification = this.add.text(width / 2, 100, message, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // Fade out and destroy after a delay
        this.tweens.add({
            targets: notification,
            alpha: 0,
            delay: 1500,
            duration: 500,
            onComplete: () => {
                notification.destroy();
            }
        });
    }
    
    toggleAutoMode() {
        // Toggle auto mode on/off
        this.autoMode = !this.autoMode;
        
        // Update button appearance
        if (this.autoMode) {
            this.autoButton.setTint(0x7289DA);
            this.showNotification('Auto mode ON');
        } else {
            this.autoButton.clearTint();
            this.showNotification('Auto mode OFF');
            
            // Clear auto advance timer if it exists
            if (this.autoAdvanceTimer) {
                this.autoAdvanceTimer.remove();
                this.autoAdvanceTimer = null;
            }
        }
    }
    
    toggleSkipMode() {
        // Toggle skip mode on/off
        this.skipMode = !this.skipMode;
        
        // Update button appearance
        if (this.skipMode) {
            this.skipButton.setTint(0x7289DA);
            this.showNotification('Skip mode ON');
            
            // If currently typing, complete it immediately
            if (this.isTyping) {
                this.completeTypingImmediately();
            }
            
            // Set up a timer to auto-advance dialogue when in skip mode
            if (!this.skipTimer && this.dialogueComplete && !this.choosingOption) {
                this.advanceDialogue();
            }
        } else {
            this.skipButton.clearTint();
            this.showNotification('Skip mode OFF');
            
            // Clear skip timer if it exists
            if (this.skipTimer) {
                this.skipTimer.remove();
                this.skipTimer = null;
            }
        }
    }
    
    toggleLanguage() {
        // Cycle through language modes: dual -> japanese -> english -> dual
        if (this.languageMode === 'dual') {
            this.languageMode = 'japanese';
            this.showNotification('Japanese Only');
        } else if (this.languageMode === 'japanese') {
            this.languageMode = 'english';
            this.showNotification('English Only');
        } else {
            this.languageMode = 'dual';
            this.showNotification('Japanese & English');
        }
        
        // Update displayed text
        const currentDialogue = this.dialogueData[this.currentDialogueId];
        if (currentDialogue) {
            // Reset text
            this.dialogueText.setText('');
            this.japaneseText.setText('');
            
            // Update visibility based on language mode
            this.dialogueText.setVisible(this.languageMode === 'english' || this.languageMode === 'dual');
            this.japaneseText.setVisible(this.languageMode === 'japanese' || this.languageMode === 'dual');
            
            // Update text content
            if (this.languageMode === 'japanese' || this.languageMode === 'dual') {
                this.japaneseText.setText(currentDialogue.japanese || '');
            }
            
            if (this.languageMode === 'english' || this.languageMode === 'dual') {
                this.dialogueText.setText(currentDialogue.english || '');
            }
            
            // Update position
            const yOffset = this.languageMode === 'dual' ? -30 : 0;
            this.japaneseText.y = this.dialogueText.y + yOffset;
        }
        
        // Save language preference
        config.gameSettings.language = this.languageMode;
        localStorage.setItem('japaneseVNSettings', JSON.stringify({
            language: this.languageMode
        }));
    }
    
    openSettings() {
        // In a full implementation, this would open a settings menu
        // For now, we'll just show a notification
        this.showNotification('Settings would open here');
    }
}
