.flash filename="pong.swf" version=8 fps=30 bbox=480x360 background=#101820

.frame 1
.action:
Stage.scaleMode = "noScale";
Stage.align = "TL";

var W = 480;
var H = 360;

var fmt = new TextFormat();
fmt.font = "_sans";
fmt.size = 26;
fmt.bold = true;
fmt.color = 0xFFFFFF;
fmt.align = "center";

this.createTextField("hud", 100, 0, 6, W, 32);
hud.selectable = false;

var hintFmt = new TextFormat();
hintFmt.font = "_sans";
hintFmt.size = 12;
hintFmt.color = 0x9fb3c8;
hintFmt.align = "center";

this.createTextField("hint", 101, 0, H - 22, W, 18);
hint.selectable = false;
hint.text = "Move your mouse to control the left paddle";
hint.setTextFormat(hintFmt);

var pScore = 0;
var aScore = 0;

function drawPaddle(mc, col) {
	mc.beginFill(col, 100);
	mc.moveTo(-7, -34);
	mc.lineTo(7, -34);
	mc.lineTo(7, 34);
	mc.lineTo(-7, 34);
	mc.lineTo(-7, -34);
	mc.endFill();
}

this.createEmptyMovieClip("pl", 10);
drawPaddle(pl, 0x8AE234);
pl._x = 24;
pl._y = H / 2;

this.createEmptyMovieClip("ai", 11);
drawPaddle(ai, 0xEF5350);
ai._x = W - 24;
ai._y = H / 2;

this.createEmptyMovieClip("ball", 12);
ball.beginFill(0xFFD24A, 100);
ball.moveTo(-8, -8);
ball.lineTo(8, -8);
ball.lineTo(8, 8);
ball.lineTo(-8, 8);
ball.lineTo(-8, -8);
ball.endFill();

function serve(dir) {
	ball._x = W / 2;
	ball._y = H / 2;
	ball.vx = dir * (4 + Math.random() * 1.5);
	ball.vy = (Math.random() * 5) - 2.5;
}

function updateHud() {
	hud.text = pScore + "     :     " + aScore;
	hud.setTextFormat(fmt);
}

serve(1);
updateHud();

this.onEnterFrame = function() {
	var my = _root._ymouse;
	if (my < 40) {
		my = 40;
	}
	if (my > H - 40) {
		my = H - 40;
	}
	pl._y = my;

	var target = ball._y;
	if (ai._y < target - 4) {
		ai._y += 4.2;
	} else if (ai._y > target + 4) {
		ai._y -= 4.2;
	}
	if (ai._y < 40) {
		ai._y = 40;
	}
	if (ai._y > H - 40) {
		ai._y = H - 40;
	}

	ball._x += ball.vx;
	ball._y += ball.vy;

	if (ball._y < 8) {
		ball._y = 8;
		ball.vy = -ball.vy;
	}
	if (ball._y > H - 8) {
		ball._y = H - 8;
		ball.vy = -ball.vy;
	}

	if (ball._x < pl._x + 15 && ball._x > pl._x && Math.abs(ball._y - pl._y) < 42) {
		ball.vx = Math.abs(ball.vx) + 0.4;
		ball.vy += (ball._y - pl._y) * 0.12;
	}

	if (ball._x > ai._x - 15 && ball._x < ai._x && Math.abs(ball._y - ai._y) < 42) {
		ball.vx = -(Math.abs(ball.vx) + 0.4);
		ball.vy += (ball._y - ai._y) * 0.12;
	}

	if (ball._x < -12) {
		aScore += 1;
		updateHud();
		serve(1);
	}
	if (ball._x > W + 12) {
		pScore += 1;
		updateHud();
		serve(-1);
	}
};
.end

.end
