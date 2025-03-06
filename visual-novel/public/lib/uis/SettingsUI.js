
class SettingsUI extends BaseUI {
    constructor(UIManager, scene) {
        super(scene); // Call BaseUI constructor
        this.uim = UIManager;
    }

    create() {
        this.createBg();
        this.createSettingsFields();
        this.createActions();
    }
    
    createSettingsFields() {
        const { width, height } = this.scene.game.canvas;
        
        // Create a fields container for all settings
        this.settingsFields = this.uim.createFields({
            position: [width * 0.5, height * 0.3], // Centered horizontally
            layout: 'vertical',
            spacing: 30  // Reduced spacing between fields
        });
        
        // Register the fields container with BaseUI
        this.registerElement(this.settingsFields);
        
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

    // Override show method to add any specific behavior
    show() {
        super.show(); // Call BaseUI's show method
    }

    // Override hide method to add any specific behavior
    hide() {
        super.hide(); // Call BaseUI's hide method
    }

    createBg(){
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const x = width / 2;
        const y = height / 2;

        // Create panel background with semi-transparency
        this.panel = this.scene.add.rectangle(x, y, width, height, 0x222222, 0.9);
        
        // Create title text
        this.title = this.scene.add.text(x, y - height / 2 + 30, 'Settings', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        // Register these elements with BaseUI so they respond to show/hide
        this.registerElement(this.panel);
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
        // Create our actions withint horizontal fields container
        // position in the bottom left of the screen.
        const { width, height } = this.scene.game.canvas;
        this.actionsContainer = this.uim.createFields({
            position: [width * 0.1, height * 0.9],
            layout: 'horizontal',
            spacing: 20
        });
        this.registerElement(this.actionsContainer);
        this.createButtonApply();
        this.createButtonCancel();
    }

    createButtonApply(){
        const buttonWidth = 300;
        const buttonHeight = 80;
        const buttonField = this.uim.createField({
            inputType: 'button',
            position: [0, 0],
            inputOptions: {
                text: "Apply",
                size: [buttonWidth,buttonHeight],
                eventHandle: "settings-apply"
            }
        })
        this.actionsContainer.addField(buttonField);
    }

    createButtonCancel(){
        const buttonWidth = 300;
        const buttonHeight = 80;
        const buttonField = this.uim.createField({
            inputType: 'button',
            position: [0, 0],
            inputOptions: {
                text: "Cancel",
                size: [buttonWidth,buttonHeight],
                eventHandle: "settings-cancel"
            }
        })
        this.actionsContainer.addField(buttonField);
    }

}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = SettingsUI;
}

