class UIManager {
    constructor() {
        this.scene = null;
    }

    updateScene(scene) {
        this.scene = scene;
    }

    createButton(options) {
        const button = new UIButton(this.scene, options);
        return button;
    }

    createSlider(options) {
        const slider = new UISlider(this.scene, options);
        return slider;
    }

    createToggle(options) {
        const toggle = new UIToggle(this.scene, options);
        return toggle;
    }
    
    createLabel(options) {
        const label = new UILabel(this.scene, options);
        return label;
    }
    
    createField(options) {
        const field = new UIField(this.scene, options);
        return field;
    }
    
    createFields(options) {
        const fields = new UIContainer(this.scene, options);
        return fields;
    }
    
    createTextInput(options) {
        const textInput = new UITextInput(this.scene, options);
        return textInput;
    }
}