class SettingsUI {
    constructor(UIManager, scene) {
        this.uim = UIManager;
        this.scene = scene;
    }

    create() {
        this.createBg();
        this.createSettingsFields();
        //this.createActions();
    }
    
    createSettingsFields() {
        const { width, height } = this.scene.game.canvas;
        
        // Create a fields container for all settings
        this.settingsFields = this.uim.createFields({
            position: [width * 0.3, height * 0.3],
            layout: 'vertical',
            spacing: 30  // Reduced spacing between fields
        });
        
        // Add BGM volume field
        this.createBgmVolumeSlider();
        
        // Add language toggle field
        this.createLanguageToggle();

        // Add Name input field
        this.createNameTextInput();
        
        // Future settings could be added here
        //this.createSfxVolumeSlider();
        //this.createFontSlider();
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

    createNameTextInput(){
        // Create a field with label and text input
        const nameInputField = this.uim.createField({
            label: 'Player Name',
            position: [0, 0],  // Position will be set by the Fields container
            inputType: 'textinput',
            spacing: 20,  // Space between label and input
            inputOptions: {
                size: [300, 40],        // Size of the text input
                placeholder: 'Enter your name...',
                defaultValue: this.scene.g.settings.get('playerName') || '',
                maxLength: 20,          // Limit characters
                eventHandle: 'settings-name',
                style: {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#000000'
                }
            }
        });

        // Add field to the container
        this.settingsFields.addField(nameInputField);

        // Listen for value changes
        this.scene.g.eventBus.on('ui:textinput:settings-name:change', (data) => {
            console.log('Name changed:', data.value);
            // Update the setting in real-time
            this.scene.g.settings.set('playerName', data.value);
        });

        // Listen for when user completes input (blur event)
        this.scene.g.eventBus.on('ui:textinput:settings-name:blur', (data) => {
            console.log('Final name:', data.value);
            // Save the setting when input is complete
            this.scene.g.settings.save();
        });
    }

    createBgmVolumeSlider(){
        // Calculate volume from settings (convert from 0-0.2 to 0-100)
        let volume = this.scene.g.settings.get('bgmVolume')
        volume = (volume / 0.2) * 100
        
        // Create a field with label and volume slider
        const bgmVolumeField = this.uim.createField({
            label: 'BGM Volume',
            position: [0, 0],  // Position will be set by the Fields container
            inputType: 'slider',
            spacing: 40,  // Space between label and slider
            inputOptions: {
                min: 0,
                max: 100,
                value: volume,
                size: [300, 30],         // Size of the slider
                eventHandle: "settings-bgm-volume",
                padding: 10              // Add padding to ensure handle is visible
            }
        });
        
        // Add field to the container
        this.settingsFields.addField(bgmVolumeField);
        
        // Store reference to the slider component
        this.bgmSlider = bgmVolumeField.getInput();
        
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
        // Create a field with label and language toggle
        const languageField = this.uim.createField({
            label: 'Language',
            position: [0, 0],  // Position will be set by the Fields container
            inputType: 'toggle',
            inputOptions: {
                values: ['English', 'Dual', 'Japanese'],  // The options to cycle through
                initialIndex: 0,                         // Start with English selected
                size: [90, 40],                          // Width, Height of each pill
                spacing: 5,                              // Space between pills
                eventHandle: 'language-setting'          // Event handle for identifying this toggle
            }
        });
        
        // Add field to the container
        this.settingsFields.addField(languageField);
        
        // Get the toggle component from the field
        const languageToggle = languageField.getInput();

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