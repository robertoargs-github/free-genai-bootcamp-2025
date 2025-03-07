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
        this.nextButton = null;
    }
    
    create(x,y) {
        this.x = 0//x;
        this.y = 0//y;
        
        // create fields container to contain the dialogue.
        this.messagesContainer = this.uim.createFields({
            layout: 'vertical',
            position: [this.x,this.y],
            spacing: this.spacing,
            origin: [0,0]
        });
        this.registerElement(this.messagesContainer);

        this.message = this.uim.createField({
            inputType: 'message',
            position: [0,0], // the container is will override the position
            inputOptions: {} // we don't set options for message on create
        });
        this.messagesContainer.addField(this.message);

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
    }
    
    createNextButton() {
        this.nextButton = this.uim.createField({
            inputType: 'button',
            position: [0,0], // the container is will override the position
            inputOptions: {
                text: 'Next',
                size: [80,50],
                eventHandle: 'dialogue-next'
            }
        })       
        this.messagesContainer.addField(this.nextButton);
    }

}

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = UIManager;
}
