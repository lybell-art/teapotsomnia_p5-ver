function setup() 
{ 
	createCanvas(windowWidth, windowHeight); 
	background("#ab1300");
	noStroke();
}
function draw() 
{
	if (mouseIsPressed) 
	{
		var size = map(dist(mouseX,mouseY,pmouseX,pmouseY),0,400,5,80);
		ellipse(mouseX, mouseY, size, size); 
	}
	if(keyIsPressed)
	{
		if(key==" ")
		{
			background("#ab1300");
		}
	}
	console.log(frameCount);
}
