.flash filename="catch.swf" version=8 fps=30 bbox=480x360 background=#1a2b4a

.frame 1
.action:
Stage.scaleMode = "noScale";
Stage.align = "TL";

var W = 480;
var H = 360;

var titleFmt = new TextFormat();
titleFmt.font = "_sans";
titleFmt.size = 15;
titleFmt.bold = true;
titleFmt.color = 0xFFFFFF;

this.createTextField("hud", 100, 10, 8, 460, 22);
hud.selectable = false;
hud.embedFonts = false;

var score = 0;
var lives = 3;
var over = false;

function updateHud() {
	if (over) {
		hud.text = "Game Over  -  Score: " + score + "   (click to restart)";
	} else {
		hud.text = "Score: " + score + "      Lives: " + lives;
	}
	hud.setTextFormat(titleFmt);
}

this.createEmptyMovieClip("paddle", 10);
paddle.beginFill(0xFFD24A, 100);
paddle.moveTo(-42, -9);
paddle.lineTo(42, -9);
paddle.lineTo(42, 9);
paddle.lineTo(-42, 9);
paddle.lineTo(-42, -9);
paddle.endFill();
paddle._y = H - 26;
paddle._x = W / 2;

this.createEmptyMovieClip("item", 20);
item.beginFill(0x8AE234, 100);
item.moveTo(0, -11);
item.lineTo(11, 0);
item.lineTo(0, 11);
item.lineTo(-11, 0);
item.lineTo(0, -11);
item.endFill();

function resetItem() {
	item._x = 30 + Math.random() * (W - 60);
	item._y = -12;
	item.vy = 3 + Math.random() * 3.5;
}

resetItem();
updateHud();

this.onEnterFrame = function() {
	if (over) {
		return;
	}
	var mx = _root._xmouse;
	if (mx < 42) {
		mx = 42;
	}
	if (mx > W - 42) {
		mx = W - 42;
	}
	paddle._x = mx;

	item._y += item.vy;

	if (item._y > paddle._y - 16 && item._y < paddle._y + 10) {
		if (Math.abs(item._x - paddle._x) < 50) {
			score += 1;
			updateHud();
			resetItem();
		}
	}

	if (item._y > H + 14) {
		lives -= 1;
		updateHud();
		if (lives <= 0) {
			over = true;
			updateHud();
		} else {
			resetItem();
		}
	}
};

this.onMouseDown = function() {
	if (over) {
		score = 0;
		lives = 3;
		over = false;
		updateHud();
		resetItem();
	}
};
.end

.end
