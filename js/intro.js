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
	d.teapot=null;
	d.rot=0.0;
	d.preload=function() {
		d.teapot = loadModel('assets/teapot.obj', true);
	}
	d.setup=function()
	{
		d.createCanvas(vmin(20), vmin(20), WEBGL);
		d.noStroke();
		d.rot=0.0;
	};
	d.draw=function()
	{
		let isMouseOn=this.mouseOn();
		d.clear();
		d.lights();
		d.fill(isMouseOn ? "#FF8C9A" : "#FFF4E7");
		d.rotateX(HALF_PI);
		d.rotateZ(d.rot);
		d.scale(6 * (isMouseOn?1.2:1));
		d.shape(d.teapot);
		d.rot+=0.2;
	};
	d.windowResized=function()
	{
		d.resizeCanvas(vmin(20),vmin(20), false);
	}
	
	d.isMouseOn=function()
	{
		return (between(mouseX,0,d.width) && between(mouseY,0,d.height));
	}
};
new p5(Showcase_Button, 'showcase_sketch');
