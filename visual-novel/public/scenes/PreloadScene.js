class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();
        
        // Load UI assets
        this.loadUIAssets();
        
        // Load character images
        this.loadCharacterAssets();
        
        // Load background images
        this.loadBackgroundAssets();
        
        // Load audio assets
        this.loadAudioAssets();
        
        // Load story data
        this.loadStoryData();
        
        // Load fonts
        this.loadFonts();
    }

    create() {
        // Create animations if needed
        this.createAnimations();
        
        // Go to the menu scene when everything is loaded
        this.scene.start('Menu');
    }
    
    createLoadingBar() {
        // Create a loading bar using the images loaded in the boot scene
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Position the loading bar in the center of the screen
        const loadingBg = this.add.image(width / 2, height / 2, 'loading-bg');
        const loadingBar = this.add.image(width / 2 - 198, height / 2, 'loading-bar');
        loadingBar.setOrigin(0, 0.5);
        
        // Set up loading bar progress
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 200, height / 2 - 20, 400, 40);
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Percentage text
        const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);
        
        // Update the loading bar as assets are loaded
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x7289DA, 1);
            progressBar.fillRect(width / 2 - 198, height / 2 - 19, 396 * value, 38);
            percentText.setText(parseInt(value * 100) + '%');
            loadingBar.setScale(value, 1);
        });
        
        // Clean up when loading is complete
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            loadingBg.destroy();
            loadingBar.destroy();
        });
    }
    
    loadUIAssets() {
        // Load UI elements
        this.load.image('dialog-box', 'assets/ui/dialog-box.png');
        this.load.image('name-box', 'assets/ui/name-box.png');
        this.load.image('choice-box', 'assets/ui/choice-box.png');
        this.load.image('menu-bg', 'assets/ui/menu-background.png');
        this.load.image('button', 'assets/ui/button.png');
        this.load.image('button-hover', 'assets/ui/button-hover.png');
        this.load.image('settings-icon', 'assets/ui/settings-icon.png');
        this.load.image('language-icon', 'assets/ui/language-icon.png');
        this.load.image('save-icon', 'assets/ui/save-icon.png');
        this.load.image('load-icon', 'assets/ui/load-icon.png');
        this.load.image('auto-icon', 'assets/ui/auto-icon.png');
        this.load.image('skip-icon', 'assets/ui/skip-icon.png');
        this.load.image('help-icon', 'assets/ui/help-icon.png');
        this.load.image('next-button', 'assets/ui/next-button.png');
        this.load.image('next-button-hover', 'assets/ui/next-button-hover.png');
        
        // Create placeholder UI elements if they don't exist
        this.createPlaceholderUI();
    }
    
    loadCharacterAssets() {
        // Load character sprites
        const characters = [
            { id: 'alex', name: 'Alex Thompson' },
            { id: 'yamamoto', name: 'Yamamoto Sensei' },
            { id: 'minji', name: 'Kim Min-ji' },
            { id: 'carlos', name: 'Garcia Carlos' },
            { id: 'hiroshi', name: 'Tanaka Hiroshi' },
            { id: 'yuki', name: 'Nakamura Yuki' },
            { id: 'kenji', name: 'Suzuki Kenji' },
            { id: 'akiko', name: 'Watanabe Akiko' }
        ];
        
        characters.forEach(character => {
            this.load.image(character.id, `assets/characters/${character.id}.png`);
        });
    }
    
    loadBackgroundAssets() {
        // Load background images
        const backgrounds = [
            { id: 'apartment', name: 'Apartment Interior' },
            { id: 'classroom', name: 'Language School Classroom' },
            { id: 'cafe', name: 'Cafe Interior' },
            { id: 'post-office', name: 'Post Office Interior' },
            { id: 'store', name: 'Corner Store Interior' }
        ];
        
        backgrounds.forEach(bg => {
            this.load.image(bg.id, `assets/scenes/${bg.id}.jpg`);
        });
    }
    
    loadAudioAssets() {
        // Load sound effects
        this.load.audio('click', 'assets/audio/click.wav');
        this.load.audio('transition', 'assets/audio/transition.mp3');
        
        // Load background music - using a single background track
        this.load.audio('bg-music', 'assets/audio/bg.wav');
    }
    
    loadStoryData() {
        // Load all scene data
        this.load.json('scene001', 'data/scenes/scene001.json');
        // In a full game, you would load all scenes here
    }
    
    loadFonts() {
        // In Phaser, we don't directly load fonts, but we can ensure they're available
        // by adding a WebFont loader plugin or by using CSS (as we did in styles.css)
        // For now, we'll just log that we're "loading" fonts
        console.log('Ensuring fonts are loaded...');
    }
    
    createAnimations() {
        // Create any animations needed for the game
        // For a visual novel, this might be minimal, but could include
        // character entrance/exit animations, text effects, etc.
    }
    
    createPlaceholderUI() {
        // This function would generate placeholder UI elements if they don't exist
        // Similar to what we did in the BootScene
        console.log('Creating placeholder UI elements if needed');
        
        // In a real implementation, you would check if files exist and create them if not
        // For this demo, we'll assume they don't exist and create basic placeholders
        
        // For example, creating a dialog box placeholder:
        const dialogBox = document.createElement('canvas');
        dialogBox.width = 1000;
        dialogBox.height = 200;
        const dialogCtx = dialogBox.getContext('2d');
        dialogCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        dialogCtx.fillRect(0, 0, 1000, 200);
        dialogCtx.strokeStyle = '#ffffff';
        dialogCtx.lineWidth = 2;
        dialogCtx.strokeRect(2, 2, 996, 196);
        
        // Add the dialog box to the texture manager
        this.textures.addCanvas('dialog-box', dialogBox);
        
        // Create next button placeholder
        const nextButton = document.createElement('canvas');
        nextButton.width = 80;
        nextButton.height = 50;
        const nextButtonCtx = nextButton.getContext('2d');
        nextButtonCtx.fillStyle = '#0077cc';
        nextButtonCtx.fillRect(0, 0, 80, 50);
        nextButtonCtx.strokeStyle = '#ffffff';
        nextButtonCtx.lineWidth = 2;
        nextButtonCtx.strokeRect(2, 2, 76, 46);
        nextButtonCtx.fillStyle = '#ffffff';
        nextButtonCtx.font = '18px Arial';
        nextButtonCtx.textAlign = 'center';
        nextButtonCtx.textBaseline = 'middle';
        nextButtonCtx.fillText('Next', 40, 25);
        this.textures.addCanvas('next-button', nextButton);

        // Create next button hover placeholder
        const nextButtonHover = document.createElement('canvas');
        nextButtonHover.width = 80;
        nextButtonHover.height = 50;
        const nextButtonHoverCtx = nextButtonHover.getContext('2d');
        nextButtonHoverCtx.fillStyle = '#00aaff';
        nextButtonHoverCtx.fillRect(0, 0, 80, 50);
        nextButtonHoverCtx.strokeStyle = '#ffffff';
        nextButtonHoverCtx.lineWidth = 2;
        nextButtonHoverCtx.strokeRect(2, 2, 76, 46);
        nextButtonHoverCtx.fillStyle = '#ffffff';
        nextButtonHoverCtx.font = '18px Arial';
        nextButtonHoverCtx.textAlign = 'center';
        nextButtonHoverCtx.textBaseline = 'middle';
        nextButtonHoverCtx.fillText('Next', 40, 25);
        this.textures.addCanvas('next-button-hover', nextButtonHover);
        
        // Similarly for other UI elements...
    }
}
