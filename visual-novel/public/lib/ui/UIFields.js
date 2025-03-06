class UIFields {
    /**
     * Create a container for multiple UIField components with automatic spacing
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {object} options - Options for the fields container
     * @param {Array<number>} options.position - [x,y] position of the container
     * @param {string} options.layout - Layout direction ('vertical' or 'horizontal')
     * @param {number} options.spacing - Spacing between fields
     * @param {Array<UIField>} options.fields - Initial fields to add (optional)
     */
    constructor(scene, options) {
        this.scene = scene;
        this.validateOptions(options);
        
        this.x = options.position[0];
        this.y = options.position[1];
        this.layout = options.layout || 'vertical';
        this.spacing = options.spacing !== undefined ? options.spacing : 20;
        this.fields = [];
        
        // Add initial fields if provided
        if (options.fields && Array.isArray(options.fields)) {
            options.fields.forEach(field => this.addField(field));
        }
    }
    
    /**
     * Add a field to the container
     * @param {UIField} field - The field to add
     * @returns {UIFields} - This container instance for chaining
     */
    addField(field) {
        this.fields.push(field);
        this.updateFieldPositions();
        return this;
    }
    
    /**
     * Remove a field from the container
     * @param {UIField} field - The field to remove
     * @returns {UIFields} - This container instance for chaining
     */
    removeField(field) {
        const index = this.fields.indexOf(field);
        if (index !== -1) {
            this.fields.splice(index, 1);
            this.updateFieldPositions();
        }
        return this;
    }
    
    /**
     * Get all fields in the container
     * @returns {Array<UIField>} - Array of fields
     */
    getFields() {
        return this.fields;
    }
    
    /**
     * Set the position of the container and all its fields
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {UIFields} - This container instance for chaining
     */
    setPosition(x, y) {
        const deltaX = x - this.x;
        const deltaY = y - this.y;
        
        this.x = x;
        this.y = y;
        
        // Update all field positions
        this.updateFieldPositions();
        
        return this;
    }
    
    /**
     * Set the spacing between fields
     * @param {number} spacing - Spacing value
     * @returns {UIFields} - This container instance for chaining
     */
    setSpacing(spacing) {
        this.spacing = spacing;
        this.updateFieldPositions();
        return this;
    }
    
    /**
     * Update the positions of all fields based on container position and layout
     * @private
     */
    updateFieldPositions() {
        let currentX = this.x;
        let currentY = this.y;
        
        this.fields.forEach((field, index) => {
            // Position the field
            field.setPosition(currentX, currentY);
            
            // Calculate next position based on layout
            if (this.layout === 'vertical') {
                // For vertical layout, increment Y position
                // We need to estimate total field height (label + spacing + input)
                // For toggle and slider inputs, this is approximately 80-90px
                const fieldHeight = 90; // Better height estimate for a field with label and input
                currentY += fieldHeight + this.spacing;
            } else {
                // For horizontal layout, increment X position
                // Width depends on the specific input type, but we use a reasonable estimate
                const fieldWidth = 200; // Base width estimate
                currentX += fieldWidth + this.spacing;
            }
        });
    }
    
    /**
     * Set the layout direction
     * @param {string} layout - 'vertical' or 'horizontal'
     * @returns {UIFields} - This container instance for chaining
     */
    setLayout(layout) {
        if (layout !== 'vertical' && layout !== 'horizontal') {
            throw new Error("Layout must be 'vertical' or 'horizontal'");
        }
        
        this.layout = layout;
        this.updateFieldPositions();
        return this;
    }
    
    /**
     * Get a field by index
     * @param {number} index - Index of the field to get
     * @returns {UIField|null} - The field at the specified index or null
     */
    getFieldAt(index) {
        if (index >= 0 && index < this.fields.length) {
            return this.fields[index];
        }
        return null;
    }
    
    /**
     * Destroy all fields and clean up resources
     */
    destroy() {
        // Destroy all fields
        this.fields.forEach(field => {
            if (field.destroy && typeof field.destroy === 'function') {
                field.destroy();
            }
        });
        
        this.fields = [];
    }
    
    /**
     * Validate the options passed to the constructor
     * @param {object} options 
     * @private
     */
    validateOptions(options) {
        // Validate position
        if (!options.position) {
            throw new Error('Position is required');
        }
        if (!Array.isArray(options.position) || options.position.length !== 2 ||
            typeof options.position[0] !== 'number' || typeof options.position[1] !== 'number') {
            throw new Error('Position must be an array of two numbers');
        }
        
        // Validate layout if provided
        if (options.layout !== undefined && 
            options.layout !== 'vertical' && 
            options.layout !== 'horizontal') {
            throw new Error("Layout must be 'vertical' or 'horizontal'");
        }
        
        // Validate spacing if provided
        if (options.spacing !== undefined && typeof options.spacing !== 'number') {
            throw new Error('Spacing must be a number');
        }
        
        // Validate fields if provided
        if (options.fields !== undefined) {
            if (!Array.isArray(options.fields)) {
                throw new Error('Fields must be an array');
            }
        }
    }
}