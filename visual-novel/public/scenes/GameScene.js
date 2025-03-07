class GameScene extends BaseScene {
    constructor() {
        super({ key: 'Game' });
    }

    create(data) {
        this.g.audio.updateScene(this);
        this.g.ui.updateScene(this);

        this.loadGame(data.slot)

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.panel = this.add.rectangle(0, 0, width, height, 0x222222, 1).setOrigin(0, 0);

        this.dialogueManager = new DialogueManager(this.g,this);
        this.dialogueManager.create();

        this.backgroundManager = new BackgroundManager(this.g,this.dialogueManager,this);
        this.backgroundManager.create();

        this.characterManager = new CharacterManager(this.g,this.dialogueManager,this);
        this.characterManager.create(); // Create background and scene elements

        this.uiGameActions = new GameUIActions(this.g.ui, this);
        this.uiGameActions.create(width, 0);
        this.uiGameActions.show();

        this.uiSettings = new SettingsUI(this.g.ui, this);
        this.uiSettings.create(0, 0);
        this.uiSettings.hide();

        this.uiDialog = new DialogUI(this.g.ui,this.dialogueManager, this);
        this.uiDialog.create(0, height);
        this.uiDialog.show();

        //this.startGame(); // Start the story/dialogue flow
        super.create();
    }

    loadGame(slot){
        if (slot == 'new'){
            this.g.saves.new();   
        } else {
            this.g.save.load(slot)
        }
    }

    registerEvents() {
        this.g.eventBus.on('ui:button:gm-quick-save:pointdown',this.quickSave);
        this.g.eventBus.on('ui:button:gm-save:pointdown',this.save);
        this.g.eventBus.on('ui:button:gm-load:pointdown',this.load);
        this.g.eventBus.on('ui:button:gm-settings:pointdown',this.openSettings);
        this.g.eventBus.on('ui:button:settings-cancel:pointdown',this.cancelSettings);
        this.g.eventBus.on('ui:button:dialogue-next:pointdown',this.dialogNext);
    }


    dialogNext(ev){
        ev.scene.dialogueManager.advance('next');
    }

    openSettings(ev) {
        console.log('GameScene:open settings')
        ev.scene.uiGameActions.hide();
        ev.scene.uiSettings.show();
    }

    cancelSettings(ev){
        console.log('GameScene:cancel settings')
        ev.scene.uiGameActions.show();
        ev.scene.uiSettings.hide();
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
        this.uiDialog.update();
        // Let each manager update its state
        //this.dialogueManager.update();
        //this.inputManager.update();
        //this.uiManager.update();
        //this.audioManager.update();
        //this.characterManager.update();
    }
}
