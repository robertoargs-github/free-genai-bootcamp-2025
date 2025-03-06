class UIButton {
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {object} options - Options for the button
     * @param {string} options.text - Text to display on the button
     * @param {string} options.size - [width,height] size of the button
     * @param {string} options.position - [x,y] position of the button
     * @param {function} options.eventHandle - the string that is emitted in the eventbus
     */
    constructor(scene,options){
        this.scene = scene;
        this.validateOptions(options); // if anything fails it will throw an error

        this.buttonStyle = {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        };
        this.image = this.scene.add.image(options.position[0], options.position[1], 'button')
        this.image.setDisplaySize(options.size[0], options.size[1])
        this.image.setInteractive({ useHandCursor: true })
        this.image.on('pointerover', () => {
            this.image.setTexture('button-hover');
            this.scene.g.eventBus.emit(`ui:button:${options.eventHandle}:pointover`, { button: this, scene: this.scene });
        })
        this.image.on('pointerout', () => {
            this.image.setTexture('button');
            this.scene.g.eventBus.emit(`ui:button:${options.eventHandle}:pointout`, { button: this, scene: this.scene });
        })
        this.image.on('pointerdown', () => {
            this.scene.g.eventBus.emit(`ui:button:${options.eventHandle}:pointdown`, { button: this, scene: this.scene });
        });
            
        this.text = this.scene.add.text(
            options.position[0], 
            options.position[1], 
            options.text,
            this.buttonStyle
        )
        this.text.setOrigin(0.5);
    }

    validateOptions(options) {
        // validate text
        if (!options.text) {
            throw new Error('Text is required');
            // validate is string
            if (typeof options.text !== 'string') {
                throw new Error('Text must be a string');
            }
        }

        // validate size
        if (!options.size) {
            throw new Error('Size is required');
            // validate is array, array is two cells and both are intergers
            if (!Array.isArray(options.size) || options.size.length !== 2 ||
                typeof options.size[0] !== 'number' || typeof options.size[1] !== 'number') {
                    throw new Error('Size must be an array of two numbers');
                }

        }
        // validate position
        if (!options.position) {
            throw new Error('Position is required');
            // validate is array, array is two cells and both are intergers
            if (!Array.isArray(options.position) || options.position.length !== 2 ||
                typeof options.position[0] !== 'number' || typeof options.position[1] !== 'number') {
                    throw new Error('Position must be an array of two numbers');
                }
        }
        // validate eventHandle
        if (!options.eventHandle) {
            throw new Error('Event handle is required');
            // validate is string
            if (typeof options.eventHandle !== 'string') {
                throw new Error('Event handle must be a string');
            }
        }
    }
    
    /**
     * Set visibility of this button and all its components
     * @param {boolean} visible - Whether the button should be visible
     * @returns {UIButton} - This button instance for chaining
     */
    setVisible(visible) {
        // Set visibility for button image
        if (this.image && typeof this.image.setVisible === 'function') {
            this.image.setVisible(visible);
        }
        
        // Set visibility for button text
        if (this.text && typeof this.text.setVisible === 'function') {
            this.text.setVisible(visible);
        }
        
        return this;
    }
}