class UIButton extends UIItem {
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
        super('button');

        this.scene = scene;
        this.validateOptions(options); // if anything fails it will throw an error

        this.buttonStyle = {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#000000'
        };
        
        // Store text (which may be empty string if not provided)
        this.buttonText = options.text || '';
        
        options.image = options.image || 'button';
        options.image_hover = options.image_hover || 'button-hover';

        // Create the button image with top-left positioning
        this.image = this.scene.add.image(options.position[0], options.position[1], options.image)
        //this.image.setDisplaySize(options.size[0], options.size[1])
        this.image.setOrigin(0, 0) // Set origin to top-left
        this.image.setInteractive({ useHandCursor: true })
        this.image.on('pointerover', () => {
            this.image.setTexture(options.image_hover);
            this.scene.g.eventBus.emit(`ui:button:${options.eventHandle}:pointover`, { button: this, scene: this.scene });
        })
        this.image.on('pointerout', () => {
            this.image.setTexture(options.image);
            this.scene.g.eventBus.emit(`ui:button:${options.eventHandle}:pointout`, { button: this, scene: this.scene });
        })
        this.image.on('pointerdown', () => {
            this.scene.g.eventBus.emit(`ui:button:${options.eventHandle}:pointdown`, { button: this, scene: this.scene });
        });
            
        // Create the text with proper positioning (if text was provided)
        // Position text to be centered within the button
        this.text = this.scene.add.text(
            options.position[0] + (options.size[0] / 2), 
            options.position[1] + (options.size[1] / 2), 
            this.buttonText,
            this.buttonStyle
        )
        this.text.setOrigin(0.5); // Keep text centered within the button
    }

    getDimensions() {
        if (this.image.visible === false) {
            return {width: 0, height: 0};
        }
        return {
            width: this.image.width || 0,
            height: this.image.height || 0
        };
    }

    validateOptions(options) {
        // validate text if provided
        if (options.text !== undefined && typeof options.text !== 'string') {
            throw new Error('Text must be a string');
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
    
    /**
     * Set the position of the button (using top-left corner as origin)
     * @param {number} x - The x coordinate (left edge)
     * @param {number} y - The y coordinate (top edge)
     * @returns {UIButton} - This button instance for chaining
     */
    setPosition(x, y) {
        // Store the new position
        this.x = x;
        this.y = y;
        
        // Update button background position (top-left origin)
        if (this.image) {
            this.image.setPosition(x, y);
        }
        
        // Update text position (centered within button)
        if (this.text && this.image) {
            // Calculate center of button for text positioning
            const centerX = x + (this.image.width / 2);
            const centerY = y + (this.image.height / 2);
            this.text.setPosition(centerX, centerY);
        }
        
        return this;
    }
}

if (typeof window !== 'undefined') {
    window.UIButton = UIButton;
}