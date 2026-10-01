.flash filename="snake.swf" version=8 fps=30 bbox=480x360 background=#0e1a12

.frame 1
.action:
Stage.scaleMode = "noScale";
Stage.align = "TL";

var CELL = 20;
var COLS = 24;
var ROWS = 16;
var W = COLS * CELL;
var PLAYH = ROWS * CELL;
var TOP = 40;

var fmt = new TextFormat();
fmt.font = "_sans";
fmt.size = 15;
fmt.bold = true;
fmt.color = 0xFFFFFF;

this.createTextField("hud", 100, 10, 8, W - 20, 22);
hud.selectable = false;

var overFmt = new TextFormat();
overFmt.font = "_sans";
overFmt.size = 16;
overFmt.bold = true;
overFmt.color = 0xFFD24A;
overFmt.align = "center";

this.createTextField("over", 101, 0, TOP + PLAYH / 2 - 14, W, 24);
over.selectable = false;

this.createEmptyMovieClip("board", 10);

var snake;
var dir;
var nextDir;
var food;
var score;
var alive;
var tick;
var step;

function placeFood() {
	var ok = false;
	while (!ok) {
		food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
		ok = true;
		for (var i = 0; i < snake.length; i++) {
			if (snake[i].x == food.x && snake[i].y == food.y) {
				ok = false;
			}
		}
	}
}

function reset() {
	snake = [ { x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 } ];
	dir = { x: 1, y: 0 };
	nextDir = { x: 1, y: 0 };
	score = 0;
	alive = true;
	tick = 0;
	step = 6;
	over.text = "";
	placeFood();
	updateHud();
}

function updateHud() {
	hud.text = "Score: " + score + "      Arrow keys to move";
	hud.setTextFormat(fmt);
}

function cell(gx, gy, col) {
	var px = gx * CELL;
	var py = TOP + gy * CELL;
	board.beginFill(col, 100);
	board.moveTo(px + 1, py + 1);
	board.lineTo(px + CELL - 1, py + 1);
	board.lineTo(px + CELL - 1, py + CELL - 1);
	board.lineTo(px + 1, py + CELL - 1);
	board.lineTo(px + 1, py + 1);
	board.endFill();
}

function render() {
	board.clear();
	board.beginFill(0x14261a, 100);
	board.moveTo(0, TOP);
	board.lineTo(W, TOP);
	board.lineTo(W, TOP + PLAYH);
	board.lineTo(0, TOP + PLAYH);
	board.lineTo(0, TOP);
	board.endFill();
	cell(food.x, food.y, 0xEF5350);
	for (var i = 0; i < snake.length; i++) {
		cell(snake[i].x, snake[i].y, i == 0 ? 0xB9F27C : 0x62B34a);
	}
}

reset();
render();

this.onEnterFrame = function() {
	if (Key.isDown(Key.LEFT) && dir.x != 1) {
		nextDir = { x: -1, y: 0 };
	} else if (Key.isDown(Key.RIGHT) && dir.x != -1) {
		nextDir = { x: 1, y: 0 };
	} else if (Key.isDown(Key.UP) && dir.y != 1) {
		nextDir = { x: 0, y: -1 };
	} else if (Key.isDown(Key.DOWN) && dir.y != -1) {
		nextDir = { x: 0, y: 1 };
	}

	if (!alive) {
		if (Key.isDown(Key.SPACE)) {
			reset();
			render();
		}
		return;
	}

	tick += 1;
	if (tick < step) {
		return;
	}
	tick = 0;

	dir = nextDir;
	var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

	if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
		alive = false;
	} else {
		for (var i = 0; i < snake.length; i++) {
			if (snake[i].x == head.x && snake[i].y == head.y) {
				alive = false;
			}
		}
	}

	if (!alive) {
		over.text = "Game Over  -  Score: " + score + "   (press Space)";
		over.setTextFormat(overFmt);
		return;
	}

	snake.unshift(head);
	if (head.x == food.x && head.y == food.y) {
		score += 1;
		updateHud();
		placeFood();
	} else {
		snake.pop();
	}

	render();
};
.end

.end
