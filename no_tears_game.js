// Create canvas
var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
                      "' height='" + CANVAS_HEIGHT + "'></canvas>");
canvasElement.appendTo('body');

var c = $( 'canvas' ).get(0).getContext("2d");

//Game loop
var FPS = 30;
var time = 0;
setInterval(function() {
	update();
	draw();
	timer();
}, 1000/FPS);

function update() {
	if (playing) {
		if (keydown.space && time < 5) {
			player.shoot();
		}
	
		if (keydown.left) {
			player.x -= 5;
		}
	
		if (keydown.right) {
			player.x += 5;
		}
	
		player.clamp(0, CANVAS_WIDTH - player.width);
	
		playerBullets.forEach(function(bullet) {
			bullet.update();
		});
	
		playerBullets = playerBullets.filter(function(bullet) {
			return bullet.active;
		});
	
		enemies.forEach(function(enemy) {
			enemy.update();
		});
	
		enemies = enemies.filter(function(enemy) {
			return enemy.active;
		});
	
		if (Math.random() < 0.1) {
			enemies.push(Enemy())
		}
	
		handleCollisions();
	}
}

function draw() {
	c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	player.draw();
	playerBullets.forEach(function(bullet) {
		bullet.draw();
	});
	enemies.forEach(function(enemy) {
		enemy.draw();
	});
}

function timer() {
	time++;
	time = time % 10;
}

var textX = 50;
var textY = 50;

// Player 
var player = {
	color: "#00A",
	x: 220,
	y: 270,
	width: 32,
	height: 32,

	sprite: Sprite("player"),

	draw: function() {
		this.sprite.draw(c, this.x, this.y);
	},

	clamp: function(left, right) {
		if (this.x < left) {
			this.x = left;
		}

		if (this.x > right) {
			this.x = right;
		}
	},

	shoot: function() {
		var bulletPosition = this.midpoint();

		playerBullets.push(Bullet({
			speed: 5,
			x: bulletPosition.x,
			y: bulletPosition.y
		}));
	},

	midpoint: function() {
		return {
			x: this.x + this.width/2,
			y: this.y + this.height/2,
		};
	},

	explode: function() {
		this.active = false;
		c.fillStyle = "black";
		c.beginPath();
		c.arc(this.x, this.y, 20, 0, Math.PI*2);
		c.closePath();
		c.fill();
		endGame();
	}
};

// Projectiles
var playerBullets = [];

function Bullet(I) {
	I.active = true;

	I.xVelocity = 0;
	I.yVelocity = -I.speed;

	I.width = 3;
	I.height = 3;

	I.color = "black";

	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_WIDTH;
	};

	I.draw = function() {
		c.fillStyle = this.color;
		c.fillRect(this.x, this.y, this.width, this.height);
	};

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.active = I.active && I.inBounds();
	};

	return I;
}

// Enemies
var enemies = [];

function Enemy(I) {
	I = I || {};

	I.active = true;
	I.age = Math.floor(Math.random() * 128);

	I.sprite = Sprite("enemy");

	I.x = CANVAS_WIDTH/4 + Math.random() * CANVAS_WIDTH/2;
	I.y = 0;
	I.xVelocity = 0;
	I.yVelocity = 2;

	I.explode = function() {
		this.active = false;
		c.fillStyle = "red";
		c.beginPath();
		c.arc(this.x, this.y, 20, 0, Math.PI*2);
		c.closePath();
		c.fill();
	}

	I.width = 32;
	I.height = 32;

	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT
	};

	I.draw = function() {
		this.sprite.draw(c, this.x, this.y);
	};

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.xVelocity = 3 * Math.sin(I.age * Math.PI/64);

		I.age++;

		I.active = I.active && I.inBounds();
	};

	return I;
}

// Collision detection
function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function handleCollisions() {
  playerBullets.forEach(function(bullet) {
    enemies.forEach(function(enemy) {
      if (collides(bullet, enemy)) {
        enemy.explode();
        bullet.active = false;
      }
    });
  });

  enemies.forEach(function(enemy) {
    if (collides(enemy, player)) {
      enemy.explode();
      player.explode();
    }
  });
}

// End game
var playing = true;
function endGame() {
	canvasElement.remove();
	$( 'body' ).append( "<h1>Game Over</h1>" );
	playing = false;
}


