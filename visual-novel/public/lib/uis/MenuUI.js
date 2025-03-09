
class MenuUI extends BaseUI {
    constructor(UIManager, scene) {
        super(scene); // Call BaseUI constructor
        this.uim = UIManager;
        this.spacing = 16;
        this.buttonWidth = 500;
        this.buttonHeight = 80;
    }

    create(x,y) {
        this.x = x;
        this.y = y;

        this.createButtons([
            {text: 'New Game',eventHandle: 'new-game'},
            {text: 'Continue',eventHandle: 'continue'},
            {text: 'Load',eventHandle: 'load'},
            {text: 'Settings',eventHandle: 'settings'}
        ]);

        // example of UISentence
        const sentence = new UISentence(this.scene)
        sentence.set([
            {"word": "あなた","start": 0.031,"end": 0.554},
            {"word": "は","start": 0.554,"end": 0.835},
            {"word": "新しい","start": 0.835,"end": 1.479},
            {"word": "アパート","start": 1.479,"end": 1.841},
            {"word": "に","start": 1.841,"end": 1.961},
            {"word": "おり, ","start": 1.961,"end": 2.786},
            {"word": "朝日","start": 2.786,"end": 3.047},
            {"word": "の","start": 3.047,"end": 3.288},
            {"word": "光","start": 3.288,"end": 3.509},
            {"word": "が","start": 3.509,"end": 3.69},
            {"word": "窓","start": 3.69,"end": 3.952},
            {"word": "の","start": 3.952,"end": 4.193},
            {"word": "中","start": 4.193,"end": 4.334},
            {"word": "を","start": 4.334,"end": 4.434},
            {"word": "流す","start": 4.434,"end": 4.897},
            {"word": "ように","start": 4.897,"end": 5.641},
            {"word": "あなた","start": 5.641,"end": 6.023},
            {"word": "は","start": 6.023,"end": 6.143},
            {"word": "起きた。","start": 6.143,"end": 6.666}
        ])

    }

    createButtons(buttonData) {
        // contain the buttons within a UIContainer that is vertical       
        this.menuContainer = this.uim.createContainer({
            layout: 'vertical',
            position: [this.x,this.y],
            spacing: this.spacing,
            origin: [0.5,0.5]
        });
        this.registerElement(this.menuContainer);
        // iterate over the buttonData and create button
        for (let t of buttonData) {
            this.createButton(t.text, t.eventHandle)
        }
    }

    createButton(text, eventHandle){
        const button = this.uim.createButton({
            position: [0,0],
            text: text,
            size: [this.buttonWidth,this.buttonHeight],
            eventHandle: eventHandle
        });
        this.menuContainer.addItem(button);
    }
    
    // Override show method to add any specific behavior
    show() {
        super.show(); // Call BaseUI's show method
    }

    // Override hide method to add any specific behavior
    hide() {
        super.hide(); // Call BaseUI's hide method
    }
}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = MenuUI;
}
