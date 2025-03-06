class UIManager {
    constructor() {
        this.scene = null;

    }

    updateScene(scene) {
        this.scene = scene;
    }

    createButton(options) {
        const button = new UIButton(this.scene,options)
        return button;
    }

    createSlider(options) {
        const slider = new UISlider(this.scene,options)
        return slider;
    }

    createToggle(options) {
        const toggle = new UIToggle(this.scene,options)
        return toggle;
    }
}