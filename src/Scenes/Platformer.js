class Platformer extends Phaser.Scene {
    constructor() {
        super("platformer");
    }

    init() {
        // variables and settings
        this.MAX_SPEED = 200;
        this.ACCELERATION = 250;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -400;
        this.physics.world.TILE_BIAS = 24;
        this.PARTICLE_VELOCITY = 50;

        this.score = 0;
        this.hasKey = false;
        this.isDead = false;
        this.passedCheckpoint = false;
    }

    create() {
        // Create a new tilemap game object
        this.map = this.add.tilemap("GameLevel", 16, 16, 150, 20);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_tiles");
        this.tilesetTransparent = this.map.addTilesetImage("monochrome_tilemap_transparent_packed", "tilemap_tiles_transparent");

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);

        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);

        this.interactablesLayer = this.map.createLayer("Interactables", this.tileset, 0, 0);

        this.decorLayer = this.map.createLayer("Decor", this.tileset, 0, 0);

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet_transparent",
            frame: 2
        });

        this.jumpPads = this.map.createFromObjects("Objects", {
            name: "jumpPad",
            key: "tilemap_sheet_transparent",
            frame: 163
        });

        this.invisBoxes = this.map.createFromObjects("Objects", {
            name: "invisBox",
            key: "tilemap_sheet",
            frame: 27
        });
        this.spikes = this.map.createFromObjects("Objects", {
            name: "spike",
            key: "tilemap_sheet_transparent",
            frame: 122
        });

        this.checkpoint = this.map.createFromObjects("Objects", {
            name: "checkpoint",
            key: "tilemap_sheet",
            frame: 389
        });

        this.key = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet_transparent",
            frame: 96
        });

        this.door = this.map.createFromObjects("Objects", {
            name: "door",
            key: "tilemap_sheet",
            frame: 56
        });

        my.vfx.walking = this.add.particles(0, 0, "Smoke", {
            scale: {start: 0.005, end: 0.01, random: true},
            lifespan: 150,
            alpha: {start: 1, end: 0.1}
        });

        my.vfx.jump = this.add.particles(0, 0, "Star", {
            scale: 0.12,
            lifespan: 300,
            alpha: {start: 1, end: 0.1}
        });

        my.vfx.walking.stop();
        my.vfx.jump.stop();

        this.coinGroup = this.add.group(this.coins);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.jumpPads, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.invisBoxes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.checkpoint, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);

        this.coins.forEach(coin => {
            coin.body.setSize(coin.width - 6, coin.height - 4);
            coin.body.setOffset(3, 2);

            this.coinAnim = this.tweens.add({
                targets: coin,
                scaleX: {value: 0},
                yoyo: true,
                duration: 400,
                ease: 'Linear',
                repeat: -1
            });
        });

        this.jumpPads.forEach(jumpPad => {
            jumpPad.body.setSize(jumpPad.width, jumpPad.height - 7);
            jumpPad.body.setOffset(0, 7);
        });

        this.spikes.forEach(spike => {
            spike.body.setSize(spike.width, spike.height - 9);
            spike.body.setOffset(0, 9);
        });

        this.door.forEach(door => {
            door.body.setSize(door.width - 12, door.height - 12);
            door.body.setOffset(6, 12);
        });

        this.groundLayer.forEachTile(tile => {
            if (tile.properties["collides"]) {
                tile.setCollision(true, true, true, true);
            }
        });

        this.groundLayer.forEachTile(tile => {
            if (tile.properties["OneWay"]) {
                tile.setCollision(false, false, true, false);
            }
        });

        // set up player avatar
        this.playerSpawn = this.map.findObject("Objects", obj => obj.name === "spawn")
        my.sprite.player = this.physics.add.sprite(this.playerSpawn.x, this.playerSpawn.y, "Idle");
        my.sprite.player.body.setSize(my.sprite.player.width - 2, my.sprite.player.height - 4, true);
        my.sprite.player.body.setOffset(1, 4);
        my.sprite.player.body.maxVelocity.x = this.MAX_SPEED;

        this.cameras.main.setZoom(SCALE, SCALE);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, false, 1, 0);

        let scoreStyle = { 
            fontSize: 24,
            color: 'White',
            fontFamily: 'Verdana',
            align: "left"
        };

        my.text.score = this.add.text(365, 480, this.score, scoreStyle).setOrigin(0, 1);
        my.text.score.setScrollFactor(0);

        my.sprite.player.body.setCollideWorldBounds(true);
        my.sprite.player.body.onWorldBounds = true;
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.on('worldbounds', (body, up, down, left, right) => {
            if(down && !this.isDead){
                this.isDead = true;
                this.input.keyboard.manager.enabled = false;
                this.resetKeys([cursors.up, cursors.down, cursors.left, cursors.right]);
                my.sprite.player.anims.play('dead');
                this.sound.play("Bonk", {
                    volume: 0.4
                });

                setTimeout(() => {
                    my.sprite.player.body.reset(this.playerSpawn.x, this.playerSpawn.y);
                        
                    this.input.keyboard.manager.enabled = true;
                    this.isDead = false;
                }, 1000);
            }
        });

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.sound.play("Coin", {
                volume: 0.4
            });
            this.score++;
            my.text.score.setText(this.score);
        });

        this.physics.add.overlap(my.sprite.player, this.jumpPads, (obj1, obj2) => {
            if(obj1.body.touching.down && obj2.body.touching.up && !obj1.body.blocked.down) {
                if(cursors.up.isDown){
                    obj1.body.setVelocityY(1.5 * this.JUMP_VELOCITY);
                    obj2.setTexture("tilemap_sheet_transparent", 165);
                    this.sound.play("Boing2", {
                        volume: 0.4
                    });

                    setTimeout(() => {
                        obj2.setTexture("tilemap_sheet_transparent", 163)
                    }, 400);
                }
                else{
                    obj1.body.setVelocityY(this.JUMP_VELOCITY);
                    obj2.setTexture("tilemap_sheet_transparent", 164);
                    this.sound.play("Boing1", {
                        volume: 0.4
                    });

                    setTimeout(() => {
                        obj2.setTexture("tilemap_sheet_transparent", 163)
                    }, 200);
                }
            }
        });

        this.physics.add.collider(my.sprite.player, this.invisBoxes, (obj1, obj2) => {

            // check if the player is standing on the platform
            if(obj1.body.touching.down && obj2.body.touching.up) {
                // change the platform texture
                obj2.setTexture("tilemap_sheet", 47);

                setTimeout(() => {
                    // make the platform invisible
                    obj2.setVisible(false);
                    //disable the platform
                    obj2.body.enable = false;
                }, 1000); // 1 second delay

                setTimeout(() => {
                    // change back to original platform texture
                    obj2.setTexture("tilemap_sheet", 67);
                    // make the platform visible
                    obj2.setVisible(true);
                    // re-enable the platform
                    obj2.body.enable = true;
                }, 2000); // 2 second delay
            }

        });

        this.physics.add.collider(my.sprite.player, this.spikes, (obj1, obj2) => {
            if(obj1.body.touching.down && obj2.body.touching.up && !this.isDead){
                this.isDead = true;
                this.input.keyboard.manager.enabled = false;
                this.resetKeys([cursors.up, cursors.down, cursors.left, cursors.right]);
                my.sprite.player.anims.play('dead');
                this.sound.play("Spike", {
                    volume: 0.4
                });

                setTimeout(() => {
                    my.sprite.player.body.reset(this.playerSpawn.x, this.playerSpawn.y);
                        
                    this.input.keyboard.manager.enabled = true;
                    this.isDead = false;
                }, 1000);
            }
        });

        this.physics.add.overlap(my.sprite.player, this.checkpoint, (obj1, obj2) => {
            if(!this.passedCheckpoint){
                this.passedCheckpoint = true;
                this.playerSpawn = obj2;
                obj2.setTexture("tilemap_sheet", 390);
                this.sound.play("Checkpoint", {
                volume: 0.4
            });
            }
        });

        this.physics.add.overlap(my.sprite.player, this.key, (obj1, obj2) => {
            obj2.destroy();
            this.door[0].setTexture("tilemap_sheet", 58);
            this.hasKey = true;
        });

        this.physics.add.overlap(my.sprite.player, this.door, (obj1, obj2) => {
            if(this.hasKey) this.scene.start("end", {score: this.score});
        });

        // debug key listener (assigned to D key)
        /*this.input.keyboard.on('keydown-L', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);*/
    }

    update() {
        if (cursors.left.isDown) {
            if(my.sprite.player.body.velocity.x > 0) my.sprite.player.body.setVelocityX(0);
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-4, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) my.vfx.walking.start();

        } else if (cursors.right.isDown) {
            if(my.sprite.player.body.velocity.x < 0) my.sprite.player.body.setVelocityX(0);
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);

            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-11, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) my.vfx.walking.start();

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setVelocityX(0);
            
            if(!this.isDead) my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            my.vfx.walking.stop();
            my.vfx.jump.stop();
        }
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

            my.vfx.jump.startFollow(my.sprite.player, 0, my.sprite.player.displayHeight/2, false);
            my.vfx.jump.setParticleSpeed(0, 0);
            my.vfx.jump.start();
        }
    }

    resetKeys(keys) {
        keys.forEach(key => {
            key.isDown = false;
            key.reset();
        });
    }
}