//-engine--------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// main engine, https://www.santaclausnl.ga/projects/Pelican/Pelican.js
window.addEventListener("load", () => Pelican = new Pelican());
let mouse = {x: 0, y: 0}, mouseDown = false;

class Pelican{
	constructor() {
		this.version = "v2.4.35";
		this.c, this.ctx;
		this.width, this.height;

		this.setup();
	}

	resize(width_, height_) { width = c.width = width_, height = c.height = height_; }

	setup() {
		console.log(`Pelican ${this.version} by SantaClausNL. https://www.santaclausnl.ga/`);
		if(typeof setup === 'function') setup(); else console.warn("Pelican could not find setup function");
		if(typeof update === 'function' && noUpdate !== true) this.update(new Date().getTime());
	}

	update(prevTime_) {
		const time = new Date().getTime(), elapsed = (time-prevTime_)/1000;
		update(elapsed);
		requestAnimationFrame(() => this.update(time));
	}
}

function init(width_, height_, parentOrCanvasElement_) {
	if(parentOrCanvasElement_ !== undefined && parentOrCanvasElement_.tagName === "CANVAS") {
		Pelican.c = parentOrCanvasElement_, Pelican.ctx = c.getContext("2d");
	} else {
		c = document.createElement("CANVAS"), ctx = c.getContext("2d");
		c.parent = parentOrCanvasElement_ || document.documentElement;
		c.parent.appendChild(c);
	}
	width = c.width = width_, height = c.height = height_;
	c.id = "PelicanCanvas";
	
	if(typeof keyPressed === 'function') window.addEventListener('keydown', (e) => { keyPressed(e); });
	if(typeof keyReleased === 'function') window.addEventListener('keyup', (e) => { keyReleased(e); });
	window.addEventListener('mousemove', (e) => { mouse = getMousePos(e); if(typeof mouseMoved === 'function') mouseMoved(e); });
	window.addEventListener('mousedown', (e) => { mouseDown = true; if(typeof mousePressed === 'function') mousePressed(e); });
	window.addEventListener('mouseup', (e) => { mouseDown = false; if(typeof mouseReleased === 'function') mouseReleased(e); });
}

//-canvas--------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// function for clearing a canvas //'rgba(r, g, b, 0-1)' as argument for motion blur
function clear(color) {
	if(color !== undefined) {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, width, height);
	} else ctx.clearRect(0, 0, width, height);
}
// fuction for drawing a filled/stroked rectangle
function rect(x, y, w, h, color, strokeWidth) {
	if(strokeWidth === undefined) {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	} else {
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.strokeRect(x, y, w, h);
	}
}
// fuction for drawing a filled/stroked rectangle with curved corners
function roundedRect(x, y, w, h, r1, r2, r3, r4, color, strokeWidth) {
	ctx.beginPath();
	ctx.moveTo(x + r1, y);
	ctx.lineTo(x + w - r2, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r2);
	ctx.lineTo(x + w, y + h - r3);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r3, y + h);
	ctx.lineTo(x + r4, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r4);
	ctx.lineTo(x, y + r1);
	ctx.quadraticCurveTo(x, y, x + r1, y);
	ctx.closePath();
	if(strokeWidth === undefined) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.stroke();
	}
}
// function for drawing a line between two points
function line(x1, y1, x2, y2, width, color) {
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.stroke();
}
// function for drawing a circle
function circle(centerX, centerY, radius, color, strokeWidth) {
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, Math.PI*2, true);
	ctx.closePath();
	if(strokeWidth === undefined) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.stroke();
	}
}
// function for drawing text
// (optional) get a font name here: https://fonts.google.com/ and put it here: <link href="https://fonts.googleapis.com/css?family=<name(s) of font(s) seperated by |>" rel="stylesheet">
// (optional) or with css(style tag in html) and a local .ttf font file: 
// @font-face {
//   font-family: "<font name>";
//   src: url(assets/<font file>.ttf) format("truetype");
// }
function text(x, y, string, color, align, size, font) {
	ctx.fillStyle = color;
	if(align !== undefined) ctx.textAlign = align; // "start|left|end|right|center"
	if(font !== undefined) ctx.font = String(size) + "px " + font; else if(size !== undefined) ctx.font = String(size) + "px Sans-Serif";
	ctx.fillText(string, x, y);
	if(align !== undefined) ctx.textAlign = "start";
	if(size !== undefined) ctx.font = "10px Sans-Serif";
}
// function for drawing a centered image with rotation and ability to flip
function img(image, x, y, angle, flip) {
	ctx.save();
	ctx.translate(x, y);
	if(flip !== undefined) ctx.scale(-1, 1);
	ctx.rotate(angle);
	ctx.drawImage(image, -image.width/2, -image.height/2);
	ctx.restore();
}
// function for an animation from a sprite sheet
// <name of sprite> = Sprite({
// 	 spriteSheet: <sprite sheet>,
//   width: <width of sprite on sheet>, (optional)
//   height: <height of sprite on sheet>, (optional)
//   sheetStart: <where to start vertically>, (optional)
// 	 frames: <amount of frames>,
// 	 frameTime: <time between frames>
// });
// <name of sprite>.draw(x, y, flip(optional)); in loop
function Sprite(opt) {
	let sprite = {}, frame = 0, tick = 0;
	sprite.draw = function(x, y, flip, noTick) {
		let width = opt.width || opt.spriteSheet.width, height = opt.height || opt.spriteSheet.height, sheetStart = opt.sheetStart || 0;
		if((noTick ? tick : ++tick) > opt.frameTime) { tick = 0; if(frame < opt.frames - 1) frame += 1; else frame = 0; }
		ctx.save();
		if(!flip) ctx.translate(x+(width/opt.frames)/2, y); else { ctx.translate(x-(width/opt.frames)/2, y); ctx.scale(-1, 1); }
		ctx.drawImage(opt.spriteSheet, frame * width / opt.frames, sheetStart, width / opt.frames, height, -width/opt.frames, -height/2, width / opt.frames, height);
		ctx.restore();
	}
	return sprite;
}

//-image----------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// function for loading images
// use a counting function, e.g.: function count() { if(--toLoad <= 0) setup(); } as func_
// and a toLoad variable for the amount of images to be loaded
function loadImage(src_, func_) {
	let img = new Image();
	img.onload = () => func_;
	img.src = src_;
	return img;
}

//-utility-functions----------------------------------------------------------------------------------------------------------------------------------------------------------------//
// function for mapping a value
function map(value, valLow, valHigh, resLow, resHigh) { return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow); }
// replacement function for Math.random(), with only 1 argument it is random from 0 to argument
function random(low, high) { if(high !== undefined) return Math.random() * (high-low) + low; else return Math.random() * low; }
// replacement function for Math.random() rounded to integers
function randomInt(low, high) { return floor(random(low, high)); }
// replacement function for Math.round()
function round(value) { return Math.round(value); }
// replacement function for Math.floor()
function floor(value) { return Math.floor(value); }
// replacement function for Math.ceil()
function ceil(value) { return Math.ceil(value); }
// function for constraining a value
function constrain(val, minVal, maxVal) { if(val > maxVal) return maxVal; else if(val < minVal) return minVal; else return val; }
// function for calulating a point on the sigmoid curve
function sigmoid(val) { return 1/(1+Math.pow(Math.E, -val)); }
// function to calculate the distance between 2 x,y pairs or 1 vector and 1 x,y pair or 2 vectors
function dist(x1, y1, x2, y2) {
	if(y2 !== undefined) {
		return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	} else if(x2 !== undefined) {
		return Math.sqrt((x2.x-x1)*(x2.x-x1) + (x2.y-y1)*(x2.y-y1));
	} else {
		return Math.sqrt((y1.x-x1.x)*(y1.x-x1.x) + (y1.y-x1.y)*(y1.y-x1.y));
	}
}
// function for detecting collision between rectangles
function collision(vec1, w1, h1, vec2, w2, h2) { return (Math.abs((vec1.x+w1/2) - (vec2.x+w2/2)) * 2 < (w1 + w2)) && (Math.abs((vec1.y+h1/2) - (vec2.y+h2/2)) * 2 < (h1 + h2)); }
// function for collision between a dynamic and static rectangle
function collide(pos, vel, w, h, objPos, objW, objH) {
	const newPos = vec(pos.x + vel.x, pos.y + vel.y);
	if(collision(newPos, w, h, objPos, objW, objH)) {
		if(pos.y+h > objPos.y && pos.y < objPos.y+objH) {
			if(vel.x < 0) {
				vel.x = 0;
				pos.x -= pos.x-(objPos.x+objW);
				return 'left';
			} else if(vel.x > 0) {
				vel.x = 0;
				pos.x += objPos.x-(pos.x+w);
				return 'right';
			}
		} else if(pos.x+w > objPos.x && pos.x < objPos.x+objW) {
			if(vel.y < 0) {
				vel.y = 0;
				pos.y -= pos.y-(objPos.y+objH);
				return 'up';
			} else if(vel.y > 0) {
				vel.y = 0;
				pos.y += objPos.y-(pos.y+h);
				return 'down';
			}
		}
	}
}
// function to swap 2 elements of an array, call <array>.swap(i, j);
Array.prototype.swap = function(i, j) {
	const temp = this[i];
	this[i] = this[j];
	this[j] = temp;
}
// an array shuffle function, call <array>.shuffle();
Array.prototype.shuffle = function() {
	for(let i = this.length - 1; i >= 0; i--) {
		const j = randomInt(i+1);
		this.swap(i, j);
	}
}
// lerp function
function lerp(start, end, amt) { return start+amt*(end-start); }
//function that returns true for the intersection of a rectangle and circle
function rectCircleCollision(x, y, w, h, cx, cy, cr) {
	let dx = cx-Math.max(x, Math.min(cx, x+w)), dy = cy-Math.max(y, Math.min(cy, y+h));
	return (dx*dx + dy*dy) < cr*cr;
}
// get the mouse position in the form of a vector
function getMousePos(e) {
	const rect = c.getBoundingClientRect(), root = document.documentElement;
	return vec(e.clientX-rect.left-root.scrollLeft, e.clientY-rect.top-root.scrollTop);
}
// 2D vector class
class Vector{
	constructor(x, y) { this.x = x || 0, this.y = y || 0; }
	// x & y or other vector
	set(x, y) { if(x instanceof Vector) this.x = x.x, this.y = x.y; else this.x = x, this.y = y; }
	add(x, y) { if(x instanceof Vector) this.x += x.x, this.y += x.y; else this.x += x, this.y += y; }
	sub(x, y) { if(x instanceof Vector) this.x -= x.x, this.y -= x.y; else this.x -= x, this.y -= y; }
	mult(x, y) { if(y === undefined) if(x instanceof Vector) this.x *= x.x, this.y *= x.y; else this.x *= x, this.y *= x; else this.x *= x, this.y *= y; }
	div(x, y) { if(y === undefined) if(x instanceof Vector) this.x /= x.x, this.y /= x.y; else this.x /= x, this.y /= x; else this.x /= x, this.y /= y; }
	equals(vec) { return (this.x == vec.x && this.y == vec.y); }
	constrain(lowX, hiX, lowY, hiY) { this.x = constrain(this.x, lowX, hiX), this.y = constrain(this.y, lowY, hiY); }
	degreesTo(vec) { return degrees(Math.atan2(vec.y - this.y, vec.x - this.x)); }
	radiansTo(vec) { return Math.atan2(vec.y - this.y, vec.x - this.x); }
	fromAngle(angle, radius) { // gets a vector from an angle, or from the angle between vectors 'this' and 'angle' on the circumference of the circle with radius 'radius'
		if(angle instanceof Vector) angle = this.radiansTo(angle);
		return vec(Math.cos(angle) * (radius || 1) + this.x, Math.sin(angle) * (radius || 1) + this.y);
	}
	collides(x, y, w, h) { return (this.x < x+w && this.x > x && this.y < y+h && this.y > y); }
}
function vec(x, y) { return new Vector(x, y); }
// get vector from an angle
function fromAngle(angle, radius) { return vec(Math.cos(angle) * (radius || 1), Math.sin(angle) * (radius || 1)); }
// convert degree angle to radians
function radians(degrees) { return degrees*Math.PI/180; }
// convert radians angle to degrees
function degrees(radians) { return radians*180/Math.PI; }
// Perlin Noise class, create 1 instance and get values via noise.next(x); function
class Noise{
	constructor(amp_, scl_) {
    this.vertices = 256, this.amp = amp_ || 1, this.scl = scl_ || 0.05, this.r = [];
	  for(let i = 0; i < this.vertices; i++) this.r.push(Math.random());
	}

  next(x) {
    const sclX = x*this.scl, floorX = Math.floor(sclX), t = sclX-floorX;
    const xMin = floorX & this.vertices-1, xMax = (xMin + 1) & this.vertices-1;
    return lerp(this.r[xMin], this.r[xMax], t*t*(3-2*t)) * this.amp;
  }
}