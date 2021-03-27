function vmin(p)
{
  return Math.min(window.innerWidth,window.innerHeight) * p / 100;
}
function between(input, a, b)
{
  return a<=input && input<=b;
}

let Showcase_Button=function(d)
{
	let teapot=null;
	let rot=0.0;
	let _isMouseOn=function()
	{
		return (between(d.mouseX,0,d.width) && between(d.mouseY,0,d.height));
	}
	
	d.preload=function() {
		teapot = d.loadModel('assets/teapot.obj', true);
	}
	d.setup=function()
	{
		d.createCanvas(vmin(20), vmin(20), d.WEBGL);
		d.noStroke();
		d.rot=0.0;
	};
	d.draw=function()
	{
		let isMouseOn=_isMouseOn();
		d.clear();
		d.lights();
		d.fill(isMouseOn ? "#FF8C9A" : "#FFF4E7");
		d.rotateX(d.HALF_PI);
		d.rotateZ(rot);
		d.scale((isMouseOn?1.2:1));
		d.model(teapot);
		rot+=0.05;
	};
	d.windowResized=function()
	{
		d.resizeCanvas(vmin(20),vmin(20), false);
	}
};
new p5(Showcase_Button, 'showcase_sketch');
