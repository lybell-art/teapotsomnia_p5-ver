let myp5 = null;

function vmin(p)
{
  return Math.min(window.innerWidth,window.innerHeight) * p / 100;
}

let Showcase_Button=function(d)
{
	d.radius=0;
	d.buho=1;
	d.setup=function()
	{
		d.createCanvas(vmin(20), vmin(20));
		d.background(255);
	};
	d.draw=function()
	{
		d.ellipse(d.mouseX,d.mouseY,d.radius,d.radius);
		if(d.radius>60||d.radius<0) d.buho=-d.buho;
		d.radius+=d.buho;
	};
	d.windowResized=function()
	{
		console.log("why");
		d.resizeCanvas(vmin(20),vmin(20));
	}
};

$(document).ready(function () {
    myp5 = new p5(Showcase_Button, 'showcase_sketch');
    $(window).on('click resize', canvasResize);
});

var canvasResize = function() {
	if(myp5) {myp5.resizeCanvas(vmin(20),vmin(20));}
};
