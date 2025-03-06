
class MenuUI extends BaseUI {
    constructor(UIManager, scene) {
        super(scene); // Call BaseUI constructor
        this.uim = UIManager;
        this.spacing = 20;
        this.buttonWidth = 500;
        this.buttonHeight = 80;
        this.buttons = {
            newGame: null,
            continue: null,
            settings: null,
            load: null
        }
    }

    create(x,y) {
        this.x = x;
        this.y = y;

        this.createButtons([
            {text: 'New Game',eventHandle: 'new-game'},
            {text: 'Continue',eventHandle: 'continue'},
            {text: 'Settings',eventHandle: 'settings'},
            {text: 'Load',eventHandle: 'load'}
        ]);
    }

    createButtons(buttonData) {
        // for loop and increment position of button data
        let pos = 0
        for (let t of buttonData) {
            this.createButton(pos,t.text,t.eventHandle)
            pos++
        }
    }
        

    createButton(position,text,eventHandle){
        const yOffset = (position*this.buttonHeight) + (position*this.spacing)
        this.buttons[eventHandle] = this.uim.createButton({
            text: text,
            size: [this.buttonWidth,this.buttonHeight],
            position: [this.x,this.y + yOffset],
            eventHandle: eventHandle
        });
        
        // Register the button with BaseUI as an interactive element
        this.registerElement(this.buttons[eventHandle], true);
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
