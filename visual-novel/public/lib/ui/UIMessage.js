// The UIMessage is the following:
// its message bubble that can have its colour set.
// it has text label who the speaker is.
// it has text for japanese dialog.
// it has text for english dialog
class UIMessage {
    constructor(scene,options) {
        this.scene = scene;
        this.validateOptions(options); 
        this.x = options.position[0];
        this.y = options.position[1];

        const width = this.scene.cameras.main.width;
        this.maxWidth = width / 2;
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
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.bubblePanel.setPosition(this.x, this.y);
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
        // TODO update bubblePanel
    }

    createBubble() {
        this.bubblePanel = this.scene.g.ui.createPanel({
            position: [this.x, this.y],
            layout: 'vertical',
            spacing: 16,
            origin: [0,0],
            panelOptions: {
                backgroundImage: 'message-bubble'
            }
        });

    }

    createNameText() {
        this.nameText = this.scene.g.ui.createLabel({
            position: [0,0],
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff'
            }
        });
        this.bubblePanel.addItem(this.nameText);
    }

    createJapaneseText() {
        this.japaneseText = this.scene.g.ui.createLabel({
            position: [0,0],
            text: '',
            style: {
                fontFamily: 'Noto Sans JP',
                fontSize: '32px',
                color: '#ffffff',
            }
        });
        this.bubblePanel.addItem(this.japaneseText);
    }

    createEnglishText() {
        this.englishText = this.scene.g.ui.createLabel({
            position: [0,0],
            text: '',
            style: {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
            }
        });
        this.bubblePanel.addItem(this.englishText);
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