class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
    }
    
    init() {
        // Ensure event bus exists
        if (!window.eventBus) {
            window.eventBus = new EventBus();
        }
        
        // Get reference to event bus
        this.eventBus = window.eventBus;
        
        // Get global managers from registry
        this.g = this.game.registry.get('globalManagers');
    }

    create() {
        // Set up audio
        this.g.audio.updateScene(this);
        this.g.audio.createBgm();
        this.g.audio.playBgm();

        // Set up UI
        this.g.ui.updateScene(this);

        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add background image
        this.add.image(width / 2, height / 2, 'menu-bg')
            .setDisplaySize(width, height);
        
        // Add title text
        this.add.text(width / 2, height / 4, '日本語学習ビジュアルノベル', {
            fontFamily: 'Noto Sans JP',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 4 + 60, 'Japanese Language Learning Visual Novel', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        
        // Create menu UI with buttons
        this.ui = new MenuUI(this.g.ui, this);
        this.ui.create(width/2, height/2); // Center the menu in the scene
        this.ui.show();

        this.uiSettings = new SettingsUI(this.g.ui, this);
        this.uiSettings.create();
        this.uiSettings.hide();
    }
    

    
    /**
     * Start a new game
     */
    startNewGame() {
        // Create a new save in slot 1 with default values
        this.g.saves.save(1, this.g.saves.defaultSave);
        
        // Play a sound effect if available
        if (this.g.audio) {
            this.g.audio.playSoundEffect('click');
        }
        
        // Show a transition effect
        this.cameras.main.fade(500, 0, 0, 0);
        
        // Start the game scene
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Game', { sceneId: 'scene001' });
        });
    }
    
    /**
     * Continue from a saved game
     */
    continueGame() {
        // Load save from slot 1
        const saveData = this.g.saves.load(1);
        
        if (saveData) {
            // Play a sound effect if available
            if (this.g.audio) {
                this.g.audio.playSoundEffect('click');
            }
            
            // Show a transition effect
            this.cameras.main.fade(500, 0, 0, 0);
            
            // Start the game scene with the saved data
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Game', { 
                    sceneId: saveData.currentScene || 'scene001',
                    saveData: saveData
                });
            });
        } else {
            // No save data found, show a notification
            if (this.g.ui) {
                this.g.ui.showNotification('No save data found!');
            }
        }
    }
    
    /**
     * Open the settings panel
     */
    openSettings() {
        // Trigger settings UI to open via event bus
        if (window.eventBus) {
            window.eventBus.emit('settings:open');
        }
    }
    
    openLanguageHelp() {
        // Switch to the language help scene
        this.scene.start('LanguageHelp');
    }
}
