class SettingsUI {
    constructor() {
        
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