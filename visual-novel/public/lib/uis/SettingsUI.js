class SettingsUI {
    constructor(UIManager, scene) {
        this.uim = UIManager;
        this.scene = scene;
    }

    create() {
        this.createBg();
        this.createLanguageToggle();
        this.createBgmVolumeSlider();
        //this.createSfxVolumeSlider();
        //this.createFontSlider();
        //this.createActions();
    }

    show(){

    }

    hide(){

    }

    createBg(){
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const x = 0;
        const y = 0;

        const panel = this.scene.add.rectangle(x, y, width, height, 0x222222, 1).setOrigin(0, 0);
        // Title
        const title = this.scene.add.text(x, y - height / 2 + 30, 'Settings', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
    }

    createBgmVolumeSlider(){
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create label for the slider
        const label = this.scene.add.text(width * 0.3, height * 0.3, 'BGM Volume', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        let volume = this.scene.g.settings.get('bgmVolume')
        volume = (volume / 0.2) * 100
        // Create slider with proper positioning
        this.bgmSlider = this.uim.createSlider({
            min: 0,
            max: 100,
            value: volume,
            position: [width * 0.3, height * 0.3 + 40], // Position below the label with some padding
            size: [300, 30],                          // Reasonable size for a slider
            eventHandle: "settings-bgm-volume",
            padding: 10                               // Add padding to ensure handle is visible
        });
        
        // Listen for changes to update settings
        this.scene.g.eventBus.on('ui:slider:settings-bgm-volume:change', (data) => {
            // Update BGM volume in settings manager
            if (this.scene.g.settings) {
                // the data.value represent 0 to 100%
                // but the value range of set audio for bgm is 0 to 0.2
                const value = (data.value / 100) * 0.2
                this.scene.g.audio.setBgmVolume(value);
            }
        });
    }

    createLanguageToggle(){
        // Create a language toggle using the generic UIToggle
        const languageToggle = this.uim.createToggle({
            values: ['English', 'Dual', 'Japanese'],  // The options to cycle through
            initialIndex: 0,                         // Start with English selected
            position: [100, 200],                    // X, Y position
            size: [200, 40],                         // Width, Height
            eventHandle: 'language-setting'          // Event handle for identifying this toggle
        });

        // Listen for changes
        this.scene.g.eventBus.on('ui:toggle:language-setting:change', (data) => {
            console.log(`Language changed to: ${data.value}`);
            // Update game language based on selection
            //updateGameLanguage(data.value);
        });
    }

    createActions(){
        this.createButtonApply();
        this.createButtonCancel();
    }

    createButtonApply(){
        const x = 100
        const y = 100
        const buttonWidth = 300;
        const buttonHeight = 80;
        this.uim.createButton({
            text: "Apply",
            size: [buttonWidth,buttonHeight],
            position: [x, y],
            eventHandle: "settings-apply"
        })
    }

    createButtonCancel(){
        const x = 100
        const y = 100
        const buttonWidth = 300;
        const buttonHeight = 80;
        this.uim.createButton({
            text: "Cancel",
            size: [buttonWidth,buttonHeight],
            position: [x, y],
            eventHandle: "settings-cancel"
        })
    }


}