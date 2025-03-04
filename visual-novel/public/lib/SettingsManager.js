/**
 * SettingsManager.js
 * Handles game settings and preferences
 */
class SettingsManager {
    constructor(scene) {
        this.scene = scene;
        this.settingsKey = 'visual-novel-settings';
        
        // Default settings
        this.defaultSettings = {
            language: 'english',   // english, japanese, dual
            textSpeed: 30,         // ms per character
            autoSpeed: 2000,       // ms to wait before advancing in auto mode
            bgmVolume: 0.05,       // 0-1
            sfxVolume: 0.2,        // 0-1
            fullscreen: false,     // fullscreen mode
            typewriterEffect: true, // use typewriter effect for text
            quickSkip: false       // skip already read text
        };
        // Current settings
        this.settings = { ...this.defaultSettings };
    }
    
    /**
     * Initialize the settings manager
     */
    create() {
        this.loadSettings();
        this.applySettings();
    }
    
    /**
     * Load settings from local storage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem(this.settingsKey);
            
            if (savedSettings) {
                this.settings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
                console.log('Settings loaded successfully');
            } else {
                console.log('No saved settings found, using defaults');
                this.settings = { ...this.defaultSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = { ...this.defaultSettings };
        }
        
        return this.settings;
    }
    
    /**
     * Save settings to local storage
     */
    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    /**
     * Apply current settings to the game
     */
    applySettings() {
        // Apply audio settings
        if (this.scene.audioManager) {
            this.scene.audioManager.setBgmVolume(this.settings.bgmVolume);
            this.scene.audioManager.setSfxVolume(this.settings.sfxVolume);
        }
        
        // Apply fullscreen setting
        if (this.settings.fullscreen && !this.scene.scale.isFullscreen) {
            this.scene.scale.startFullscreen();
        }
        
        // Apply text speed to dialogue manager
        if (this.scene.dialogueManager) {
            this.scene.dialogueManager.textSpeed = this.settings.textSpeed;
        }
    }
    
    /**
     * Reset settings to defaults
     */
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettings();
    }
    
    /**
     * Get a specific setting
     * @param {string} key - Setting key
     * @returns {any} Setting value
     */
    getSetting(key) {
        return this.settings[key];
    }
    
    /**
     * Update a specific setting
     * @param {string} key - Setting key
     * @param {any} value - New setting value
     */
    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveSettings();
            this.applySettings();
        }
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        const scale = this.scene.scale;
        
        if (scale.isFullscreen) {
            scale.stopFullscreen();
            this.settings.fullscreen = false;
        } else {
            scale.startFullscreen();
            this.settings.fullscreen = true;
        }
        
        this.saveSettings();
    }
    
    /**
     * Create a settings panel UI
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {object} Settings panel objects
     */
    createSettingsPanel(x, y) {
        const width = 500;
        const height = 400;
        
        // Background
        const panel = this.scene.add.rectangle(x, y, width, height, 0x000000, 0.8)
            .setOrigin(0.5, 0.5);
        
        // Title
        const title = this.scene.add.text(x, y - height / 2 + 30, 'Settings', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        // Close button
        const closeBtn = this.scene.add.rectangle(x + width / 2 - 20, y - height / 2 + 20, 30, 30, 0xff0000, 1)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.hideSettingsPanel(panel, title, closeBtn);
            });
        
        // Close button text
        const closeBtnText = this.scene.add.text(x + width / 2 - 20, y - height / 2 + 20, 'X', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        // Settings items would go here (sliders, toggles, etc.)
        
        // Make panel interactive and draggable
        panel.setInteractive();
        this.scene.input.setDraggable(panel);
        
        // Handle dragging
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === panel) {
                panel.x = dragX;
                panel.y = dragY;
                title.x = dragX;
                title.y = dragY - height / 2 + 30;
                closeBtn.x = dragX + width / 2 - 20;
                closeBtn.y = dragY - height / 2 + 20;
                closeBtnText.x = dragX + width / 2 - 20;
                closeBtnText.y = dragY - height / 2 + 20;
                
                // Update positions of other settings elements here
            }
        });
        
        return { panel, title, closeBtn, closeBtnText };
    }
    
    /**
     * Hide the settings panel
     * @param {Phaser.GameObjects.Rectangle} panel - Settings panel
     * @param {Phaser.GameObjects.Text} title - Panel title
     * @param {Phaser.GameObjects.Rectangle} closeBtn - Close button
     */
    hideSettingsPanel(panel, title, closeBtn) {
        // Fade out and destroy
        this.scene.tweens.add({
            targets: [panel, title, closeBtn],
            alpha: 0,
            duration: 200,
            onComplete: () => {
                panel.destroy();
                title.destroy();
                closeBtn.destroy();
            }
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = SettingsManager;
}
