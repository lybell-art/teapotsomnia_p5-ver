let teapot, tree, terrain1, terrain2; //3D objects
const audio = new Audio("assets/The Tides Dream Escape.mp3"); //background music
let isSilent=true;

function preload() { //loading 3D objects
	teapot = loadModel('assets/teapot.obj', true);
	tree = loadModel("assets/simpletree.obj", true);
	terrain1 = loadModel("assets/terrain.obj", true);
	terrain2 = loadModel("assets/terrain2.obj", true);
}

let bufferStr=window.innerWidth;
let isCam=false, isMute=false;

function changeBGgrad(grad) //background gradient change
{
	if(!grad) return;
	let body=document.getElementsByTagName("body")[0];
	let str="linear-gradient(";
	for(var i=0; i<grad.length; i++)
	{
		str+=rgb2hex(grad[i]);
		if(i < grad.length-1) str+=",";
	}
	str+=")";
	["-webkit-","-moz-","-o-","-ms-"].forEach(prefix => body.style.backgroundImage = prefix+str);
}

class LinearBlurSystem{
	constructor(radius)
	{
		this.blurRadius=radius;
		this.colBuffer=[];
		this.colSum=[];
		this.length=0;
		this.isEnded=false;
	}
	static add(a,b) //add color vector
	{
		return {r: a.r+b.r , g:a.g+b.g, b:a.b+b.b};
	}
	static sub(a,b) //subtract color vector
	{
		return {r: a.r-b.r , g:a.g-b.g, b:a.b-b.b};
	}
	static div(a,scalar) //divide color vector with scalar
	{
		return {r: Math.round(a.r/scalar) , g:Math.round(a.g/scalar), b:Math.round(a.b/scalar)};
	}
	push(c) //pushing color in buffer
	{
		if(this.isEnded)
		{
			console.log("No more colors can be added.");
			return;
		}
		this.colBuffer.push(c);
		if(this.length == 0) this.colSum.push(c);
		else
		{
			let prevCol=this.colSum[this.length-1];
			let resultCol=LinearBlurSystem.add(prevCol,c);
			if(this.length >= this.blurRadius)
			{
				let prevCol2=this.colBuffer[this.length-this.blurRadius];
				resultCol=LinearBlurSystem.sub(resultCol,prevCol2);
			}
			this.colSum.push(resultCol);
		}
		this.length++;
	}

	blur() //calculate blurring color
	{
		if(this.isEnded)
		{
			console.log("The blurring calculation is over.");
			return;
		}
		let blurRadius2=Math.min(this.blurRadius,this.length);
		for(var i=blurRadius2; i>1; i--)
		{
			let prevCol3=this.colBuffer[this.length-i];
			this.colSum.push(LinearBlurSystem.sub(this.colSum[this.colSum.length-1],prevCol3));
		}
		
		let sumLen=this.colSum.length;
		for(var i=0; i <sumLen; i++)
		{
			let division=0;
			if(i >= blurRadius2-1 && i < this.length) division=blurRadius2;
			else if(i <blurRadius2-1) division=i+1;
			else division=sumLen-i;
			this.colSum[i]=LinearBlurSystem.div(this.colSum[i],division);
		}
//		for(var i=0;i<this.colSum.length;i++) console.log(this.colSum[i]);
		this.isEnded=true;
		return this.colSum;
	}
	grad(l) //return gradient
	{
		if(!this.isEnded)
		{
			console.log("Blurring Calculation is not yet over!");
			return;
		}
		let blurLen=this.colSum.length -1;
		if(blurLen < 0)
		{
			console.log("Can't return blur gradient!");
			return;
		}
		let res=[this.colSum[0]]
		let level=Math.min(blurLen,l);
		for(var i=1; i<level;i++)
		{
			res.push(this.colSum[i*Math.round(blurLen/level)]);
		}
		res.push(this.colSum[blurLen]);
		return res;
	}
	pop() //ejecting color in buffer
	{
		if(this.isEnded)
		{
			console.log("No more colors can be popped.");
			return;
		}
		this.colBuffer.pop();
		this.colSum.pop();
		if(this.length>0) this.length--;
	}
	
	clear() //clear buffer
	{
		this.colBuffer=[];
		this.colSum=[];
		this.length=0;
		this.isEnded=false;
	}
}

//dream-blobs object
class mind_ball{
	constructor(c)
	{
		this.x=8; this.y=-50; this.z=600; this.size=10;
		this.phase=1;
		this.alpha=256;
		this.wait_time=-1;
		this.ms=0;
		this.col="#ffffff";
		if(!c) this.col={r:random(192,256),g:random(192,256),b:random(192,256)};
		else this.col=c;
	}
	movement()
	{
		let absorbed=false;
		let amplify=60.0/frameRate();
		this.ms+=0.04*amplify;
		switch(this.phase)
		{
			case 1:
				this.size=10; this.z-=amplify;
				if(this.z <= 0)
				{
				  this.z=0; this.phase = 2;
				}
				break;
			case 2:
				this.size=10; this.x-=amplify;
				if(this.x <= -80)
				{
				  this.wait_time=0; absorbed=true; this.phase = 3;
				}
				break;
			case 3:
				this.size=0; this.wait_time+=amplify;
				if(this.wait_time >= 25)
				{
				  this.x=-119; this.y=-100; this.z=-87; this.size=3; this.phase = 4;
				}
				break;
			case 4:
				this.size+=0.1*amplify; this.y-=1*amplify;
				if(this.size >= 37.2) this.alpha -= 2;
				if(this.size >= 50) this.phase = 5;
				break;
		}
		if(absorbed) return rgb2hex(this.col);
		else return "";
	}
	finished()
	{
		return this.phase == 5;
	}
	display()
	{
		push();
		fill(this.col.r, this.col.g, this.col.b, this.alpha);
		translate(this.x,this.y+(this.phase<3?Math.sin(this.ms)*5:0),this.z);
		sphere(this.size);
		pop();
	}
}

function extractCameraPos(cam) //for screen size consistency
{
	if(cam)
	{
		return {eyeX:cam.eyeX, eyeY:cam.eyeY, eyeZ:cam.eyeZ, centerX:cam.centerX, centerY:cam.centerY, centerZ:cam.centerZ};
	}
	else return {eyeX:0, eyeY:0, eyeZ:(height/2.0) / tan(PI*30.0 / 180.0), centerX:0, centerY:0, centerZ:0};
}


let lb=new LinearBlurSystem(5); //linear blur system. for changing background gradation

let masterCanvas;
let t=0, cameraPos;
let teapotColor=rgb2hex(255,244,231); //initial color
let dream_blobs=[]; //dream-blobs
let mainCamera; //camera object
let pTouchScale=1;

function setup() 
{ 
	masterCanvas = createCanvas(windowWidth, windowHeight, WEBGL);
	noStroke();
	//set initial camera position
	mainCamera = createCamera();
	setCamera(mainCamera);
	mainCamera.setPosition(330,-480,580);
	mainCamera.lookAt(0,-50,0);
	cameraPos={eyeX:330, eyeY:-480, eyeZ:550, centerX:0, centerY:-50, centerZ:0};
	
	//enable touch move
	masterCanvas.touchMoved(touch_rotate_cam);
	let hammer = new Hammer(document.body, {preventDefault: true});
	hammer.get('pinch').set({ enable: true });
	hammer.on("pinch pinchend pinchcancil", touch_zoom);
	
}
function draw() 
{
	//operate dream-bobs
	let dream_color="";
	let temp_color;
	if(t >= 300)
	{
		dream_blobs.push(new mind_ball());
		t -= 360;
	}
	dream_blobs.forEach(blob => {
		temp_color=blob.movement();
		if(temp_color !== "") dream_color=temp_color;
	});
	if(dream_color !== "") teapotColor=dream_color;
	for (var i = dream_blobs.length -1; i >=0; i--) {
		var blob = dream_blobs[i];
		if(blob.finished()) dream_blobs.splice(i,1);
	}
	
	clear();
	//setting light
	lights();
	ambientLight(34,5,15);
	directionalLight(135,135,135, -1, 1, -1);
	
	//setting position
	cameraMove();
	if(pTouchScale === 1) orbitControl(2,2,0); //camera moving with mouse
	
	//drawing terrain
	push();
	rotateX(PI);
	scale(7);
	fill(117,203,255);
	model(terrain1);
	translate(0,2,0);
	fill(255,229,245);
	model(terrain2);
	pop();
	
	//drawing trees
	push();
	scale(0.4);
	rotateX(PI);
	translate(300,120,-6*230);
	fill(65, 166, 159);
	for(var i=0; i<13; i++)
	{
		model(tree);
		translate(0,0,230);
	}
	pop();
	
	//drawing teapot
	push();
	rotateX(HALF_PI);
	rotateZ(-HALF_PI);
	translate(0,-120,60);
	fill(teapotColor);
	model(teapot);
	pop();
	
	dream_blobs.forEach(blob => blob.display());
	
	if(frameRate() > 1) t += 60.0/frameRate();
}

function windowResized()
{
	resizeCanvas(windowWidth, windowHeight, false);
	mainCamera.setPosition(cameraPos.eyeX,cameraPos.eyeY,cameraPos.eyeZ);
	mainCamera.lookAt(cameraPos.centerX,cameraPos.centerY,cameraPos.centerZ);
}

function mouseWheel(event) { //zoom
	let e = event.delta;
	mainCamera.move(0,0, e * 0.1);
	cameraPos=extractCameraPos(mainCamera); //for screen size consistency
}

function mouseDragged()
{
	cameraPos=extractCameraPos(mainCamera); //for screen size consistency
}

function cameraMove() //camera moving with arrow keys
{
	var isChanged=false;
	if (keyIsDown(LEFT_ARROW)) {mainCamera.move(-10, 0, 0); isChanged=true;}
	if (keyIsDown(RIGHT_ARROW)) {mainCamera.move(10, 0, 0); isChanged=true;}
	if (keyIsDown(UP_ARROW)) {mainCamera.move(0, -10, 0); isChanged=true;}
	if (keyIsDown(DOWN_ARROW)) {mainCamera.move(0, 10, 0); isChanged=true;}
	if(isChanged) cameraPos=extractCameraPos(mainCamera);
}

function touch_rotate_cam() //camera rotate on touch device
{
	const scaleFactor = height < width ? height : width;
//	const buffer = document.getElementById("type_buffer");
//	buffer.textContent=pTouchScale;
	let rotX, rotY;
	if(touches.length === 1)
	{
		rotX = -2 * (mouseX - pmouseX) / scaleFactor;
		rotY =  2 * (mouseY - pmouseY) / scaleFactor;
		mainCamera._orbit(rotX, rotY, 0);
	}
}

function touch_zoom(event) //camera zoom on touch device
{
	if(event.type == "pinchend" || event.type == "pinchcancil")
	{
		pTouchScale=1;
		return;
	}
	const scaleFactor = height < width ? height : width;
	let delta=event.scale - pTouchScale;
	mainCamera.move(0,0, -scaleFactor * delta);
	cameraPos=extractCameraPos(mainCamera);
	pTouchScale = event.scale;
	
}

//start bgm
function startAudio(e)
{
	if(isSilent)
	{
		audio.loop=true;
		audio.play();
		isSilent=false;
	}
}

//input keys
window.addEventListener("keydown", e => {
	const buffer = document.getElementById("type_buffer");
	if (buffer)
	{
		if(e.keyCode == 13) //enter
		{
			bufferStr="";
			lb.blur();
			changeBGgrad(lb.grad(3));
			lb.clear();
		}
		else if(e.keyCode == 8) //backspace
		{
			bufferStr=bufferStr.slice(0,-1);
			lb.pop();
		}
		else if(e.key.length==1) //any keys
		{
			bufferStr+=e.key;
			let currentCol=char2col(e.key);
			lb.push(currentCol);
			dream_blobs.push(new mind_ball(currentCol));
			t=0;
		}
		buffer.textContent=bufferStr+"_";
	}
	startAudio(e); //when player type any keys, bgm is started.
});

window.addEventListener("click", startAudio); //when player click the screen, bgm is started.

//cam button click function
function toggleCam(e)
{
	isCam=!isCam;
	const camLayer=document.getElementById("cam_overlay");
	if(isCam)
	{
		e.classList.add('camOn');
		camLayer.style.visibility="visible";
	}
	else
	{
		e.classList.remove('camOn');
		camLayer.style.visibility="hidden";
	}
}

//mute button click function
function toggleMute(e)
{
	isMute=!isMute;
	const camLayer=document.getElementById("cam_overlay");
	if(isMute)
	{
		e.classList.add('muteOn');
		audio.pause();
	}
	else
	{
		e.classList.remove('muteOn');
		audio.play();
	}
}
