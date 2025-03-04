/**
 * GameScene.js
 * Main game scene that orchestrates all the different systems
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        
        // Core Systems
        this.uiManager = null;
        this.dialogueManager = null;
        this.characterManager = null;
        this.inputManager = null;
        this.saveManager = null;
        this.audioManager = null;
        this.settingsManager = null;
        
        // UI Systems
        this.notificationManager = null;
        
        // Utility Systems
        this.assetLoader = null;
        this.sceneTransition = null;
        
        // Game state
        this.gameSettings = null;
        this.autoMode = false;
        this.skipMode = false;
        
        // UI elements
        this.japaneseText = null;
        this.englishText = null;
        this.nameText = null;
        this.choiceButtons = [];
    }
    
    init(data) {
        // Initialize with scene data
        this.gameSettings = data.gameSettings || config.gameSettings;
        
        // Create all the core managers
        this.uiManager = new UIManager(this);
        this.dialogueManager = new DialogueManager(this);
        this.characterManager = new CharacterManager(this);
        this.inputManager = new InputManager(this);
        this.saveManager = new SaveManager(this);
        this.audioManager = new AudioManager(this);
        this.settingsManager = new SettingsManager(this);
        
        // Create UI managers
        this.notificationManager = new NotificationManager(this);
        
        // Create utility managers
        this.assetLoader = new AssetLoader(this);
        this.sceneTransition = new SceneTransition(this);
    }
    
    create() {
        // Initialize all systems in the correct order
        
        // 1. Set up the character and background first
        this.characterManager.create();
        
        // 2. Set up the UI elements
        this.uiManager.create();
        this.uiManager.createDialogueText();
        this.notificationManager.create();
        
        // 3. Set up the input handlers
        this.inputManager.create();
        
        // 4. Set up the audio
        this.audioManager.create();
        
        // 5. Apply settings
        this.settingsManager.create();
        
        // 6. Start the dialogue system last
        this.dialogueManager.create();
        
        // 7. Show welcome notification
        this.notificationManager.showNotification('Game loaded successfully');
        
        // 8. Subscribe to the event bus
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for events from other modules
        eventBus.on('dialogue:complete', this.onDialogueComplete, this);
        eventBus.on('choice:selected', this.onChoiceSelected, this);
        eventBus.on('settings:changed', this.onSettingsChanged, this);
    }
    
    onDialogueComplete() {
        // Handle dialogue completion event
        if (this.autoMode) {
            this.time.delayedCall(this.settingsManager.getSetting('autoSpeed'), this.dialogueManager.advanceDialogue, [], this.dialogueManager);
        }
    }
    
    onChoiceSelected(choice) {
        // Handle choice selection event
        this.dialogueManager.handleChoice(choice);
    }
    
    onSettingsChanged(settings) {
        // Handle settings change event
        this.settingsManager.applySettings();
    }
    
    update() {
        // Check for auto mode and skip mode updates
        if (this.skipMode && this.dialogueManager.dialogueComplete && !this.dialogueManager.choosingOption) {
            this.dialogueManager.advanceDialogue();
        }
    }
    
    // Game control methods
    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        this.skipMode = false; // Turn off skip mode if auto mode is enabled
        
        this.notificationManager.showNotification(`Auto Mode: ${this.autoMode ? 'ON' : 'OFF'}`);
        
        // If turning on auto mode and dialogue is complete, advance
        if (this.autoMode && this.dialogueManager.dialogueComplete && !this.dialogueManager.choosingOption) {
            this.time.delayedCall(this.settingsManager.getSetting('autoSpeed') || 2000, () => {
                this.dialogueManager.advanceDialogue();
            }, [], this);
        }
    }
    
    toggleSkipMode() {
        this.skipMode = !this.skipMode;
        this.autoMode = false; // Turn off auto mode if skip mode is enabled
        
        this.notificationManager.showNotification(`Skip Mode: ${this.skipMode ? 'ON' : 'OFF'}`);
        
        // If turning on skip mode and dialogue is complete, advance immediately
        if (this.skipMode && this.dialogueManager.dialogueComplete && !this.dialogueManager.choosingOption) {
            this.dialogueManager.advanceDialogue();
        }
    }
    
    toggleLanguage() {
        // Cycle through language modes: japanese -> english -> dual
        switch (this.gameSettings.language) {
            case 'japanese':
                this.gameSettings.language = 'english';
                break;
            case 'english':
                this.gameSettings.language = 'dual';
                break;
            case 'dual':
                this.gameSettings.language = 'japanese';
                break;
        }
        
        // Show notification of language change
        this.notificationManager.showNotification(`Language: ${this.gameSettings.language.toUpperCase()}`);
        
        // Update settings
        this.settingsManager.updateSetting('language', this.gameSettings.language);
        
        // Use scene transition for smoother experience
        this.sceneTransition.restartScene({
            gameSettings: this.gameSettings
        });
    }
    
    openSettings() {
        // Create settings panel
        const settingsPanel = this.settingsManager.createSettingsPanel(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        );
    }
    
    shutdown() {
        // Clean up event listeners when the scene shuts down
        eventBus.off('dialogue:complete', this.onDialogueComplete, this);
        eventBus.off('choice:selected', this.onChoiceSelected, this);
        eventBus.off('settings:changed', this.onSettingsChanged, this);
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = GameScene;
}
