// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
        parent: 'game-container',
        expandParent: true
    },
    scene: [], // Scenes will be added in main.js
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    // Game-specific global settings
    gameSettings: {
        language: 'dual', // 'japanese', 'english', or 'dual'
        textSpeed: 30,    // Text display speed (ms per character)
        autoAdvance: false, // Auto-advance dialogue
        sfxVolume: 0.2,   // Sound effects volume
        bgmVolume: 0.01,   // Background music volume
        fontSize: 24,     // Base font size
        currentChapter: 1,
        currentScene: 'scene001',
        playerProgress: {
            // Track player's progress and choices
            completedScenes: [],
            languageSkills: {
                reading: 0,
                writing: 0,
                speaking: 0,
                listening: 0,
                cultural: 0,
                practical: 0
            },
            // Track which branch the player is on
            currentPath: null, // 'study', 'culture', or 'practical'
            // Store important choices that affect the ending
            keyChoices: {}
        }
    }
};
