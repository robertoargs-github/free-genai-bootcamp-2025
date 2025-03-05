class MenuUI {
    constructor(UIManager,scene) {
        this.uim = UIManager;
        this.scene = scene;
        this.spacing = 20
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
        ])

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
    }
}