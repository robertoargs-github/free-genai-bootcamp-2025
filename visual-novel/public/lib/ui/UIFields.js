class UIFields {
    /**
     * Create a container for multiple UIField components with automatic spacing
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {object} options - Options for the fields container
     * @param {Array<number>} options.position - [x,y] position of the container
     * @param {string} options.layout - Layout direction ('vertical' or 'horizontal')
     * @param {number} options.spacing - Spacing between fields
     * @param {Array<UIField>} options.fields - Initial fields to add (optional)
     * @param {Array<number>} options.origin - [x,y] origin point (0-1) for the container (default: [0,0])
     */
    constructor(scene, options) {
        this.scene = scene;
        this.validateOptions(options);
        
        this.x = options.position[0];
        this.y = options.position[1];
        this.layout = options.layout || 'vertical';
        this.spacing = options.spacing !== undefined ? options.spacing : 20;
        this.fields = [];
        
        // Set origin (default to top-left [0,0])
        this.originX = options.origin ? options.origin[0] : 0;
        this.originY = options.origin ? options.origin[1] : 0;
        
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
     * Set visibility of this container and all its fields
     * @param {boolean} visible - Whether the container and fields should be visible
     * @returns {UIFields} - This container instance for chaining
     */
    setVisible(visible) {
        // Set visibility for all fields
        this.fields.forEach(field => {
            if (field && typeof field.setVisible === 'function') {
                field.setVisible(visible);
            }
        });
        
        return this;
    }
    
    /**
     * Update the positions of all fields based on container position, origin, and layout
     * @private
     */
    updateFieldPositions() {
        // Calculate the effective position based on origin
        // We need to determine total width/height to apply origin offset
        const containerDimensions = this.calculateContainerDimensions();
        
        // Apply origin offset to starting position
        let startX = this.x - (containerDimensions.width * this.originX);
        let startY = this.y - (containerDimensions.height * this.originY);
        
        let currentX = startX;
        let currentY = startY;
        
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
     * Calculate the total dimensions of the container based on fields and layout
     * @private
     * @returns {object} - {width, height} of the container
     */
    calculateContainerDimensions() {
        // Use base dimensions if no fields
        if (this.fields.length === 0) {
            return { width: 0, height: 0 };
        }
        
        // Attempt to get actual dimensions from fields
        let maxFieldWidth = 0;
        let maxFieldHeight = 0;
        let totalWidth = 0;
        let totalHeight = 0;
        
        // Examine each field to get dimensions where possible
        this.fields.forEach(field => {
            let fieldWidth = 0;
            let fieldHeight = 0;
            
            // Try to get dimensions from the field or its components
            if (field.inputComponent && field.inputComponent.image) {
                // For buttons with images
                fieldWidth = Math.max(fieldWidth, field.inputComponent.image.displayWidth || 0);
                fieldHeight = Math.max(fieldHeight, field.inputComponent.image.displayHeight || 0);
            } else if (field.inputOptions && field.inputOptions.size) {
                // For fields with explicit size in options
                fieldWidth = Math.max(fieldWidth, field.inputOptions.size[0] || 0);
                fieldHeight = Math.max(fieldHeight, field.inputOptions.size[1] || 0);
            } else if (field.options && field.options.inputOptions && field.options.inputOptions.size) {
                // For fields with size defined in inputOptions
                fieldWidth = Math.max(fieldWidth, field.options.inputOptions.size[0] || 0);
                fieldHeight = Math.max(fieldHeight, field.options.inputOptions.size[1] || 0);
            }
            
            // Update maximums
            maxFieldWidth = Math.max(maxFieldWidth, fieldWidth);
            maxFieldHeight = Math.max(maxFieldHeight, fieldHeight);
        });
        
        // If we couldn't determine dimensions from fields, use reasonable defaults
        if (maxFieldWidth === 0) maxFieldWidth = 500; // Default to a reasonable button width
        if (maxFieldHeight === 0) maxFieldHeight = 80; // Default height
        
        // Calculate total dimensions based on layout
        if (this.layout === 'vertical') {
            // For vertical layout, width is the maximum field width,
            // height is sum of all field heights plus spacing
            return {
                width: maxFieldWidth,
                height: (maxFieldHeight * this.fields.length) + 
                        (this.spacing * (this.fields.length - 1))
            };
        } else {
            // For horizontal layout, width is sum of all field widths plus spacing,
            // height is the maximum field height
            return {
                width: (maxFieldWidth * this.fields.length) + 
                       (this.spacing * (this.fields.length - 1)),
                height: maxFieldHeight
            };
        }
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
     * Set the origin point of the container
     * @param {number} x - X origin (0-1)
     * @param {number} y - Y origin (0-1)
     * @returns {UIFields} - This container instance for chaining
     */
    setOrigin(x, y) {
        // Validate origin values
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error('Origin values must be numbers');
        }
        
        // Update origin values
        this.originX = x;
        this.originY = y;
        
        // Update field positions based on new origin
        this.updateFieldPositions();
        
        return this;
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
        if (options.fields !== undefined && !Array.isArray(options.fields)) {
            throw new Error('Fields must be an array');
        }
        
        // Validate origin if provided
        if (options.origin !== undefined) {
            if (!Array.isArray(options.origin) || options.origin.length !== 2 ||
                typeof options.origin[0] !== 'number' || typeof options.origin[1] !== 'number') {
                throw new Error('Origin must be an array of two numbers');
            }
        }
    }
}