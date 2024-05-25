class End extends Phaser.Scene {
    constructor() {
        super("end");
    }

    init(data){
        this.finalScore = data.score;
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

        my.text.score = this.add.text(game.config.width/2, game.config.height/2 - 100, "Coins Collected: " + this.finalScore, titleStyle).setOrigin(0.5, 0.5);
        my.text.begin = this.add.text(game.config.width/2, game.config.height/2 + 50, "Press SPACE to Play Again!", textStyle).setOrigin(0.5, 0.5);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.scene.start("title");
    }
}