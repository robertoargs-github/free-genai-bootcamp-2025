class UIToggle {
    /**
     * Create a toggle component that cycles through multiple options
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {object} options - Options for the toggle
     * @param {Array<string>} options.values - Array of values/text to toggle through
     * @param {number} options.initialIndex - Initial selected index (default: 0)
     * @param {Array<number>} options.size - [width,height] size of the toggle
     * @param {Array<number>} options.position - [x,y] position of the toggle
     * @param {string} options.eventHandle - the string that is emitted in the eventbus
     * @param {object} options.style - Optional custom text style
     */
    constructor(scene, options) {
        this.scene = scene;
        this.validateOptions(options); // if anything fails it will throw an error

        // Store toggle values
        this.values = options.values;
        this.currentIndex = options.initialIndex || 0;
        this.eventHandle = options.eventHandle;

        // Calculate dimensions
        this.width = options.size[0];
        this.height = options.size[1];
        this.x = options.position[0];
        this.y = options.position[1];

        // Define styles
        this.textStyle = options.style || {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        };

        // Create the pill background
        this.createToggleBackground();

        // Create the text
        this.createToggleText();

        // Set up interactivity
        this.setupInteractivity();
    }

    /**
     * Create the toggle background (pill shape)
     */
    createToggleBackground() {
        // Create a rounded rectangle as the background
        this.background = this.scene.add.graphics();
        this.updateBackgroundDisplay();

        // Make the background interactive
        this.hitArea = new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
        this.background.setInteractive(this.hitArea, Phaser.Geom.Rectangle.Contains);
    }

    /**
     * Create the toggle text display
     */
    createToggleText() {
        this.text = this.scene.add.text(
            this.x + (this.width / 2),
            this.y + (this.height / 2),
            this.values[this.currentIndex],
            this.textStyle
        );
        this.text.setOrigin(0.5);
    }

    /**
     * Update the background display based on current state
     */
    updateBackgroundDisplay() {
        this.background.clear();
        this.background.fillStyle(0x4444AA, 1);
        
        // Draw a rounded rectangle (pill shape)
        const cornerRadius = this.height / 2; // Makes it a proper pill shape
        this.background.fillRoundedRect(
            this.x, 
            this.y, 
            this.width, 
            this.height, 
            cornerRadius
        );
    }

    /**
     * Set up interactive events
     */
    setupInteractivity() {
        // Add pointer events
        this.background.on('pointerover', () => {
            this.background.clear();
            this.background.fillStyle(0x5555CC, 1); // Lighter color on hover
            const cornerRadius = this.height / 2;
            this.background.fillRoundedRect(
                this.x, 
                this.y, 
                this.width, 
                this.height, 
                cornerRadius
            );
        });

        this.background.on('pointerout', () => {
            this.updateBackgroundDisplay(); // Reset to normal color
        });

        this.background.on('pointerdown', () => {
            this.nextValue(); // Cycle to the next value
        });
    }

    /**
     * Cycle to the next available value
     */
    nextValue() {
        // Move to the next index, with wraparound
        this.currentIndex = (this.currentIndex + 1) % this.values.length;
        
        // Update the displayed text
        this.text.setText(this.values[this.currentIndex]);
        
        // Emit an event about the change
        this.scene.g.eventBus.emit(`ui:toggle:${this.eventHandle}:change`, { 
            toggle: this, 
            value: this.values[this.currentIndex],
            index: this.currentIndex,
            scene: this.scene 
        });
    }

    /**
     * Set the toggle to a specific value by index
     * @param {number} index - Index of the value to select
     */
    setValue(index) {
        if (index >= 0 && index < this.values.length) {
            this.currentIndex = index;
            this.text.setText(this.values[this.currentIndex]);
            
            // Emit an event about the change
            this.scene.g.eventBus.emit(`ui:toggle:${this.eventHandle}:change`, { 
                toggle: this, 
                value: this.values[this.currentIndex],
                index: this.currentIndex,
                scene: this.scene 
            });
        } else {
            console.warn(`Invalid index: ${index}. Must be between 0 and ${this.values.length - 1}`);
        }
    }

    /**
     * Set the toggle to a specific value by string value
     * @param {string} value - Value to set
     */
    setValueByString(value) {
        const index = this.values.indexOf(value);
        if (index !== -1) {
            this.setValue(index);
        } else {
            console.warn(`Value not found: ${value}`);
        }
    }

    /**
     * Get the current value
     * @returns {string} Current value
     */
    getValue() {
        return this.values[this.currentIndex];
    }

    /**
     * Get the current index
     * @returns {number} Current index
     */
    getIndex() {
        return this.currentIndex;
    }

    /**
     * Validate the options passed to the constructor
     * @param {object} options 
     */
    validateOptions(options) {
        // Validate values array
        if (!options.values) {
            throw new Error('Values array is required');
        }
        if (!Array.isArray(options.values) || options.values.length < 2) {
            throw new Error('Values must be an array with at least 2 items');
        }

        // Validate initial index if provided
        if (options.initialIndex !== undefined) {
            if (typeof options.initialIndex !== 'number') {
                throw new Error('Initial index must be a number');
            }
            if (options.initialIndex < 0 || options.initialIndex >= options.values.length) {
                throw new Error(`Initial index must be between 0 and ${options.values.length - 1}`);
            }
        }

        // Validate size
        if (!options.size) {
            throw new Error('Size is required');
        }
        if (!Array.isArray(options.size) || options.size.length !== 2 ||
            typeof options.size[0] !== 'number' || typeof options.size[1] !== 'number') {
            throw new Error('Size must be an array of two numbers');
        }

        // Validate position
        if (!options.position) {
            throw new Error('Position is required');
        }
        if (!Array.isArray(options.position) || options.position.length !== 2 ||
            typeof options.position[0] !== 'number' || typeof options.position[1] !== 'number') {
            throw new Error('Position must be an array of two numbers');
        }

        // Validate eventHandle
        if (!options.eventHandle) {
            throw new Error('Event handle is required');
        }
        if (typeof options.eventHandle !== 'string') {
            throw new Error('Event handle must be a string');
        }
    }
}