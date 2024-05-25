class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image("Idle", "Idle.png");
        this.load.image("Jump", "Jump.png");
        this.load.image("Dead", "Dead.png")
        this.load.image("Run1", "Run1.png");
        this.load.image("Run2", "Run2.png");
        this.load.image("Run3", "Run3.png");
        this.load.image("Run4", "Run4.png");
        this.load.image("Smoke", "Smoke.png");
        this.load.image("Star", "Star.png");

        this.load.audio("Boing1", "Boing1.wav");
        this.load.audio("Boing2", "Boing2.wav");
        this.load.audio("Bonk", "Bonk.wav");
        this.load.audio("Spike", "Spike.wav");
        this.load.audio("Coin", "Coin.mp3");
        this.load.audio("Checkpoint", "Checkpoint.mp3");

        // Load tilemap information
        this.load.image("tilemap_tiles", "monochrome_tilemap_packed.png");
        this.load.image("tilemap_tiles_transparent", "monochrome_tilemap_transparent_packed.png");
        this.load.tilemapTiledJSON("GameLevel", "GameLevel.json");

        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet("tilemap_sheet_transparent", "monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        this.anims.create({
            key: 'title',
            frames: [
                {key: "Idle"},
                {key: "Jump"}
            ],
            duration: 2500,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: [
                {key: "Run1"},
                {key: "Run2"},
                {key: "Run3"}
            ],
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{key: "Idle"}],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [{key: "Jump"}]
        });

        this.anims.create({
            key: 'dead',
            frames: [{key: "Dead"}],
            repeat: -1
        });

        // ...and pass to the next Scene
        this.scene.start("title");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}