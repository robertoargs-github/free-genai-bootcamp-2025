class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
    }

    create() {
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
        
        // Create menu buttons
        this.createMenuButtons();
        
        // Add background music
        if (!this.sound.get('bg-music')) {
            this.sound.add('bg-music', {
                volume: config.gameSettings.bgmVolume,
                loop: true
            }).play();
        }
    }
    
    createMenuButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonStyle = {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        };
        
        // New Game button
        const newGameButton = this.add.image(width / 2, height / 2, 'button')
            .setDisplaySize(300, 60)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                newGameButton.setTexture('button-hover');
            })
            .on('pointerout', () => {
                newGameButton.setTexture('button');
            })
            .on('pointerdown', () => {
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                this.startNewGame();
            });
            
        this.add.text(width / 2, height / 2, 'New Game', buttonStyle)
            .setOrigin(0.5);
        
        // Continue button (only enabled if there's a save)
        const hasSave = localStorage.getItem('japaneseVNSave') !== null;
        const continueButton = this.add.image(width / 2, height / 2 + 80, 'button')
            .setDisplaySize(300, 60)
            .setInteractive({ useHandCursor: true })
            .setAlpha(hasSave ? 1 : 0.5)
            .on('pointerover', () => {
                if (hasSave) {
                    continueButton.setTexture('button-hover');
                }
            })
            .on('pointerout', () => {
                continueButton.setTexture('button');
            })
            .on('pointerdown', () => {
                if (hasSave) {
                    try {
                        this.sound.play('click');
                    } catch (e) {
                        console.warn('Click sound not available');
                    }
                    this.continueGame();
                }
            });
            
        this.add.text(width / 2, height / 2 + 80, 'Continue', buttonStyle)
            .setOrigin(0.5)
            .setAlpha(hasSave ? 1 : 0.5);
        
        // Settings button
        const settingsButton = this.add.image(width / 2, height / 2 + 160, 'button')
            .setDisplaySize(300, 60)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                settingsButton.setTexture('button-hover');
            })
            .on('pointerout', () => {
                settingsButton.setTexture('button');
            })
            .on('pointerdown', () => {
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                this.openSettings();
            });
            
        this.add.text(width / 2, height / 2 + 160, 'Settings', buttonStyle)
            .setOrigin(0.5);
        
        // Language Help button
        const helpButton = this.add.image(width / 2, height / 2 + 240, 'button')
            .setDisplaySize(300, 60)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                helpButton.setTexture('button-hover');
            })
            .on('pointerout', () => {
                helpButton.setTexture('button');
            })
            .on('pointerdown', () => {
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                this.openLanguageHelp();
            });
            
        this.add.text(width / 2, height / 2 + 240, 'Language Help', buttonStyle)
            .setOrigin(0.5);
    }
    
    startNewGame() {
        // Reset game progress
        config.gameSettings.currentScene = 'scene001';
        config.gameSettings.playerProgress = {
            completedScenes: [],
            languageSkills: {
                reading: 0,
                writing: 0,
                speaking: 0,
                listening: 0,
                cultural: 0,
                practical: 0
            },
            currentPath: null,
            keyChoices: {}
        };
        
        // Save initial state
        this.saveGameState();
        
        // Start the game scene
        this.scene.start('Game', { sceneId: 'scene001' });
    }
    
    continueGame() {
        // Load saved game state
        try {
            const savedGame = JSON.parse(localStorage.getItem('japaneseVNSave'));
            config.gameSettings.currentScene = savedGame.currentScene;
            config.gameSettings.playerProgress = savedGame.playerProgress;
            
            // Start the game scene with the saved scene
            this.scene.start('Game', { sceneId: savedGame.currentScene });
        } catch (e) {
            console.error('Error loading saved game:', e);
            // If there's an error, start a new game
            this.startNewGame();
        }
    }
    
    openSettings() {
        // In a full implementation, this would open a settings menu
        // For now, we'll just log that settings would be opened
        console.log('Settings menu would open here');
        
        // Create a simple settings overlay
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Semi-transparent background
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setInteractive();
        
        // Settings panel
        const panel = this.add.rectangle(width / 2, height / 2, 500, 400, 0x333333)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff);
        
        // Title
        this.add.text(width / 2, height / 2 - 160, 'Settings', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Close button
        const closeButton = this.add.text(width / 2 + 230, height / 2 - 180, 'X', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.sound.play('click');
            // Remove all settings elements
            overlay.destroy();
            panel.destroy();
            closeButton.destroy();
            // Remove any other settings elements...
        });
        
        // Add settings options here...
    }
    
    openLanguageHelp() {
        // Switch to the language help scene
        this.scene.start('LanguageHelp');
    }
    
    saveGameState() {
        // Save the current game state to localStorage
        const saveData = {
            currentScene: config.gameSettings.currentScene,
            playerProgress: config.gameSettings.playerProgress
        };
        
        localStorage.setItem('japaneseVNSave', JSON.stringify(saveData));
    }
}
