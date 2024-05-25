class Title extends Phaser.Scene {
    constructor() {
        super("title");
    }

    preload() {

    }

    create() {
        let titleStyle = { 
            fontSize: 75,
            color: 'White',
            fontFamily: 'Verdana',
            align: "center"
        };

        let textStyle = { 
            fontSize: 30,
            color: 'White',
            fontFamily: 'Verdana',
            align: "center"
        };

        my.sprite.titleChar = this.physics.add.sprite(this.game.config.width/2, this.game.config.height/2, "Idle").setOrigin(0.5, 0.5);
        my.sprite.titleChar.setScale(6);
        my.sprite.titleChar.anims.play("title");

        my.text.title = this.add.text(game.config.width/2, game.config.height/2 - 150, "Trollo's Tricky Trek", titleStyle).setOrigin(0.5, 0.5);
        my.text.begin = this.add.text(game.config.width/2, game.config.height/2 + 150, "Press SPACE to Begin!", textStyle).setOrigin(0.5, 0.5);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.scene.start("platformer");
    }
}