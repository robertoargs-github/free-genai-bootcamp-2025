/**
 * CharacterManager.js
 * Handles character and background display and updates
 */
class CharacterManager {
    constructor(scene) {
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;
        
        this.character = null;
        this.background = null;
        
        this.characterData = {
            'alex': { name: 'Alex Thompson', expression: 'neutral' },
            'yamamoto': { name: 'Yamamoto Sensei', expression: 'neutral' },
            'minji': { name: 'Kim Min-ji', expression: 'neutral' },
            'carlos': { name: 'Carlos Garcia', expression: 'neutral' },
            'hiroshi': { name: 'Tanaka Hiroshi', expression: 'neutral' },
            'yuki': { name: 'Nakamura Yuki', expression: 'neutral' },
            'kenji': { name: 'Suzuki Kenji', expression: 'neutral' },
            'akiko': { name: 'Watanabe Akiko', expression: 'neutral' }
        };
        
        this.backgroundData = {
            'apartment': { name: 'Apartment Interior' },
            'classroom': { name: 'Language School Classroom' },
            'cafe': { name: 'Cafe Interior' },
            'post-office': { name: 'Post Office Interior' },
            'store': { name: 'Corner Store Interior' }
        };
    }
    
    create() {
        this.createBackground();
        this.createCharacter();
    }
    
    createBackground() {
        // Default background
        this.background = this.scene.add.image(this.width / 2, this.height / 2, 'apartment')
            .setDisplaySize(this.width, this.height);
    }
    
    createCharacter() {
        // Position for character (center, slightly lower than middle)
        const characterX = this.width / 2;
        const characterY = this.height / 2 + 100;
        
        // Add a default character sprite if needed
        this.character = this.scene.add.image(characterX, characterY, 'alex')
            .setVisible(false); // Start hidden until we know which character to show
    }
    
    updateBackground(locationId) {
        if (!locationId || !this.backgroundData[locationId]) {
            console.warn(`Background not found for location: ${locationId}`);
            return;
        }
        
        try {
            // Fade out current background
            this.scene.tweens.add({
                targets: this.background,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    // Change texture and fade in
                    this.background.setTexture(locationId);
                    this.scene.tweens.add({
                        targets: this.background,
                        alpha: 1,
                        duration: 300
                    });
                }
            });
        } catch (error) {
            console.error(`Error updating background to ${locationId}:`, error);
            // Fallback: just change the texture
            this.background.setTexture(locationId);
        }
    }
    
    updateCharacter(characterId) {
        if (!characterId) {
            // Hide character if no ID provided
            if (this.character) {
                this.character.setVisible(false);
            }
            return;
        }
        
        if (!this.characterData[characterId]) {
            console.warn(`Character not found: ${characterId}`);
            return;
        }
        
        try {
            // If character is already visible, fade out first
            if (this.character.visible) {
                this.scene.tweens.add({
                    targets: this.character,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        this.showCharacter(characterId);
                    }
                });
            } else {
                this.showCharacter(characterId);
            }
        } catch (error) {
            console.error(`Error updating character to ${characterId}:`, error);
            // Fallback: just change the texture
            this.character.setTexture(characterId).setVisible(true);
        }
    }
    
    showCharacter(characterId) {
        // Update texture and fade in
        this.character.setTexture(characterId);
        this.character.setVisible(true);
        this.character.alpha = 0;
        
        this.scene.tweens.add({
            targets: this.character,
            alpha: 1,
            duration: 200
        });
    }
    
    // Method to handle character expressions if implemented
    setCharacterExpression(characterId, expression) {
        if (!characterId || !this.characterData[characterId]) {
            return;
        }
        
        // If we have different expression sprites, this is where we'd change them
        // For now, we'll just log it
        console.log(`Setting ${characterId} expression to ${expression}`);
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = CharacterManager;
}
