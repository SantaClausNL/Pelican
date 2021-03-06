//-engine--------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// main engine, https://projects.brandond.nl/Pelican/Pelican.js
const PelicanVersion = "v2.11.10";
window.addEventListener("load", PelicanSetup);
let c, ctx, width, height, mouse = undefined, mouseIsPressed = false;
let Pelican = { noUpdate: false, toLoad: 0, loadTimeout: 5000, imageSmoothing: false, frames: 0 };

function PelicanSetup() {
	console.log("Pelican "+PelicanVersion+" by SantaClausNL. https://www.brandond.nl/");

	mouse = vec();
	if(typeof preload === 'function') {
		preload();
		const loading = document.createTextNode("LOADING...");
		document.body.appendChild(loading);
		if(Pelican.toLoad <= 0) Continue(); else {
			let elapsedLoading = 0;
			const loadingLoop = setInterval(() => {
				if(Pelican.toLoad <= 0 || elapsedLoading >= Pelican.loadTimeout) {
					if(elapsedLoading >= Pelican.loadTimeout) console.warn("Failed to load assets.");
					clearInterval(loadingLoop);
					loading.remove();
					Continue();
				} else elapsedLoading += 25;
			}, 25);
		}
	} else Continue();

	function Continue() {
		if(typeof setup === 'function') setup();
		if(typeof update === 'function' && Pelican.noUpdate !== true) PelicanUpdate(window.performance.now());
	}
}

function init(width_ = 100, height_ = 100, options = {}) {
	if(options["imageSmoothing"] === true) Pelican.imageSmoothing = true;
	if(options["noUpdate"] === true) Pelican.noUpdate = true;
	if(options["canvas"] !== undefined) {
		c = options["canvas"], ctx = c.getContext('2d');
	} else {
		c = document.createElement("CANVAS"), ctx = c.getContext('2d');
		if(options["parent"] !== undefined) options["parent"].appendChild(c); else document.body.appendChild(c);
	}
	width = c.width = width_, height = c.height = height_;
	c.id = (options["id"] !== undefined) ? options["id"] : "PelicanCanvas";
	c.innerHTML += "Your browser does not support HTML5 Canvas.";

	if(typeof keyPressed === 'function') window.addEventListener('keydown', (e) => { keyPressed(e); });
	if(typeof keyReleased === 'function') window.addEventListener('keyup', (e) => { keyReleased(e); });
	window.addEventListener('mousemove', (e) => { mouse = getMousePos(e); if(typeof mouseMoved === 'function') mouseMoved(e); });
	window.addEventListener('mousedown', (e) => { mouseIsPressed = true; if(typeof mousePressed === 'function') mousePressed(e); });
	window.addEventListener('mouseup', (e) => { mouseIsPressed = false; if(typeof mouseReleased === 'function') mouseReleased(e); });
	if(typeof windowResized === 'function') window.addEventListener('resize', (e) => windowResized(e));
}

function resizeCanvas(width_, height_) { width = c.width = width_, height = c.height = height_; }

function PelicanUpdate(prevTime_) {
	const time = window.performance.now(), elapsed = (time-prevTime_)/1000;
	if(ctx !== undefined) ctx.imageSmoothingEnabled = Pelican.imageSmoothing;
	Pelican.frames++;
	update(elapsed);
	window.requestAnimationFrame(() => { PelicanUpdate(time); });
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
function line(points, width, color) {
	if(points.length <= 0) return;
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for(let i = 1, l = points.length; i < l; i++) ctx.lineTo(points[i].x, points[i].y);
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.stroke();
}
// function to draw a polygon with an arbitrary set of vectors
function polygon(points, color, strokeWidth) {
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for(let i = 1, l = points.length; i < l; i++) ctx.lineTo(points[i].x, points[i].y);
	ctx.closePath();
	if(strokeWidth !== undefined) {
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.stroke();
	} else {
		ctx.fillStyle = color;
		ctx.fill();
	}
}
// function for drawing an ellipse
function ellipse(centerX, centerY, width, height, color, strokeWidth) {
	ctx.beginPath();
	ctx.ellipse(centerX, centerY, width, height);
	if(strokeWidth === undefined) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color;
		ctx.lineWidth = strokeWidth;
		ctx.stroke();
	}
}
//function for drawing a circle
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
function text(x, y, string, color, align = 'start', size = 10, font = 'Sans Serif') {
	ctx.fillStyle = color;
	ctx.textAlign = align; // "start|left|end|right|center"
	ctx.font = String(size) + "px " + font;
	ctx.fillText(string, x, y);
}
// draw text with a line around it
function strokedText(x, y, string, color, strokeWidth, strokeColor, align = 'start', size = 10, font = 'Sans Serif') {
	ctx.fillStyle = color;
	ctx.strokeStyle = strokeColor;
	ctx.lineWidth = strokeWidth;
	ctx.lineJoin = 'round';
	ctx.textAlign = align; // "start|left|end|right|center"
	ctx.font = String(size) + "px " + font;
	ctx.strokeText(string, x, y);
	ctx.fillText(string, x, y);
	ctx.lineJoin = 'miter';
}
// function for measuring the width of a string drawn on canvas
function textWidth(string, size = 10, font = 'Sans Serif') {
	ctx.font = String(size) + "px " + font;
	return ctx.measureText(string).width;
}

//-assets---------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// function for drawing an image with rotation, flip and resize
function img(x, y, image, angle, flip, width_, height_) {
	let w, h;
	if(width_ !== undefined) w = width_, h = height_; else w = image.width || 20, h = image.height || 20;
	ctx.save();
		if(angle !== undefined) {
			ctx.translate(x+w/2, y+h/2);
			ctx.rotate(angle);
			if(flip == true) ctx.scale(-1, 1);
			ctx.translate(-w/2, -h/2);
		} else {
			if(flip == true) {
				ctx.scale(-1, 1);
				ctx.translate(x-w, y);
			} else ctx.translate(x, y);
		}
		try{ if(width_ !== undefined) ctx.drawImage(image, 0, 0, w, h); else ctx.drawImage(image, 0, 0);
			} catch(err) { line([{x: 0, y: 0}, {x: w, y: h}], 2, 'red'); line([{x: w, y: 0}, {x: 0, y: h}], 2, 'red'); }
	ctx.restore();
}
// function for an animation from a sprite sheet
class Sprite{
	constructor(width_, height_, spriteSheet_, frames_ = 0, frameTime_, sheetStart_ = 0) {
		if(width_ instanceof Image) {
			this.w = width_.width, this.h = width_.height;
			this.spriteSheet = width_, this.sheetStart = frames_;
			this.frames = height_, this.frameTime = spriteSheet_, this.frame = 0;
		} else {
			this.w = width_, this.h = height_;
			this.spriteSheet = spriteSheet_, this.sheetStart = sheetStart_;
			this.frames = frames_, this.frameTime = frameTime_, this.frame = 0;
		}
	}

	draw(x, y, flip) {
		ctx.save();
			if(flip !== true) ctx.translate(x+(this.w/this.frames)/2, y); else { ctx.translate(x-(this.w/this.frames)/2, y); ctx.scale(-1, 1); }
			ctx.drawImage(this.spriteSheet, (floor(++this.frame/this.frameTime)%this.frames)*this.w/this.frames, this.sheetStart, this.w/this.frames, this.h, -this.w/this.frames, -this.h/2, this.w/this.frames, this.h);
		ctx.restore();
	}
}
// function for loading images, call in preload or supply callback
function loadImage(src_, callback_) {
	const img = new Image();
	if(callback_ !== undefined) {
		img.onload = () => { callback_(img); }
	} else {
		img.onload = () => { Pelican.toLoad--; }
		Pelican.toLoad++;
	}
	img.src = src_;
	return img;
}
// function for getting a file, call in preload and in code use variable.data, or supply callback that takes 1 i.e. data argument loadFile('path_to.file', (data) => console.log(data));
// for JSON, loadFile('path_to.json', (data) => console.log(JSON.parse(data)))
function loadFile(path_, callback_) {
	let returnValue = {data: "", path: path_};
	const req = new XMLHttpRequest();
	req.open('GET', path_);
	if(typeof callback_ === "function") {
		req.onreadystatechange = () => { if(req.readyState === 4) if(req.status === 200 || req.status == 0) {
				returnValue.data = req.responseText;
				callback_(req.responseText);
			} else fileError(req.status);
		}
	} else {
		Pelican.toLoad++;
		req.onreadystatechange = () => { if(req.readyState === 4) if(req.status === 200 || req.status == 0) {
				returnValue.data = req.responseText;
				Pelican.toLoad--;
			} else fileError(req.status);
		}
	}
	req.send(null);

	return returnValue;

	function fileError(status_) { console.error("Error "+status_+" getting file."); }
}

//-math-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// function for mapping a value
function map(value, valLow, valHigh, resLow, resHigh) { return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow); }
// replacement function for Math.random(), with only 1 argument it is random from 0 to argument
function random(low, high) { if(high !== undefined) return Math.random() * (high-low) + low; else if(low !== undefined) return Math.random() * low; else return Math.random(); }
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
//function that returns true for the intersection of a rectangle and circle
function rectCircleCollision(x, y, w, h, cx, cy, cr) {
	let dx = cx-Math.max(x, Math.min(cx, x+w)), dy = cy-Math.max(y, Math.min(cy, y+h));
	return (dx*dx + dy*dy) < cr*cr;
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
// linear interpolation function
function lerp(start, end, amt) { return start+amt*(end-start); }
// 2D vector class
class Vector{
	// x & y or other vector
	constructor(x = 0, y = 0) { if(x instanceof Vector) this.x = x.x, this.y = x.y; else this.x = x, this.y = y; }
	set(x, y) { if(x instanceof Vector) this.x = x.x, this.y = x.y; else this.x = x, this.y = y; }
	add(x, y) { if(y === undefined) { return ((x instanceof Vector) ? vec(this.x + x.x, this.y + x.y) : vec(this.x + x, this.y + x)); } else { return vec(this.x + x, this.y + y); }}
	sub(x, y) { if(y === undefined) { return ((x instanceof Vector) ? vec(this.x - x.x, this.y - x.y) : vec(this.x - x, this.y - x)); } else { return vec(this.x - x, this.y - y); }}
	mult(x, y) { if(y === undefined) { return ((x instanceof Vector) ? vec(this.x * x.x, this.y * x.y) : vec(this.x * x, this.y * x)); } else { return vec(this.x * x, this.y * y); }}
	div(x, y) { if(y === undefined) { return ((x instanceof Vector) ? vec(this.x / x.x, this.y / x.y) : vec(this.x / x, this.y / x)); } else { return vec(this.x / x, this.y / y); }}
	mag() { return Math.sqrt(this.x*this.x + this.y*this.y); }
	norm() { const mag = this.mag(); return vec(this.x/mag, this.y/mag); }
	equals(vec) { return (this.x === vec.x && this.y === vec.y); }
	constrain(lowX, hiX, lowY, hiY) { return vec(constrain(this.x, lowX, hiX), constrain(this.y, lowY, hiY)); }
	angleTo(vec) { return Math.atan2(vec.y - this.y, vec.x - this.x); }
	fromAngle(angle, radius) { // gets a vector from an angle, or from the angle between vectors 'this' and 'angle' on the circumference of the circle with radius 'radius'
		if(radius === undefined) radius = 1;
		if(angle instanceof Vector) angle = this.angleTo(angle);
		return vec(Math.cos(angle) * radius + this.x, Math.sin(angle) * radius + this.y);
	}
	collides(x, y, w, h) { return (this.x < x+w && this.x > x && this.y < y+h && this.y > y); }
}
function vec(x, y) { return new Vector(x, y); }
// get vector from an angle
function fromAngle(angle, radius) {
	if(radius === undefined) radius = 1;
	return vec(Math.cos(angle) * radius, Math.sin(angle) * radius);
}
// convert degree angle to radians
function radians(degrees) { return degrees*Math.PI/180; }
// convert radians angle to degrees
function degrees(radians) { return radians*180/Math.PI; }
// Perlin Noise class, create 1 instance and get values via noise.value(x); function
class Noise{
	constructor(amp_ = 1, scl_ = 0.05) {
		this.vertices = 256, this.amp = amp_, this.scl = scl_, this.r = [];
		for(let i = 0; i < this.vertices; i++) this.r.push(Math.random());
	}

	value(x) {
		const sclX = x*this.scl, floorX = Math.floor(sclX), t = sclX-floorX;
		const xMin = floorX & this.vertices-1, xMax = (xMin + 1) & this.vertices-1;
		return lerp(this.r[xMin], this.r[xMax], t*t*(3-2*t)) * this.amp;
	}
}

//-utility--------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// returns true if passed variable is not undefined
function defined(variable) { return variable !== undefined; }
// gives the element matching the id
function $(id) { return document.getElementById(id); }
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
// get the mouse position in the form of a vector
function getMousePos(e) {
	const rect = c.getBoundingClientRect(), root = document.body;
	return vec(e.clientX-rect.left-root.scrollLeft, e.clientY-rect.top-root.scrollTop);
}