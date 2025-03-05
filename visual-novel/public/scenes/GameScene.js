class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        if (!window.eventBus) {
            window.eventBus = new EventBus();
        }
        this.eventBus = window.eventBus;
    }
    
    /**
     * Initialize all manager components
     */
    initializeManagers() {
        // Always create scene-specific managers
        this.uiManager = new UIManager(this);
        this.dialogueManager = new DialogueManager(this);
        this.characterManager = new CharacterManager(this);
        this.inputManager = new InputManager(this);
        this.notificationManager = new NotificationManager(this);
        this.storyManager = new StoryManager(this);
        this.sceneTransition = new SceneTransition(this);
    }
    
    /**
     * Set up event listeners for communication between modules
     */
    setupEventListeners() {
        eventBus.on('notification:show', data => { this.notificationManager.showNotification(data.message, data.options); });
        eventBus.on('scene:transition', data => { this.sceneTransition.transition(data.scene, data.data, data.config); });
        eventBus.on('dialogue:advance', () => { this.dialogueManager.advanceDialogue(); });
        eventBus.on('settings:language_changed', data => { this.languageManager.updateLanguageDisplay(data.language); });
        eventBus.on('dialogue:complete', this.storyManager.onDialogueComplete, this.storyManager);
        eventBus.on('choice:made', this.storyManager.onChoiceMade, this.storyManager);
        
        eventBus.on('ui:open-settings', () => { 
            console.log('Settings opened');
            // TODO: Implement settings functionality
        });
        
        eventBus.on('ui:toggle-language', () => { 
            console.log('Language toggled');
            if (this.settingsManager) {
                // Toggle between available languages (assuming settingsManager has this functionality)
                this.settingsManager.toggleLanguage();
            }
        });
    }

    init(data) {
        this.g = this.game.registry.get('globalManagers');
        //this.initializeManagers();
        //this.setupEventListeners();
    }

    create() {
        this.g.audio.updateScene(this);
        this.g.audio.createBgm();
        this.g.audio.playBgm();

        //this.inputManager.create();

        // specific managers for the game scene
        //this.uiManager.create(); // Create UI elements first
        //this.dialogueManager.create(); // loads the initial dialogue tree
        //this.characterManager.create(); // Create background and scene elements

        //this.startGame(); // Start the story/dialogue flow
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
        //this.dialogueManager.update();
        //this.inputManager.update();
        //this.uiManager.update();
        //this.audioManager.update();
        //this.characterManager.update();
    }
}
