class UILabel {
    /**
     * Create a text label for UI components
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {object} options - Options for the label
     * @param {string} options.text - Text content of the label
     * @param {Array<number>} options.position - [x,y] position of the label
     * @param {object} options.style - Text style for the label (optional)
     */
    constructor(scene, options) {
        this.scene = scene;
        this.validateOptions(options);
        
        this.text = options.text;
        this.x = options.position[0];
        this.y = options.position[1];
        
        // Default style if not provided
        this.style = options.style || {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        };
        
        // Create the label text
        this.createLabel();
    }
    
    /**
     * Create the text label
     */
    createLabel() {
        this.labelText = this.scene.add.text(
            this.x,
            this.y,
            this.text,
            this.style
        );
        this.labelText.setOrigin(0, 0.5); // Align left, center vertically
    }
    
    /**
     * Set new text for the label
     * @param {string} text - New text content
     */
    setText(text) {
        this.text = text;
        this.labelText.setText(text);
    }
    
    /**
     * Set a new position for the label
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.labelText.setPosition(x, y);
    }
    
    /**
     * Set a new style for the label
     * @param {object} style - New text style
     */
    setStyle(style) {
        this.style = style;
        this.labelText.setStyle(style);
    }
    
    /**
     * Get the label's text object
     * @returns {Phaser.GameObjects.Text} The text object
     */
    getTextObject() {
        return this.labelText;
    }
    
    /**
     * Hide the label
     */
    hide() {
        this.labelText.setVisible(false);
    }
    
    /**
     * Show the label
     */
    show() {
        this.labelText.setVisible(true);
    }
    
    /**
     * Destroy the label
     */
    destroy() {
        this.labelText.destroy();
    }
    
    /**
     * Validate the options passed to the constructor
     * @param {object} options - The options object
     */
    validateOptions(options) {
        // Validate text
        if (!options.text) {
            throw new Error('Label text is required');
        }
        if (typeof options.text !== 'string') {
            throw new Error('Label text must be a string');
        }
        
        // Validate position
        if (!options.position) {
            throw new Error('Position is required');
        }
        if (!Array.isArray(options.position) || options.position.length !== 2 ||
            typeof options.position[0] !== 'number' || typeof options.position[1] !== 'number') {
            throw new Error('Position must be an array of two numbers');
        }
        
        // Validate style if provided
        if (options.style && typeof options.style !== 'object') {
            throw new Error('Style must be an object');
        }
    }
}