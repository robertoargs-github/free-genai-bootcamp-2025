/**
 * SaveManager.js
 * Handles saving and loading game state
 */
class SaveManager {
    constructor(scene) {
        this.scene = scene;
        this.saveKey = 'visual-novel-save';
    }
    
    create() {
        // Nothing to set up in create
    }
    
    saveGameState() {
        // Save current game state to localStorage
        try {
            const saveData = {
                gameSettings: this.scene.gameSettings,
                timestamp: new Date().toLocaleString()
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('Game state saved successfully');
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }
    
    loadGameState() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            
            if (!saveData) {
                console.log('No saved game found');
                return null;
            }
            
            const parsedData = JSON.parse(saveData);
            console.log('Game state loaded successfully');
            return parsedData;
        } catch (error) {
            console.error('Error loading game state:', error);
            return null;
        }
    }
    
    saveGame() {
        this.saveGameState();
        this.scene.uiManager.showNotification('Game saved!');
    }
    
    loadGame() {
        const saveData = this.loadGameState();
        
        if (!saveData) {
            this.scene.uiManager.showNotification('No saved game found!');
            return;
        }
        
        // Update game settings with saved data
        this.scene.gameSettings = saveData.gameSettings;
        
        // Show notification
        this.scene.uiManager.showNotification('Game loaded!');
        
        // Play transition sound
        try {
            this.scene.sound.play('transition');
        } catch (e) {
            console.warn('Transition sound not available');
        }
        
        // Add a visual transition
        this.scene.cameras.main.fade(500, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                // Restart the current scene with the loaded game settings
                this.scene.scene.restart({
                    gameSettings: this.scene.gameSettings
                });
            }
        });
    }
    
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = SaveManager;
}
