class MenuScene extends BaseScene {
    constructor() {
        super({ key: 'Menu' });
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
        super.create();
    }

    registerEvents() {
        this.g.eventBus.on('ui:button:new-game:pointdown',this.startGame);
        this.g.eventBus.on('ui:button:continue:pointdown',this.continueGame);
        this.g.eventBus.on('ui:button:load:pointdown',this.loadGame);
        this.g.eventBus.on('ui:button:settings:pointdown',this.openSettings);
        this.g.eventBus.on('ui:button:settings-cancel:pointdown',this.cancelSettings);
    }

    deregisterEvents() {
        this.g.eventBus.off('ui:button:new-game:pointdown',this.startGame);
        this.g.eventBus.off('ui:button:continue:pointdown',this.continueGame);
        this.g.eventBus.off('ui:button:load:pointdown',this.loadGame);
        this.g.eventBus.off('ui:button:settings:pointdown',this.openSettings);
        this.g.eventBus.off('ui:button:settings-cancel:pointdown',this.cancelSettings);
    }


    startGame(ev) {
        ev.scene.changeScene('Game', { slot: 'new' });
    }

    loadGame(ev){
        // show load settings screen.
    }

    continueGame(ev){
        ev.scene.changeScene('Game');
    }

    openSettings(ev) {
        console.log('MenuScene:open settings')
        ev.scene.ui.hide();
        ev.scene.uiSettings.show();
    }

    cancelSettings(ev){
        console.log('MenuScene:cancel settings')
        ev.scene.ui.show();
        ev.scene.uiSettings.hide();
    }

    continueGame(ev) {
        console.log('continue game')
        ev.scene.start('Game');
    }
}
