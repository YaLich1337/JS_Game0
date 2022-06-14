"use strict";

let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

let currentLevelNumber = 0;
let currentLevel = new Level(currentLevelNumber);

let CANVAS_WIDTH = 1200;
let CANVAS_HEIGHT = 600;
let TARGET_FPS = 60;
let TARGET_FRAMETIME = 1000 / TARGET_FPS;

let lastTimeStamp = window.performance.now();

let controller = {
	left: false,
	right: false,
	up: false,
	down: false,
	shoot: false,
	KeyListener(evt) {
		let keyState = (evt.type == "keydown") ? true : false;
		switch (evt.keyCode) {
			case 37:
				controller.reload();
				controller.left = keyState;
				break;
			case 38:
				controller.reload();
				controller.up = keyState;
				break;
			case 39:
				controller.reload();
				controller.right = keyState;
				break;
			case 40:
				controller.reload();
				controller.down = keyState;
				break;
			case 32://пробел - пиу
				//controller.reload();
				controller.shoot = keyState;
				break;
		}
	},
	reload() {
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
	}
};

function Obstacle(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.style = '#8B4513';
	
	this.draw = function(context) {
		context.fillStyle = this.style;
		context.fillRect(this.x, this.y, this.width, this.height);
	};
}

function Сoin(x, y, width = 25, height = 25) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.style = '#eac448';
	
	this.draw = function(context) {
		context.fillStyle = this.style;
		context.fillRect(this.x, this.y, this.width, this.height);
	};
}

function Tree(x, y, width = 64, height = 64) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.img = new Image();
	this.img.src = 'img/tree.png';
	
	this.draw = function(context) {
		context.drawImage(this.img, this.x, this.y, this.width, this.height);
	};
}

function Bullet(x, y, width = 32, height = 32) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.img = new Image();
	this.img.src = 'img/bullet.png';
	
	this.draw = function(context) {
		context.drawImage(this.img, this.x, this.y, this.width, this.height);
	};
	
	this.move = function(time) {
		/*this.x += this.xSpeed * time;
		this.y += this.ySpeed * time;
		this.xSpeed = 0.8 * this.xSpeed;
		this.ySpeed = 0.8 * this.ySpeed;*/
		console.log("Bullet move");
	};
}

function Player(x = 0, y = 0, width = 64, height = 64) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.xPrev = x;
	this.yPrev = y;
	this.maxSpeed = 500; //px per sec
	this.boost = 200; //ускорение px per sec
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.coins = 0;
	this.lastShootTimeStamp = 0;
	this.shootColldown = 1000;//милисекунд
	this.style = '#000000';
	this.img = new Image();
	this.img.src = 'img/up.png';

	this.draw = function(context) {
		//context.fillStyle = this.style;
		//context.fillRect(this.x, this.y, this.width, this.height);
		context.drawImage(this.img, this.x, this.y, this.width, this.height);
	};
	
	this.move = function(time) {
		this.x += this.xSpeed * time;
		this.y += this.ySpeed * time;
		this.xSpeed = 0.8 * this.xSpeed;
		this.ySpeed = 0.8 * this.ySpeed;
	};
	
	this.moveUp = function(time) {
		this.ySpeed -= this.boost;
		this.ySpeed = (this.ySpeed < -this.maxSpeed) ? -this.maxSpeed : this.ySpeed;
		this.img.src = 'img/up.png';
	};
	
	this.moveDown = function(time) {
		this.ySpeed += this.boost;
		this.ySpeed = (this.ySpeed > this.maxSpeed) ? this.maxSpeed : this.ySpeed;
		this.img.src = 'img/down.png';
	};
	
	this.moveLeft = function(time) {
		this.xSpeed -= this.boost;
		this.xSpeed = (this.xSpeed < -this.maxSpeed) ? -this.maxSpeed : this.xSpeed;
		this.img.src = 'img/left.png';
	};
	
	this.moveRight = function(time) {
		this.xSpeed += this.boost;
		this.xSpeed = (this.xSpeed > this.maxSpeed) ? this.maxSpeed : this.xSpeed;
		this.img.src= 'img/right.png';
	};
	
	this.shoot = function() {
		let now = window.performance.now();
		if (this.lastShootTimeStamp + this.shootColldown < now) {
			this.lastShootTimeStamp = now;
			console.log("piu: ", now);
		}
	};
}

function Level(number, player) {
	this.number = number;
	this.obstacles = new Map();
	this.obstaclesNextID = 0;
	this.coins = new Map();
	this.coinsNextID = 0;
	this.targetCoins = 0;
	this.player = player;
	this.trees = new Map();
	this.treesNextID = 0;
	this.bullets = new Map();
	this.bulletsNextID = 0;
	
	this.draw = function(context) {
		this.player.draw(context);
		//препятствия
		for (let obstacle of this.obstacles.values()) {
			obstacle.draw(context);
		}
		//монетки
		for (let coin of this.coins.values()) {
			coin.draw(context);
		}
		//деревья
		for (let tree of this.trees.values()) {
			tree.draw(context);
		}
		//пули
		for (let bullet of this.bullets.values()) {
			bullet.draw(context);
		}
	};
	
	this.addObstacle = function(x, y, width, height) {
		let obstacle = new Obstacle(x, y, width, height);
		obstacle.id = this.obstaclesNextID;
		this.obstaclesNextID++;
		this.obstacles.set(obstacle.id, obstacle);
	};
	
	this.addCoin = function(x, y, width, height) {
		let coin = new Сoin(x, y, width, height);
		coin.id = this.coinsNextID;
		this.coinsNextID++;
		this.coins.set(coin.id, coin);
		this.targetCoins++;
	};
	
	this.addTree = function(x, y, width, height) {
		let tree = new Tree(x, y, width, height);
		tree.id = this.treesNextID;
		this.treesNextID++;
		this.trees.set(tree.id, tree);
	};
	
	this.handlePlayerObstacleCollisions = function() {
		//обработка столкновений игрока с препятствиями
		for (let obstacle of this.obstacles.values()) {
			if (isCollided(this.player, obstacle)) {
				if (this.player.xPrev >= obstacle.x + obstacle.width) {
					this.player.x = obstacle.x + obstacle.width;
				}
				if (this.player.xPrev + this.player.width <= obstacle.x) {
					this.player.x = obstacle.x - this.player.width;
				}
				if (this.player.yPrev + this.player.height <= obstacle.y) {
					this.player.y = obstacle.y - this.player.height;
				}
				if (this.player.yPrev >= obstacle.y + obstacle.height) {
					this.player.y = obstacle.y + obstacle.height;
				}
			}	  
		}
		//с деревьями
		for (let obstacle of this.trees.values()) {
			if (isCollided(this.player, obstacle)) {
				if (this.player.xPrev >= obstacle.x + obstacle.width) {
					this.player.x = obstacle.x + obstacle.width;
				}
				if (this.player.xPrev + this.player.width <= obstacle.x) {
					this.player.x = obstacle.x - this.player.width;
				}
				if (this.player.yPrev + this.player.height <= obstacle.y) {
					this.player.y = obstacle.y - this.player.height;
				}
				if (this.player.yPrev >= obstacle.y + obstacle.height) {
					this.player.y = obstacle.y + obstacle.height;
				}
			}	  
		}
	};
	
	this.handlePlayerCoinCollisions = function() {
		//обработка столкновений игрока с монетками
		for (let coin of this.coins.values()) {
			if(isCollided(this.player, coin)) {
				this.player.coins += 1;
				this.coins.delete(coin.id);
			}
		}
	};
	
	this.handleBulletsCollisions = function() {
		//обработка столкновений пуль
		for (let bullet of this.bullets.values()) {
			for (let tree of this.trees.values()) {
				if(isCollided(bullet, tree)) {
					this.bullets.delete(bullet.id);
					this.trees.delete(tree.id);
				}
			}
		}
	};
	
	this.handleCollisions = function() {
		//обработка столкновений
		this.handlePlayerObstacleCollisions();
		this.handlePlayerCoinCollisions();
	};
	
	this.update = function(frametime) {
		let time = frametime / 1000;//для рассчета пройденого пути
		
		//обработка состояний
		this.player.xPrev = this.player.x;
		this.player.yPrev = this.player.y;
		
		//обработка ввода
		if (controller.left) {
			this.player.moveLeft(time);
		}

		if (controller.right) {
			this.player.moveRight(time);
		}
		
		if (controller.up) {
			this.player.moveUp(time);
		}

		if (controller.down) {
			this.player.moveDown(time);
		}
		this.player.move(time);
		
		if (controller.shoot) {
			this.player.shoot();
		}
		
		//обработка выхода за границы канваса
		if (this.player.x < 0) {
			this.player.x = 0;
		}
		if (this.player.y < 0) {
			this.player.y = 0;
		}

		if (this.player.x > CANVAS_WIDTH - this.player.width) {
			this.player.x = CANVAS_WIDTH - this.player.width;
		}

		if (this.player.y > CANVAS_HEIGHT - this.player.height) {
			this.player.y = CANVAS_HEIGHT - this.player.height;
			this.player.yVelocity = 0;
		}
		
		//коллизии
		this.handleCollisions(currentLevel);
	};
}

//возвращает уровень
function getLevel(levelNumber) {
	let level = new Level(levelNumber, new Player);
	
    //сбрасываем значения
	controller.reload();
		
    if (levelNumber === 0) {
		level.addObstacle(200, 300, 20, 200);
		level.addObstacle(400, 400, 200, 20);
		level.addObstacle(600, 300, 200, 20);
		level.addCoin(250, 450);
		level.addCoin(500, 360);
		level.addCoin(650, 250, 35, 35);
		level.addTree(200, 100);
		level.addTree(300, 100);
		level.addTree(400, 100);
    }

    if (levelNumber === 1) {
        level.addObstacle(200, 300, 200, 20);
		level.addObstacle(400, 400, 200, 20);
		level.addObstacle(600, 500, 200, 20);
		level.addCoin(500, 360);
    }
	
	return level;
}

//самозацикленная функция для анимации
function playAnimation() {
    window.requestAnimationFrame(playAnimation);
    let nowTimeStamp = window.performance.now();
    let frametime = nowTimeStamp - lastTimeStamp;
    if (frametime >= TARGET_FRAMETIME) {
        lastTimeStamp = nowTimeStamp - (frametime % TARGET_FRAMETIME);
        updateScreen(frametime);
    }
}

//проверка пересечения объектов
function isCollided(firstObj, secondObj) {
    if (firstObj.x < secondObj.x + secondObj.width  
    && firstObj.x + firstObj.width > secondObj.x
    && firstObj.y + firstObj.height > secondObj.y
    && firstObj.y < secondObj.y + secondObj.height ) {
        return true;
    } else {
        return false;
    }
}

//обновление состояний и картинки
function updateScreen(frametime) {
    currentLevel.update(frametime);
	showFrame();

    if (currentLevel.targetCoins === currentLevel.player.coins) {
		currentLevelNumber += 1;
        if (currentLevelNumber < 2) {//костыль
            currentLevel = getLevel(currentLevelNumber);
        } else {
            alert('Игра завершена!');
            currentLevelNumber = 0;
            currentLevel = getLevel(currentLevelNumber);
        }
    }
}

//отрисовывает кадр
function showFrame() {
    //фон
    context.fillStyle = '#6B8E23';
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    //уровень
	currentLevel.draw(context);

    //интерфейс счетчика монеток
    context.fillStyle = '#0000ff';
    context.font = 'normal 30px Arial';
    context.fillText("Собрано монет: " + currentLevel.player.coins, 100, 50);
}


canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

window.addEventListener("keydown", controller.KeyListener);
window.addEventListener("keyup", controller.KeyListener);

currentLevel = getLevel(currentLevelNumber);
playAnimation();