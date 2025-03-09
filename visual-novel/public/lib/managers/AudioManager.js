/**
 * AudioManager.js
 * Handles background music and sound effects
 */
class AudioManager {
    constructor(globalManagers) {
        this.g = globalManagers;
        this.scene = null; // Initialize scene to null
        this.bgMusic = null;
        this.sfxAudios = {};
        this.voiceAudios = {};
        this.audioTimeUpdateEvent = null; // to track when audio is playing
        this.soundEffects = {
            click: null,
            transition: null
        };
    }

    create(){
        this.createBgm();
        this.createSfxAudios();
    }

    createDialog(dialogKeys){
        this.voiceAudios = {};
        const volume = this.g.settings.get('voiceVolume');
        for (const dialogKey of dialogKeys) {
            const audio = this.scene.sound.add(dialogKey,{ volume});
            this.voiceAudios[dialogKey] = audio;
        }
    }

    
    // Called when audio completes playing
    onAudioComplete() {
        if (this.audioTimeUpdateEvent) {
          this.audioTimeUpdateEvent.remove();
          this.audioTimeUpdateEvent = null;
        }
        
        this.g.eventBus.emit('ui:sentence:clear-highlighting');
        this.resetWordColors();
        this.isPlaying = false;
      }

    createSfxAudios () {
        try {
            for (const audioAsset of window.audioAssets) {
                const volume = this.g.settings.get('sfxVolume');
                this.sfxAudios[audioAsset.id] = this.scene.sound.add(audioAsset.id, {
                    volume
                });
            }
        } catch (error) {
            console.error('Error setting up sound effects:', error);
        }
    }

    createBgm () {
        try {
            const volume = this.g.settings.get('bgmVolume');
            this.bgMusic = this.scene.sound.add('bg-music', {
                volume,
                loop: true
            });
        } catch (error) {
            console.error('Error setting up background music:', error);
        }
    }
    
    
    /**
     * Update the scene reference
     * @param {Phaser.Scene} scene - The new scene
     */
    updateScene(scene) {
        this.scene = scene;
    }
    
    playSoundEffect(key, config = {}) {
        try {
            const volume = this.g.settings.get('sfxVolume');
            
            // Play the sound effect
            this.sfxAudios[key].play({
                volume,
                ...config
            });
        } catch (error) {
            console.warn(`Error playing sound effect ${key}:`, error);
        }
    }
    
    playDialog(sceneId,voiceKey) {
        const key = `dialog-${sceneId}-${voiceKey}`
        try {
            const volume = this.g.settings.get('voiceVolume');
            this.voiceAudios[key].play({
                volume,
                loop: false
            });
        } catch (error) {
            console.warn(`Error playing sound effect ${key}:`, error);
        }
    }
    
    playBgm () {
        if (this.bgMusic && !this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }
    }

    stopBgm() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }
    
    pauseBgm() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.pause();
        }
    }
    
    resumeBgm() {
        if (this.bgMusic && this.bgMusic.isPaused) {
            this.bgMusic.resume();
        }
    }
    
    setBgmVolume(volume) {
        const adjustedVolume = Math.max(0, Math.min(1, volume));
        this.bgMusic.setVolume(adjustedVolume);
    }
    
    setSfxVolume(volume) {
        const adjustedVolume = Math.max(0, Math.min(1, volume));
        for (const audioAsset of window.audioAssets) {
            this.sfxAudios[audioAsset.id].setVolume(adjustedVolume);
        }
    }

    setVoiceVolume(volume){
        const adjustedVolume = Math.max(0, Math.min(1, volume));
        //this.voiceSound.setVolume(adjustedVolume);

    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = AudioManager;
}
