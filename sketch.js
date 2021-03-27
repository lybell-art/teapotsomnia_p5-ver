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

function between(input, a, b)
{
	return a<=input && input<=b;
}

function setup() 
{ 
	createCanvas(windowWidth, windowHeight, WEBGL); 
	background(143,132,191);
	noStroke();
}
function draw() 
{
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
	lights();
	switch(scene_no){
		case 0:intro.display(); break; //title screen
		case 1:showcase.display(); break; //main screen
		default:background(143,132,191);
	}
	console.log(frameCount);
}



//intro scene
class Intro_Scene{
	
}
