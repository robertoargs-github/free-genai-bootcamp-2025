/**
 * UIManager.js
 * Manages all UI components in the game
 */
class DialogUI {
    constructor(scene) {
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;
        
        // Get reference to the event bus from the scene
        this.eventBus = window.eventBus;
        
        // UI components
        this.dialogueBox = null;
        this.nameBox = null;
        this.nextButton = null;
        this.controls = null;
        this.choiceSystem = null;
    }
    
    create() {
        this.createDialogueBox();
        this.createNameBox();
        this.createNextButton();
        this.createControls();
    }
    
    createDialogueBox() {
        this.dialogueBox = this.scene.add.image(this.width / 2, this.height - 120, 'dialog-box')
            .setDisplaySize(1000, 200);
    }
    
    createNameBox() {
        this.nameBox = this.scene.add.image(this.width / 2 - 400, this.height - 200, 'name-box')
            .setDisplaySize(200, 50);
    }
    
    createNextButton() {
        this.nextButton = this.scene.add.image(this.width / 2 + 400, this.height - 50, 'next-button')
            .setDisplaySize(80, 50)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.nextButton.setTexture('next-button-hover');
            })
            .on('pointerout', () => {
                this.nextButton.setTexture('next-button');
            })
            .on('pointerdown', () => {
                try {
                    this.scene.sound.play('click', { volume: 0.5 });
                } catch (e) {
                    console.warn('Click sound not available');
                }
                
                if (this.scene.dialogueManager.isTyping) {
                    this.scene.dialogueManager.completeTypingImmediately();
                    return;
                }
                
                if (this.scene.dialogueManager.dialogueComplete && !this.scene.dialogueManager.choosingOption) {
                    this.scene.dialogueManager.advanceDialogue();
                }
            });
    }
    
    createControls() {
        // Control panel at the bottom-right
        const buttonSpacing = 60;
        const buttonY = this.height - 40;
        const startX = this.width - 40;
        
        // Create UI control buttons using EventBus for communication
        this.autoButton = this.createControlButton(startX - (buttonSpacing * 0), buttonY, 'auto-icon', 
            () => this.eventBus.emit('ui:toggle-auto-mode'));
            
        this.skipButton = this.createControlButton(startX - (buttonSpacing * 1), buttonY, 'skip-icon', 
            () => this.eventBus.emit('ui:toggle-skip-mode'));
            
        this.saveButton = this.createControlButton(startX - (buttonSpacing * 2), buttonY, 'save-icon', 
            () => this.eventBus.emit('ui:save-game'));
            
        this.loadButton = this.createControlButton(startX - (buttonSpacing * 3), buttonY, 'load-icon', 
            () => this.eventBus.emit('ui:load-game'));
            
        this.settingsButton = this.createControlButton(startX - (buttonSpacing * 4), buttonY, 'settings-icon', 
            () => this.eventBus.emit('ui:open-settings'));
            
        this.languageButton = this.createControlButton(startX - (buttonSpacing * 5), buttonY, 'language-icon', 
            () => this.eventBus.emit('ui:toggle-language'));
            
        this.helpButton = this.createControlButton(startX - (buttonSpacing * 6), buttonY, 'help-icon', 
            () => this.eventBus.emit('ui:open-help'));
    }
    
    createControlButton(x, y, texture, callback) {
        return this.scene.add.image(x, y, texture)
            .setDisplaySize(40, 40)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', function() {
                this.setTint(0xdddddd);
            })
            .on('pointerout', function() {
                this.clearTint();
            })
            .on('pointerdown', () => {
                try {
                    this.scene.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                callback();
            });
    }
    
    showNotification(message, duration = 2000) {
        // Create notification text
        const notification = this.scene.add.text(this.width / 2, 100, message, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5, 0.5)
        .setAlpha(0);
        
        // Animation for notification
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            hold: duration - 600,
            onComplete: () => {
                notification.destroy();
            }
        });
    }
    
    createDialogueText() {
        // Create text objects for dialogue
        const textX = this.width / 2;
        const textY = this.height - 120;
        
        // Create text for Japanese (top) and English (bottom) if using dual mode
        if (this.scene.gameSettings.language === 'dual' || this.scene.gameSettings.language === 'japanese') {
            this.scene.japaneseText = this.scene.add.text(textX, textY - 30, '', {
                fontFamily: 'Noto Sans JP',
                fontSize: '28px',
                color: '#ffffff',
                align: 'left',
                wordWrap: { width: 900 }
            }).setOrigin(0.5, 0.5);
        }
        
        if (this.scene.gameSettings.language === 'dual' || this.scene.gameSettings.language === 'english') {
            this.scene.englishText = this.scene.add.text(textX, textY + 30, '', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'left',
                wordWrap: { width: 900 }
            }).setOrigin(0.5, 0.5);
        }
        
        // Create text for character name
        this.scene.nameText = this.scene.add.text(this.width / 2 - 400, this.height - 200, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
    }
    
    clearChoices() {
        if (this.scene.choiceButtons) {
            this.scene.choiceButtons.forEach(button => {
                button.destroy();
            });
            this.scene.choiceButtons = [];
        }
    }
    
    showChoices(choices) {
        this.clearChoices();
        this.scene.dialogueManager.choosingOption = true;
        
        const startY = this.height / 2 - 100;
        const spacing = 80;
        
        choices.forEach((choice, index) => {
            const button = this.scene.add.image(this.width / 2, startY + (index * spacing), 'choice-box')
                .setDisplaySize(600, 60)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    button.setTint(0xdddddd);
                })
                .on('pointerout', () => {
                    button.clearTint();
                })
                .on('pointerdown', () => {
                    try {
                        this.scene.sound.play('click');
                    } catch (e) {
                        console.warn('Click sound not available');
                    }
                    this.scene.dialogueManager.handleChoice(choice);
                });
            
            // Add choice text on top of the button
            const text = this.scene.add.text(this.width / 2, startY + (index * spacing), choice.text, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5, 0.5);
            
            // Group the button and text together
            button.text = text;
            this.scene.choiceButtons.push(button);
        });
    }
    
    isClickingUIElement(pointer) {
        // Check if the pointer is over a UI button or choice button
        const uiButtons = [
            this.autoButton, this.skipButton, this.saveButton,
            this.loadButton, this.settingsButton, this.languageButton,
            this.helpButton, this.nextButton
        ];
        
        // Check UI buttons
        for (const button of uiButtons) {
            if (button && button.getBounds().contains(pointer.x, pointer.y)) {
                return true;
            }
        }
        
        // Check choice buttons
        if (this.scene.choiceButtons) {
            for (const button of this.scene.choiceButtons) {
                if (button.getBounds().contains(pointer.x, pointer.y)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = UIManager;
}
