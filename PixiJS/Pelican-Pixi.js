//-engine--------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// an add-on for Pelican that adds Pixi.JS support for an easy and fast WebGL API, https://www.santaclausnl.ga/projects/Pelican/PixiJS/Pelican-Pixi.js
const PixiJS = document.createElement("SCRIPT");
PixiJS.src = "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.1/pixi.min.js";
PixiJS.onload = () => continuePelicanSetup();
document.head.appendChild(PixiJS);

function initPixiJS(width_, height_, parentElement_) {
	Pelican = new PIXI.Application({ 
		width: width_,
		height: height_
	});
	width = Pelican.width = Pelican.renderer.view.width;
	height = Pelican.height = Pelican.renderer.view.height;
	Pelican.view.id = "PelicanCanvas";
	Pelican.parent = parentElement_ || document.documentElement;
	Pelican.parent.appendChild(Pelican.view);
	c = Pelican.renderer.view;
	setupPelicanEvents();
}

//-PixiJS--------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// returns a pixi rectangle object
function Rectangle(x_, y_, w_, h_, c_) {
	const rectangle = new PIXI.Graphics();
	rectangle.beginFill(c_);
	rectangle.drawRect(0, 0, w_, h_);
	rectangle.endFill();
	rectangle.position.set(x_, y_);
	return Pelican.stage.addChild(rectangle);
}
// returns a pixi ellipse object
function Ellipse(x_, y_, w_, h_, c_) {
	const ellipse = new PIXI.Graphics();
	ellipse.beginFill(c_);
	ellipse.drawEllipse(0, 0, w_/2, h_/2);
	ellipse.endFill();
	ellipse.position.set(x_, y_);
	return Pelican.stage.addChild(ellipse);
}
// returns a pixi circle object
function Circle(x_, y_, r_, c_) {
	const circle = new PIXI.Graphics();
	circle.beginFill(c_);
	circle.drawCircle(0, 0, r_);
	circle.endFill();
	circle.position.set(x_, y_);
	return Pelican.stage.addChild(circle);
}
// returns a pixi polygon object
function Polygon(points_, c_) {
	const polygon = new PIXI.Graphics();
	polygon.beginFill(c_);
	polygon.drawPolygon(points_);
	polygon.endFill();
	return Pelican.stage.addChild(polygon);
}
// returns a pixi polygon object
function Line(x1, y1, x2, y2, width, color, alpha) {
	const line = new PIXI.Graphics();
	line.lineStyle(width, color, alpha, 0.5, true);
	line.moveTo(x1, y1);
	line.lineTo(x2, y2);
	return Pelican.stage.addChild(line);
}
