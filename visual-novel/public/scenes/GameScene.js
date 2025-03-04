class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        
        // Initialize game settings
        this.gameSettings = {
            language: 'dual', // 'japanese', 'english', or 'dual'
            textSpeed: 30,   // ms per character
            bgmVolume: 0.5,  // Background music volume
            sfxVolume: 0.7   // Sound effects volume
        };
    }

    init(data) {
        window.eventBus = new EventBus();
        this.sceneId = data && data.sceneId ? data.sceneId : (config.gameSettings.currentScene || 'scene001');
        this.initializeManagers();
        this.setupEventListeners();
    }
    
    /**
     * Initialize all manager components
     */
    initializeManagers() {
        this.settingsManager = new SettingsManager(this);
        this.uiManager = new UIManager(this);
        this.dialogueManager = new DialogueManager(this);
        this.characterManager = new CharacterManager(this);
        this.saveManager = new SaveManager(this);
        this.inputManager = new InputManager(this);
        this.audioManager = new AudioManager(this);
        this.notificationManager = new NotificationManager(this);
        this.storyManager = new StoryManager(this);
        this.sceneTransition = new SceneTransition(this); // Todo maybe this is moved globally?
    }
    
    /**
     * Set up event listeners for communication between modules
     */
    setupEventListeners() {
        eventBus.on('notification:show', data => { this.notificationManager.showNotification(data.message, data.options); });
        eventBus.on('scene:transition', data => { this.sceneTransition.transition(data.scene, data.data, data.config); });
        eventBus.on('dialogue:advance', () => { this.dialogueManager.advanceDialogue(); });
        eventBus.on('settings:language_changed', data => { this.languageManager.updateLanguageDisplay(data.language); });
        eventBus.on('save:game', () => { this.saveManager.saveGame(); });
        eventBus.on('load:game', () => { this.saveManager.loadGame(); });
        eventBus.on('dialogue:complete', this.storyManager.onDialogueComplete, this.storyManager);
        eventBus.on('choice:made', this.storyManager.onChoiceMade, this.storyManager);
    }

    create() {
        this.settingsManager.create();
        this.uiManager.create(); // Create UI elements first
        this.dialogueManager.create(); // loads the initial dialogue tree
        this.characterManager.create(); // Create background and scene elements
        this.audioManager.setupAndPlayBackgroundMusic(); // Play background music
        this.inputManager.create();
        this.loadSavedState(); // Load saved state if available
        this.startGame(); // Start the story/dialogue flow
    }
    
    /**
     * Load any saved state from local storage
     */
    loadSavedState() {
        // Load any saved state via the save manager
        const hasSavedState = this.saveManager.hasSavedState();
        if (hasSavedState) {
            // Notify other modules that we're loading a saved state
            eventBus.emit('state:loading', { sceneId: this.sceneId });
            this.saveManager.loadStateForCurrentScene(this.sceneId);
        }
    }
    
    /**
     * Start the game/story flow
     */
    startGame() {
        // Set the current scene in the story manager
        this.storyManager.setCurrentScene(this.sceneId);
        
        // Load scene data (dialogue, characters, etc.)
        const dataLoaded = this.storyManager.loadSceneData(this.sceneId);
        
        if (!dataLoaded) {
            eventBus.emit('notification:show', { 
                message: 'Error: Failed to load scene data',
                options: { type: 'error' }
            });
            return;
        }
        
        // Start the dialogue flow
        this.dialogueManager.startDialogue();
    }

    update() {
        // Let each manager update its state
        this.dialogueManager.update();
        this.inputManager.update();
        this.uiManager.update();
        this.audioManager.update();
        this.characterManager.update();
    }
}
