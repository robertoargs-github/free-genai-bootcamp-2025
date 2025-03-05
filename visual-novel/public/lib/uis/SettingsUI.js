class SettingsUI {
    constructor(UIManager, scene) {
        this.uim = UIManager;
        this.scene = scene;
    }

    create() {
        this.createBg();
        this.createBgmVolumeSlider();
        //this.createSfxVolumeSlider();
        //this.createFontSlider();
        //this.createActions();
    }

    show(){

    }

    hide(){

    }

    createBg(){
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const x = 0;
        const y = 0;

        const panel = this.scene.add.rectangle(x, y, width, height, 0x222222, 1).setOrigin(0, 0);
        // Title
        const title = this.scene.add.text(x, y - height / 2 + 30, 'Settings', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);
    }

    createBgmVolumeSlider(){
        this.uim.createSlider({
            min: 0,
            max: 1,
            value: 0.5,
            position: [0,0],
            size: [300,80],
            eventHandle: "settings-bgm-volume"
        })
    }

    createActions(){
        this.createButtonApply();
        this.createButtonCancel();
    }

    createButtonApply(){
        const x = 100
        const y = 100
        const buttonWidth = 300;
        const buttonHeight = 80;
        this.uim.createButton({
            text: "Apply",
            size: [buttonWidth,buttonHeight],
            position: [x, y],
            eventHandle: "settings-apply"
        })
    }

    createButtonCancel(){
        const x = 100
        const y = 100
        const buttonWidth = 300;
        const buttonHeight = 80;
        this.uim.createButton({
            text: "Cancel",
            size: [buttonWidth,buttonHeight],
            position: [x, y],
            eventHandle: "settings-cancel"
        })
    }


}