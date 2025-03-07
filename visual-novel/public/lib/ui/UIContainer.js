class UIContainer {
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
     * @returns {UIContainer} - This container instance for chaining
     */
    addField(field) {
        this.fields.push(field);
        this.updateFieldPositions();
        return this;
    }
    
    /**
     * Remove a field from the container
     * @param {UIField} field - The field to remove
     * @returns {UIContainer} - This container instance for chaining
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
     * @returns {UIContainer} - This container instance for chaining
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
     * @returns {UIContainer} - This container instance for chaining
     */
    setSpacing(spacing) {
        this.spacing = spacing;
        this.updateFieldPositions();
        return this;
    }
    
    /**
     * Set visibility of this container and all its fields
     * @param {boolean} visible - Whether the container and fields should be visible
     * @returns {UIContainer} - This container instance for chaining
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
        
        // Define positions for each field based on calculated dimensions
        if (this.layout === 'vertical') {
            // For vertical layout, calculate field positions based on actual dimensions
            let yOffset = 0;
            
            this.fields.forEach((field, index) => {
                // Position the field at the current offset
                field.setPosition(startX, startY + yOffset);
                
                // Calculate actual dimensions for this field
                const dimensions = this.getFieldDimensions(field);
                
                // Add this field's height plus spacing to the offset for the next field
                yOffset += dimensions.height + this.spacing;
            });
        } else {
            // For horizontal layout, use standard positioning logic
            let currentX = startX;
            
            this.fields.forEach((field, index) => {
                // Position the field
                field.setPosition(currentX, startY);
                
                // Get field dimensions
                const fieldDimensions = this.getFieldDimensions(field);
                
                // Increment X for next field
                currentX += fieldDimensions.width + this.spacing;
            });
        }
    }
    
    /**
     * Get dimensions for a specific field based on its type and components
     * @param {UIField} field - The field to measure
     * @returns {object} - {width, height} of the field
     * @private
     */
    getFieldDimensions(field) {
        let width = 0;
        let height = 0;
        let labelOffset = 0;
        let componentHeight = 0;
        
        // First check if the field has a non-empty label (adds to height)
        if (field.label && field.label.text && field.label.text.text !== '') {
            // Get the actual label height from the text component
            labelOffset = field.label.text.displayHeight;
            
            // Add the configured spacing between label and component
            if (field.spacing !== undefined) {
                labelOffset += field.spacing;
            } else {
                // If no field spacing is defined, use a reasonable value based on component type
                switch(field.inputType) {
                    case 'toggle':
                        labelOffset += 30; // Toggle needs more space
                        break;
                    case 'slider':
                        labelOffset += 25; // Slider needs moderate space
                        break;
                    default:
                        labelOffset += 20; // Default spacing
                }
            }
        }
        
        // Determine width and height based on input component type
        if (field.inputComponent) {
            // Handle button components
            if (field.inputType === 'button' && field.inputComponent.image) {
                width = field.inputComponent.image.displayWidth || 0;
                componentHeight = field.inputComponent.image.displayHeight || 0;
            } 
            // Handle toggle components (support for multiple options beyond on/off)
            else if (field.inputType === 'toggle') {
                // For toggle components with pills
                if (field.inputComponent.pills && field.inputComponent.pills.length > 0) {
                    // Calculate total width across all pills plus spacing
                    width = 0;
                    
                    // Get actual width by summing all pill widths plus spacing
                    for (let i = 0; i < field.inputComponent.pills.length; i++) {
                        const pill = field.inputComponent.pills[i];
                        if (pill) {
                            width += pill.displayWidth || 0;
                            // Add spacing between pills (except after the last one)
                            if (i < field.inputComponent.pills.length - 1) {
                                width += field.inputComponent.spacing || 5;
                            }
                        }
                    }
                    
                    // Get height from the first pill (they should all be same height)
                    componentHeight = field.inputComponent.pills[0] ? 
                        field.inputComponent.pills[0].displayHeight : 40;
                    
                    // Add some extra padding for hover effects
                    componentHeight += 10;
                } 
                // Fallback to options-based calculation if no pills are created yet
                else if (field.inputOptions && field.inputOptions.values) {
                    // Calculate width based on number of values and spacing
                    const numValues = field.inputOptions.values.length;
                    const valueWidth = field.inputOptions.size ? field.inputOptions.size[0] : 80;
                    const spacing = field.inputOptions.spacing || 5;
                    
                    width = (valueWidth * numValues) + (spacing * (numValues - 1));
                    componentHeight = field.inputOptions.size ? field.inputOptions.size[1] : 40;
                } 
                // Last resort fallback
                else {
                    width = 300;
                    componentHeight = 40;
                }
            } 
            // Handle text input components
            else if (field.inputType === 'textinput' && field.inputComponent.background) {
                width = field.inputComponent.background.displayWidth || 0;
                componentHeight = field.inputComponent.background.displayHeight || 0;
            } 
            // Handle slider components
            else if (field.inputType === 'slider') {
                if (field.inputComponent.track) {
                    width = field.inputComponent.track.displayWidth || 0;
                    // Add extra height for the handle and to prevent overlap with next element
                    componentHeight = field.inputComponent.track.displayHeight + 20;
                }
                // If we have a slider value text, make sure we account for its height
                if (field.inputComponent.valueText) {
                    componentHeight += field.inputComponent.valueText.displayHeight || 0;
                }
            }
        }
        
        // Fallback to options if we couldn't determine from component
        if (width === 0 && field.inputOptions && field.inputOptions.size) {
            width = field.inputOptions.size[0] || 0;
            if (componentHeight === 0) {
                componentHeight = field.inputOptions.size[1] || 0;
            }
        }
        
        // Fallback to nested inputOptions if still not found
        if (width === 0 && field.options && field.options.inputOptions && field.options.inputOptions.size) {
            width = field.options.inputOptions.size[0] || 0;
            if (componentHeight === 0) {
                componentHeight = field.options.inputOptions.size[1] || 0;
            }
        }
        
        // Set reasonable defaults if all else fails
        if (width === 0) width = 300; // Default width
        if (componentHeight === 0) componentHeight = 40; // Default component height
        
        // For vertical layouts, elements with labels need more space
        if (labelOffset > 0) {
            height = labelOffset + componentHeight + 10; // Add extra padding between label and component
        } else {
            height = componentHeight;
        }
        
        return { width, height };
    }
    
    /**
     * Set the layout direction
     * @param {string} layout - 'vertical' or 'horizontal'
     * @returns {UIContainer} - This container instance for chaining
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
        let totalHeight = 0;
        
        // Examine each field to get dimensions where possible
        this.fields.forEach(field => {
            // Get dimensions for this field using our helper method
            const dimensions = this.getFieldDimensions(field);
            
            // Track the maximum width for all fields
            maxFieldWidth = Math.max(maxFieldWidth, dimensions.width);
            
            // For vertical layout, accumulate total height
            if (this.layout === 'vertical') {
                totalHeight += dimensions.height + (this.fields.indexOf(field) < this.fields.length - 1 ? this.spacing : 0);
            }
        });
        
        // If we couldn't determine dimensions, use reasonable defaults
        if (maxFieldWidth === 0) maxFieldWidth = 300;
        if (totalHeight === 0 && this.layout === 'vertical') totalHeight = this.fields.length * 100;
        
        // Calculate total dimensions based on layout
        if (this.layout === 'vertical') {
            // For vertical layout, width is the maximum field width,
            // height is the accumulated heights plus spacing
            return {
                width: maxFieldWidth,
                height: totalHeight
            };
        } else {
            // For horizontal layout, calculate based on individual field widths
            let totalWidth = 0;
            let maxHeight = 0;
            
            this.fields.forEach(field => {
                const dimensions = this.getFieldDimensions(field);
                totalWidth += dimensions.width + (this.fields.indexOf(field) < this.fields.length - 1 ? this.spacing : 0);
                maxHeight = Math.max(maxHeight, dimensions.height);
            });
            
            return {
                width: totalWidth,
                height: maxHeight
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
     * @returns {UIContainer} - This container instance for chaining
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