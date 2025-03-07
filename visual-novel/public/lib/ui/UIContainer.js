class UIContainer {
    /**
     * Create a container for multiple UIField components with automatic spacing
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {object} options - Options for the items container
     * @param {Array<number>} options.position - [x,y] position of the container
     * @param {string} options.layout - Layout direction ('vertical' or 'horizontal')
     * @param {number} options.spacing - Spacing between items
     * @param {Array<UIField>} options.items - Initial items to add (optional)
     * @param {Array<number>} options.origin - [x,y] origin point (0-1) for the container (default: [0,0])
     */
    constructor(scene, options) {
        this.scene = scene;
        this.validateOptions(options);
        
        this.x = options.position[0];
        this.y = options.position[1];
        this.layout = options.layout || 'vertical';
        this.spacing = options.spacing !== undefined ? options.spacing : 20;
        this.items = [];
        
        // Set origin (default to top-left [0,0])
        this.originX = options.origin ? options.origin[0] : 0;
        this.originY = options.origin ? options.origin[1] : 0;
        
        // Add initial items if provided
        if (options.items && Array.isArray(options.items)) {
            options.items.forEach(item => this.addItem(item));
        }
    }
    
    /**
     * Add a item to the container
     * @param {UIField} item - The item to add
     * @returns {UIContainer} - This container instance for chaining
     */
    addItem(item) {
        this.items.push(item);
        this.updateItemPositions();
        return this;
    }
    
    /**
     * Remove a item from the container
     * @param {UIField} item - The item to remove
     * @returns {UIContainer} - This container instance for chaining
     */
    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.updateItemPositions();
        }
        return this;
    }
    
    /**
     * Get all items in the container
     * @returns {Array<UIField>} - Array of items
     */
    getItems() {
        return this.items;
    }
    
    /**
     * Set the position of the container and all its items
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {UIContainer} - This container instance for chaining
     */
    setPosition(x, y) {
        const deltaX = x - this.x;
        const deltaY = y - this.y;
        
        this.x = x;
        this.y = y;
        
        // Update all item positions
        this.updateItemPositions();
        
        return this;
    }
    
    /**
     * Set the spacing between items
     * @param {number} spacing - Spacing value
     * @returns {UIContainer} - This container instance for chaining
     */
    setSpacing(spacing) {
        this.spacing = spacing;
        this.updateItemPositions();
        return this;
    }
    
    /**
     * Set visibility of this container and all its items
     * @param {boolean} visible - Whether the container and items should be visible
     * @returns {UIContainer} - This container instance for chaining
     */
    setVisible(visible) {
        // Set visibility for all items
        this.items.forEach(item => {
            if (item && typeof item.setVisible === 'function') {
                item.setVisible(visible);
            }
        });
        
        return this;
    }
    
    /**
     * Update the positions of all items based on container position, origin, and layout
     * @private
     */
    updateItemPositions() {
        // Calculate the effective position based on origin
        // We need to determine total width/height to apply origin offset
        const containerDimensions = this.calculateContainerDimensions();
        
        // Apply origin offset to starting position
        let startX = this.x - (containerDimensions.width * this.originX);
        let startY = this.y - (containerDimensions.height * this.originY);
        
        // Define positions for each item based on calculated dimensions
        if (this.layout === 'vertical') {
            // For vertical layout, calculate item positions based on actual dimensions
            let yOffset = 0;
            
            this.items.forEach((item, index) => {
                // Position the item at the current offset
                item.setPosition(startX, startY + yOffset);
                
                // Calculate actual dimensions for this item
                const dimensions = this.getItemDimensions(item);
                
                // Add this item's height plus spacing to the offset for the next item
                yOffset += dimensions.height + this.spacing;
            });
        } else {
            // For horizontal layout, use standard positioning logic
            let currentX = startX;
            
            this.items.forEach((item, index) => {
                // Position the item
                item.setPosition(currentX, startY);
                
                // Get item dimensions
                const itemDimensions = this.getItemDimensions(item);
                
                // Increment X for next item
                currentX += itemDimensions.width + this.spacing;
            });
        }
    }
    
    /**
     * Get dimensions for a specific item based on its type and components
     * @param {UIField} item - The item to measure
     * @returns {object} - {width, height} of the item
     * @private
     */
    getItemDimensions(item) {
        let width = 0;
        let height = 0;
        let labelOffset = 0;
        let componentHeight = 0;
        
        // First check if the item has a non-empty label (adds to height)
        if (item.label && item.label.text && item.label.text.text !== '') {
            // Get the actual label height from the text component
            labelOffset = item.label.text.displayHeight;
            
            // Add the configured spacing between label and component
            if (item.spacing !== undefined) {
                labelOffset += item.spacing;
            } else {
                // If no item spacing is defined, use a reasonable value based on component type
                switch(item.inputType) {
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
        if (item.inputComponent) {
            // Handle button components
            if (item.inputType === 'button' && item.inputComponent.image) {
                width = item.inputComponent.image.displayWidth || 0;
                componentHeight = item.inputComponent.image.displayHeight || 0;
            } 
            // Handle toggle components (support for multiple options beyond on/off)
            else if (item.inputType === 'toggle') {
                // For toggle components with pills
                if (item.inputComponent.pills && item.inputComponent.pills.length > 0) {
                    // Calculate total width across all pills plus spacing
                    width = 0;
                    
                    // Get actual width by summing all pill widths plus spacing
                    for (let i = 0; i < item.inputComponent.pills.length; i++) {
                        const pill = item.inputComponent.pills[i];
                        if (pill) {
                            width += pill.displayWidth || 0;
                            // Add spacing between pills (except after the last one)
                            if (i < item.inputComponent.pills.length - 1) {
                                width += item.inputComponent.spacing || 5;
                            }
                        }
                    }
                    
                    // Get height from the first pill (they should all be same height)
                    componentHeight = item.inputComponent.pills[0] ? 
                        item.inputComponent.pills[0].displayHeight : 40;
                    
                    // Add some extra padding for hover effects
                    componentHeight += 10;
                } 
                // Fallback to options-based calculation if no pills are created yet
                else if (item.inputOptions && item.inputOptions.values) {
                    // Calculate width based on number of values and spacing
                    const numValues = item.inputOptions.values.length;
                    const valueWidth = item.inputOptions.size ? item.inputOptions.size[0] : 80;
                    const spacing = item.inputOptions.spacing || 5;
                    
                    width = (valueWidth * numValues) + (spacing * (numValues - 1));
                    componentHeight = item.inputOptions.size ? item.inputOptions.size[1] : 40;
                } 
                // Last resort fallback
                else {
                    width = 300;
                    componentHeight = 40;
                }
            } 
            // Handle text input components
            else if (item.inputType === 'textinput' && item.inputComponent.background) {
                width = item.inputComponent.background.displayWidth || 0;
                componentHeight = item.inputComponent.background.displayHeight || 0;
            } 
            // Handle slider components
            else if (item.inputType === 'slider') {
                if (item.inputComponent.track) {
                    width = item.inputComponent.track.displayWidth || 0;
                    // Add extra height for the handle and to prevent overlap with next element
                    componentHeight = item.inputComponent.track.displayHeight + 20;
                }
                // If we have a slider value text, make sure we account for its height
                if (item.inputComponent.valueText) {
                    componentHeight += item.inputComponent.valueText.displayHeight || 0;
                }
            }
        }
        
        // Fallback to options if we couldn't determine from component
        if (width === 0 && item.inputOptions && item.inputOptions.size) {
            width = item.inputOptions.size[0] || 0;
            if (componentHeight === 0) {
                componentHeight = item.inputOptions.size[1] || 0;
            }
        }
        
        // Fallback to nested inputOptions if still not found
        if (width === 0 && item.options && item.options.inputOptions && item.options.inputOptions.size) {
            width = item.options.inputOptions.size[0] || 0;
            if (componentHeight === 0) {
                componentHeight = item.options.inputOptions.size[1] || 0;
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
        this.updateItemPositions();
        return this;
    }
    
    /**
     * Get a item by index
     * @param {number} index - Index of the item to get
     * @returns {UIField|null} - The item at the specified index or null
     */
    getItemAt(index) {
        if (index >= 0 && index < this.items.length) {
            return this.items[index];
        }
        return null;
    }
    
    /**
     * Calculate the total dimensions of the container based on items and layout
     * @private
     * @returns {object} - {width, height} of the container
     */
    calculateContainerDimensions() {
        // Use base dimensions if no items
        if (this.items.length === 0) {
            return { width: 0, height: 0 };
        }
        
        // Attempt to get actual dimensions from items
        let maxWidth = 0;
        let totalHeight = 0;
        
        // Examine each item to get dimensions where possible
        this.items.forEach(item => {
            // Get dimensions for this item using our helper method
            const dimensions = this.getItemDimensions(item);
            
            // Track the maximum width for all items
            maxWidth = Math.max(maxWidth, dimensions.width);
            
            // For vertical layout, accumulate total height
            if (this.layout === 'vertical') {
                totalHeight += dimensions.height + (this.items.indexOf(item) < this.items.length - 1 ? this.spacing : 0);
            }
        });
        
        // If we couldn't determine dimensions, use reasonable defaults
        if (maxWidth === 0) maxWidth = 300;
        if (totalHeight === 0 && this.layout === 'vertical') totalHeight = this.items.length * 100;
        
        // Calculate total dimensions based on layout
        if (this.layout === 'vertical') {
            // For vertical layout, width is the maximum item width,
            // height is the accumulated heights plus spacing
            return {
                width: maxWidth,
                height: totalHeight
            };
        } else {
            // For horizontal layout, calculate based on individual item widths
            let totalWidth = 0;
            let maxHeight = 0;
            
            this.items.forEach(item => {
                const dimensions = this.getItemDimensions(item);
                totalWidth += dimensions.width + (this.items.indexOf(item) < this.items.length - 1 ? this.spacing : 0);
                maxHeight = Math.max(maxHeight, dimensions.height);
            });
            
            return {
                width: totalWidth,
                height: maxHeight
            };
        }
    }
    
    /**
     * Destroy all items and clean up resources
     */
    destroy() {
        // Destroy all items
        this.items.forEach(item => {
            if (item.destroy && typeof item.destroy === 'function') {
                item.destroy();
            }
        });
        
        this.items = [];
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
        
        // Update item positions based on new origin
        this.updateItemPositions();
        
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
        
        // Validate items if provided
        if (options.items !== undefined && !Array.isArray(options.items)) {
            throw new Error('Items must be an array');
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