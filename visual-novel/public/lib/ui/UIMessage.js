// The UIMessage is the following:
// its message bubble that can have its colour set.
// it has text label who the speaker is.
// it has text for japanese dialogue.
// it has text for english dialogue
class UIMessage {
    constructor(scene,options) {
        this.scene = scene;
        this.validateOptions(options); 
        this.x = options.position[0];
        this.y = options.position[1];

        const width = this.scene.cameras.main.width;
        this.maxWidth = width / 2;
        this.bubble = null; // the background image of the bubble
        this.japaneseText = null;
        this.englishText = null;
        this.nameText = null;
        this.create();
    }

    create() {
        this.createBubble();
        this.createNameText();
        this.createJapaneseText();
        this.createEnglishText();
        this.autoResizeBubble();
    }

    update(options){
        this.nameText.setText(options.name);
        if (options.japaneseText) {
            this.japaneseText.setText(options.japaneseText);
            this.japaneseText.setVisible(true);
        } else {
            this.japaneseText.setText('');
            this.japaneseText.setVisible(false);
        }
        if (options.englishText) {
            this.englishText.setText(options.englishText);
            this.englishText.setVisible(true);
        } else {
            this.englishText.setText('');
            this.englishText.setVisible(false);
        }
        this.autoResizeBubble();
    }

    createBubble() {
        this.bubble = this.scene.add.image(this.x, this.y, 'message-bubble')
        this.bubble.setDisplaySize(0,0); // make it invisible for now...
        this.bubble.setOrigin(0,0);
    }

    // based on the contents of text we need to resize
    // the bubble
    autoResizeBubble() {
        const gap = 16;
        let height = 0;
        let japaneseWidth = 0;
        let englishWidth = 0;
        if (this.japaneseText.visible) {
            japaneseWidth = this.japaneseText.displayWidth;
            height += this.japaneseText.displayHeight;
        }
        if (this.englishText.visible) {
            englishWidth = this.englishText.displayWidth;
            height += this.englishText.displayHeight + gap;
        }
        const width = Math.max(japaneseWidth, englishWidth);

        this.bubble.setDisplaySize(width, height);
    }

    createNameText() {
        this.nameText = this.scene.add.text(this.x, this.y, '', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0,0);
    }

    createJapaneseText() {
        this.japaneseText = this.scene.add.text(this.x, this.y, '', {
            fontFamily: 'Noto Sans JP',
            fontSize: '28px',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: this.maxWidth }
        }).setOrigin(0,0);
    }

    createEnglishText() {
        this.englishText = this.scene.add.text(this.x, this.y, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: this.maxWidth }
        }).setOrigin(0,0);
    }

    validateOptions(options) {
        // Validate position
        if (!options.position) {
            throw new Error('Position is required');
        }
        if (!Array.isArray(options.position) || options.position.length !== 2 ||
            typeof options.position[0] !== 'number' || typeof options.position[1] !== 'number') {
            throw new Error('Position must be an array of two numbers');
        }
    }

}

if (typeof module !== 'undefined') {  
    module.exports = UIMessage;
}