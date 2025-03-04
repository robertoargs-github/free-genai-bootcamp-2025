/**
 * AudioManager.js
 * Handles background music and sound effects
 */
class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.bgMusic = null;
        this.soundEffects = {
            click: null,
            transition: null
        };
        
        // Get volume settings from game config
        this.bgmVolume = scene.gameSettings.bgmVolume || 0.05;
        this.sfxVolume = scene.gameSettings.sfxVolume || 0.2;
    }
    
    setupAnyPlayBackgroundMusic() {
        try {
            // Start background music and loop it
            this.bgMusic = this.scene.sound.add('bg-music', {
                volume: this.bgmVolume,
                loop: true
            });
            
            this.bgMusic.play();
        } catch (error) {
            console.error('Error setting up background music:', error);
        }
    }
    
    playSoundEffect(key, config = {}) {
        try {
            // Default volume is the global SFX volume
            const volume = config.volume || this.sfxVolume;
            
            // Play the sound effect
            this.scene.sound.play(key, {
                volume,
                ...config
            });
        } catch (error) {
            console.warn(`Error playing sound effect ${key}:`, error);
        }
    }
    
    stopBackgroundMusic() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }
    
    pauseBackgroundMusic() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.pause();
        }
    }
    
    resumeBackgroundMusic() {
        if (this.bgMusic && this.bgMusic.isPaused) {
            this.bgMusic.resume();
        }
    }
    
    setBgmVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        
        if (this.bgMusic) {
            this.bgMusic.setVolume(this.bgmVolume);
        }
        
        // Update game settings
        this.scene.gameSettings.bgmVolume = this.bgmVolume;
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update game settings
        this.scene.gameSettings.sfxVolume = this.sfxVolume;
    }
    
    // Method to play a click sound with error handling
    playClickSound() {
        try {
            this.playSoundEffect('click');
        } catch (e) {
            console.warn('Click sound not available');
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = AudioManager;
}
