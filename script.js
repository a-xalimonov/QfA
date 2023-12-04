const canvas = document.getElementById('canvas')
var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
}
//COLLIDERS
let wyrmOverlap
let rockOverlap
// EVENTS
let waveEvent
let obstacleEvent
// OBJECTS
let player
let waterBack
let waterFront
let cursors
let warriors
let sky
let background
let wyrm
let rock
let gameOver
// GAME VALUES
let crew = 7
let windSpeed = 10

let game = new Phaser.Game(config)

function preload() {
    this.load.image("warrior", "assets/warrior.png")
    this.load.image("boat", "assets/boat.png")
    this.load.image("mast", "assets/mast.png")
    this.load.image("shields", "assets/shields.png")
    this.load.image("water", "assets/water.png")
    this.load.image("waterBack", "assets/waterBack.png")
    this.load.image("sky", "assets/sky.png")
    this.load.image("background", "assets/background.png")
    this.load.image("wyrm", "assets/wyrm.png")
    this.load.image("rock", "assets/rock.png")
    this.load.image("gameover", "assets/gameover.png")
}

function create() {
    sky = this.add.tileSprite(500, 300, 1000, 600, "sky")
    background = this.add.tileSprite(500, 300, 1000, 600, "background")

    waterBack = this.add.tileSprite(500, 470, 1000, 200, "waterBack")
    waterFront = this.add.tileSprite(500, 550, 1000, 200, "water")
    waterFront.setDepth(1)

    wyrm = this.physics.add.sprite(0, 0, "wyrm").disableBody(true, true)
    rock = this.physics.add.sprite(0, 0, "rock").disableBody(true, true)

    warriors = this.physics.add.group({
        key: "warrior",
        repeat: crew - 1,
        setXY: { x: 400, y: 410, stepX: 35 },
        setScale: { x: 0.4, y: 0.4 },
        dragX: 50,
    })

    const boatSprites = [
        this.add.sprite(0, 0, "mast"),
        this.add.sprite(0, 0, "boat"),
        this.add.sprite(0, 0, "shields"),
    ]

    player = this.add.container(500, 600, boatSprites).setScale(0.5)
    this.physics.world.enable(player)
    player.body
        .setSize(650, 250)
        .setOffset(-325, 200)
        .setCollideWorldBounds(true)
        .setImmovable(true)
        .setFriction(2, 0)

    cursors = this.input.keyboard.createCursorKeys()

    this.physics.add.collider(player, warriors)
    wyrmOverlap = this.physics.add.overlap(wyrm, warriors, wyrmHit, null, this)
    rockOverlap = this.physics.add.overlap(player, rock, rockHit, null, this)

    // waveEvent = this.time.addEvent({
    //     delay: 1000,
    //     callback: waveEventHandler,
    // })
    obstacleEvent = this.time.addEvent({
        delay: 10000,
        callback: obstacleEventHandler,
    })
}

function update() {

    if (windSpeed < 1000) {
        windSpeed += 0.01
    }

    sky.tilePositionX -= 0.03 * windSpeed
    background.tilePositionX -= 0.05 * windSpeed
    waterBack.tilePositionX -= 0.15 * windSpeed
    waterFront.tilePositionX -= 0.2 * windSpeed

    crew = 7
    warriors.children.iterate(function (warrior) {
        warrior.setRotation(-0.002 * player.body.velocity.x)
        if (warrior.body.center.y > 600) {
            crew--
        }
    })
    if (crew === 0) {
        this.add.sprite(500, 100, 'gameover')
    }
    
    //Анимация корабля
    player.list[0].setRotation(-player.body.rotation / 90)
    player.list[2].setX(-player.body.velocity.x / 10)
    player.list[2].setY(-player.body.velocity.y / 10)

    //Клавиатура
    if (cursors.left.isDown) {
        player.body.setAccelerationX(-200)
    } else if (cursors.right.isDown) {
        player.body.setAccelerationX(200)
    } else {
        player.body.setAccelerationX(-player.body.velocity.x)
    }
    if (cursors.up.isDown && player.body.center.y > 500)
    {
        player.body.setVelocityY(-150);
    }
    player.body.setAngularVelocity(
        -0.3 * player.body.rotation - 0.1 * player.body.acceleration.x
    )
}

// function waveEventHandler() {
//     if (player.body.center.y > 500) {
//         player.body.setVelocityY(-windSpeed - (600 - player.body.center.y))
//     }
//     waveEvent.reset({
//         delay: (1000 * 10) / windSpeed + 500,
//         callback: waveEventHandler,
//     })
// }

function obstacleEventHandler() {
    obstacleEvent.reset({
        delay: 3000 * Math.random() + 35000 / windSpeed + 5000,
        callback: obstacleEventHandler,
    })

    if (Math.random() > 0.4) {
        rock.enableBody(true, -200, 450, true, true)
            .setVelocityX(6 * windSpeed)
            .body.setAllowGravity(false)
        rock.disabled = false
    } else {
        wyrm.enableBody(true, -200, 400, true, true)
            .setVelocity(6 * windSpeed, 0)
            .setScale(0.8)
            .body.setAllowGravity(false)
    }
}

function wyrmHit(wyrm, warrior) {
    wyrm.setVelocityY(250)
    const power = 40 * Math.random() + 20
    warrior.body.setVelocity(2 * power, -5 * power)
}

function rockHit(player, rock) {
    if (!rock.disabled) {
        rock.disabled = true
        rock.setVelocityY(200)
        player.body.setVelocity(5 * windSpeed, -100)
    }
}
