/**
 * UIManager.js
 * Manages all UI components in the game
 */
class DialogUI  extends BaseUI {
    constructor(UIManager,dialogueManager,scene) {
        super(scene);
        this.uim = UIManager;
        this.d = dialogueManager;
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;
        
        // Get reference to the event bus from the scene
        this.eventBus = window.eventBus;

        this.margin = 32;
        this.padding = 32;
        
        // UI components
        this.dialogueBox = null;
        this.nameBox = null;
        this.nextButton = null;
        this.choiceSystem = null;

        this.nameText = null;
    }
    
    create(x,y) {
        this.x = x;
        this.y = y;
        this.createDialogueBox();
        this.createNameBox();
        this.createNextButton();
        this.createDialogueText();
    }

    update() {
        if (this.d.isLoaded()){
            const name = this.d.getSpeakerName();
            this.nameText.setText(name);
        }
        // update japanese text 
        if (this.japaneseText && (this.scene.g.settings.get('language') == 'japanese' || this.scene.g.settings.get('language') == 'dual')) {
            this.japaneseText.setText(this.d.getJapaneseText());
        }
        // update english text
        if (this.englishText && (this.scene.g.settings.get('language') == 'english' || this.scene.g.settings.get('language') == 'dual')) {
            this.englishText.setText(this.d.getEnglishText());
        }

        if (this.d.isChoices()){
            this.nextButton.setVisible(false)
        } else {
            this.nextButton.setVisible(true)
        }
    }
    
    createDialogueBox() {
        const width = this.width - (this.margin * 2);
        const height = 300;
        const y = this.y - this.margin;
        const x = this.x + this.margin;
        this.dialogueBox = this.scene.add.image(x, y, 'dialog-box')
        this.dialogueBox.setDisplaySize(width, height);
        this.dialogueBox.setOrigin(0,1)
    }
    
    createNameBox() {
        const height = 50
        const width = 400
        const x = this.dialogueBox.x + 32;
        const y = this.dialogueBox.y - this.dialogueBox.displayHeight - (height/2);
        this.nameBox = this.scene.add.image(x, y, 'name-box')
        this.nameBox.setDisplaySize(width, height);
        this.nameBox.setOrigin(0,0);

        this.nameText = this.scene.add.text(x + 16, y + 8, '', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0,0);
    }
    
    createNextButton() {
        const x = this.dialogueBox.x + this.dialogueBox.displayWidth - 80;
        const y = this.dialogueBox.y - 100;
        this.nextButton = this.uim.createField({
            inputType: 'button',
            position: [x,y],
            inputOptions: {
                text: 'Next',
                size: [80,50],
                eventHandle: 'dialogue-next'
            }
        })       
        this.registerElement(this.nextButton);
    }
    
    createDialogueText() {
        // Create text objects for dialogue
        const x = this.dialogueBox.x + this.margin
        const y = this.dialogueBox.y - this.dialogueBox.displayHeight + (this.padding * 2);

        const width = this.dialogueBox.displayWidth - (this.margin * 2) - (this.padding * 2);
        
        let offsetY = y;
        // Create text for Japanese (top) and English (bottom) if using dual mode
        if (this.scene.g.settings.get('language') === 'dual' || this.scene.g.settings.get('language') === 'japanese') {
            this.japaneseText = this.scene.add.text(x, offsetY, '', {
                fontFamily: 'Noto Sans JP',
                fontSize: '28px',
                color: '#ffffff',
                align: 'left',
                wordWrap: { width: width }
            }).setOrigin(0,0);
        }
        
        if (this.scene.g.settings.get('language') === 'dual' || this.scene.g.settings.get('language') === 'english') {
            offsetY += this.japaneseText.displayHeight + this.padding;
            this.englishText = this.scene.add.text(x, offsetY, '', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                align: 'left',
                wordWrap: { width: width }
            }).setOrigin(0,0);
        }
    }


}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = UIManager;
}
