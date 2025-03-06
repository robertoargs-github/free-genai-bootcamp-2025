class UIToggle {
    /**
     * Create a toggle component with multiple options displayed horizontally
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {object} options - Options for the toggle
     * @param {Array<string>} options.values - Array of values/text to toggle between
     * @param {number} options.initialIndex - Initial selected index (default: 0)
     * @param {Array<number>} options.size - [width,height] size of each individual option pill
     * @param {Array<number>} options.position - [x,y] position of the leftmost part of the toggle group
     * @param {string} options.eventHandle - the string that is emitted in the eventbus
     * @param {object} options.style - Optional custom text style
     * @param {string} options.label - Optional label for the toggle
     * @param {number} options.spacing - Optional spacing between pills (default: 10)
     */
    constructor(scene, options) {
        this.scene = scene;
        this.validateOptions(options); // if anything fails it will throw an error

        // Store toggle values
        this.values = options.values;
        this.currentIndex = options.initialIndex || 0;
        this.eventHandle = options.eventHandle;
        this.label = options.label || null;
        this.spacing = options.spacing || 10;

        // Calculate dimensions
        this.pillWidth = options.size[0];
        this.pillHeight = options.size[1];
        this.totalWidth = (this.pillWidth * this.values.length) + (this.spacing * (this.values.length - 1));
        this.x = options.position[0];
        this.y = options.position[1];
        
        // Define styles
        this.textStyle = options.style || {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        };
        
        this.labelStyle = {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        };

        // Arrays to store graphical objects
        this.backgrounds = [];
        this.texts = [];
        
        // Create the label if provided
        this.createLabel();
        
        // Create toggle pills for each option
        this.createTogglePills();
        
        // Highlight the initially selected pill
        this.updatePillAppearance();
    }

    /**
     * Create the label if provided
     */
    createLabel() {
        if (this.label) {
            this.labelText = this.scene.add.text(
                this.x,
                this.y - this.pillHeight - 10, // Position above the pills
                this.label,
                this.labelStyle
            );
            this.labelText.setOrigin(0, 0.5);
        }
    }

    /**
     * Create pills for each toggle option
     */
    createTogglePills() {
        let xOffset = this.x;
        
        // Create a pill for each value
        for (let i = 0; i < this.values.length; i++) {
            // Create pill background
            const background = this.scene.add.graphics();
            background.fillStyle(0x4444AA, 1);
            
            // Draw the pill shape
            const cornerRadius = this.pillHeight / 2;
            background.fillRoundedRect(
                xOffset,
                this.y,
                this.pillWidth,
                this.pillHeight,
                cornerRadius
            );
            
            // Make the pill interactive
            const hitArea = new Phaser.Geom.Rectangle(xOffset, this.y, this.pillWidth, this.pillHeight);
            background.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            
            // Create pill text
            const text = this.scene.add.text(
                xOffset + (this.pillWidth / 2),
                this.y + (this.pillHeight / 2),
                this.values[i],
                this.textStyle
            );
            text.setOrigin(0.5);
            
            // Store references to graphics objects
            this.backgrounds.push(background);
            this.texts.push(text);
            
            // Set up click event for this pill
            background.on('pointerdown', () => {
                this.setValue(i);
            });
            
            // Store the pill position for this index for later reference
            const pillPosition = xOffset;
            
            // Set up hover effects
            background.on('pointerover', () => {
                if (i !== this.currentIndex) {
                    background.clear();
                    background.fillStyle(0x5555CC, 1); // Lighter color on hover
                    background.fillRoundedRect(pillPosition, this.y, this.pillWidth, this.pillHeight, cornerRadius);
                }
            });
            
            background.on('pointerout', () => {
                if (i !== this.currentIndex) {
                    background.clear();
                    background.fillStyle(0x4444AA, 1);
                    background.fillRoundedRect(pillPosition, this.y, this.pillWidth, this.pillHeight, cornerRadius);
                }
            });
            
            // Move to next pill position
            xOffset += this.pillWidth + this.spacing;
        }
    }

    /**
     * Update pill appearance based on current selection
     */
    updatePillAppearance() {
        // Update all pills
        for (let i = 0; i < this.backgrounds.length; i++) {
            const background = this.backgrounds[i];
            const xPos = this.x + (i * (this.pillWidth + this.spacing));
            const cornerRadius = this.pillHeight / 2;
            
            background.clear();
            
            if (i === this.currentIndex) {
                // Selected pill gets a highlight color
                background.fillStyle(0x6666EE, 1);
            } else {
                // Unselected pills get the default color
                background.fillStyle(0x4444AA, 1);
            }
            
            background.fillRoundedRect(xPos, this.y, this.pillWidth, this.pillHeight, cornerRadius);
        }
    }

    /**
     * Set the toggle to a specific value by index
     * @param {number} index - Index of the value to select
     */
    setValue(index) {
        if (index >= 0 && index < this.values.length) {
            // Only update if the selection has changed
            if (this.currentIndex !== index) {
                this.currentIndex = index;
                
                // Update visual appearance
                this.updatePillAppearance();
                
                // Emit an event about the change
                this.scene.g.eventBus.emit(`ui:toggle:${this.eventHandle}:change`, { 
                    toggle: this, 
                    value: this.values[this.currentIndex],
                    index: this.currentIndex,
                    scene: this.scene 
                });
            }
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

        // Validate label if provided
        if (options.label !== undefined && typeof options.label !== 'string') {
            throw new Error('Label must be a string');
        }

        // Validate spacing if provided
        if (options.spacing !== undefined && typeof options.spacing !== 'number') {
            throw new Error('Spacing must be a number');
        }
    }
}