/**
 * UIManager.js
 * Manages all UI components in the game
 */
class DialogUI  extends BaseUI {
    constructor(UIManager,dialogManager,scene) {
        super(scene);
        this.uim = UIManager;
        this.d = dialogManager;
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;

        this.spacing = 12;
        
        // Get reference to the event bus from the scene
        this.eventBus = window.eventBus;

        this.margin = 32;
        this.padding = 32;
        
        // UI components
        this.nextButton = null;
    }
    
    create(x,y) {
        this.x = x;
        this.y = y;
        this.createMessagesContainer();
        this.createMessage();
        this.createNextButton();
    }

    update() {
        if (this.d.isLoaded()){
            const attrs = {}           
            attrs.name = this.d.getSpeakerName();
            switch(this.scene.g.settings.get('language')) { 
                case 'japanese':
                    attrs.japaneseText = this.d.getJapaneseText();
                    break;
                case 'english':
                    attrs.englishText = this.d.getEnglishText();
                    break;
                case 'dual':
                    attrs.japaneseText = this.d.getJapaneseText();
                    attrs.englishText = this.d.getEnglishText();
                    break;
                default:
                    // raise error
                    console.error('Invalid language setting:', this.scene.g.settings.get('language'));
                    break;
            }
            this.message.input.update(attrs);
        }
        // update japanese text 

        if (this.d.isChoices()){
            this.nextButton.setVisible(false)
        } else {
            this.nextButton.setVisible(true)
        }
        this.messagesContainer.update();
    }

    createMessagesContainer(){
        // create fields container to contain the dialog.
        this.messagesContainer = this.uim.createContainer({
            layout: 'vertical',
            position: [this.x,this.y],
            spacing: this.spacing,
            origin: [0,1]
        });
        this.registerElement(this.messagesContainer);
    }

    createMessage(){
        this.message = this.uim.createField({
            inputType: 'message',
            position: [0,0], // the container is will override the position
            inputOptions: {}
        });
        this.messagesContainer.addItem(this.message);
    }
    
    createNextButton() {
        this.nextButton = this.uim.createButton({
            position: [0,0], // the container is will override the position
            text: 'Next',
            size: [80,50],
            image: 'small-button',
            eventHandle: 'dialog-next'
        })       
        this.messagesContainer.addItem(this.nextButton);
    }

}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = UIManager;
}
