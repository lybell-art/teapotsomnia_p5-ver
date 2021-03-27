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
	let isMouseOn=function()
	{
		return (between(mouseX,0,d.width) && between(mouseY,0,d.height));
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
		let isMouseOn=isMouseOn();
		d.clear();
		d.lights();
		d.fill(isMouseOn ? "#FF8C9A" : "#FFF4E7");
		d.rotateX(HALF_PI);
		d.rotateZ(rot);
		d.scale(6 * (isMouseOn?1.2:1));
		d.shape(teapot);
		rot+=0.2;
	};
	d.windowResized=function()
	{
		d.resizeCanvas(vmin(20),vmin(20), false);
	}
};
new p5(Showcase_Button, 'showcase_sketch');
