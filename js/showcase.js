/*
let teapot, tree, terrain1, terrain2; //3D objects
let ico1, ico2 // 2D icons

function preload() {
	teapot = loadModel('assets/teapot.obj', true);
	tree = loadShape("assets/simpletree.obj", true);
	terrain1 = loadShape("assets/terrain.obj", true);
	terrain2 = loadShape("assets/terrain2.obj", true);
	ico1 = loadImage('assets/camera_ico.jpg');
	ico2 = loadImage("assets/camera_off_ico.png");
}
*/
function setup() 
{ 
	createCanvas(windowWidth, windowHeight); 
	noStroke();
}
function draw() 
{
	clear();
	if (mouseIsPressed) 
	{
//		var size = map(dist(mouseX,mouseY,pmouseX,pmouseY),0,400,5,80);
		var size=20;
		ellipse(mouseX, mouseY, size, size); 
	}
	if(keyIsPressed)
	{
		if(key==" ")
		{
			background("#ab1300");
		}
	}
}
