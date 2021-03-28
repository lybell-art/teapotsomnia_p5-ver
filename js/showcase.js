let teapot, tree, terrain1, terrain2; //3D objects

function preload() {
	teapot = loadModel('assets/teapot.obj', true);
	tree = loadModel("assets/simpletree.obj", true);
	terrain1 = loadModel("assets/terrain.obj", true);
	terrain2 = loadModel("assets/terrain2.obj", true);
}

let bufferStr="";
let isCam=false;

function changeBGgrad(grad)
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
	static add(a,b)
	{
		return {r: a.r+b.r , g:a.g+b.g, b:a.b+b.b};
	}
	static sub(a,b)
	{
		return {r: a.r-b.r , g:a.g-b.g, b:a.b-b.b};
	}
	static div(a,scalar)
	{
		return {r: Math.round(a.r/scalar) , g:Math.round(a.g/scalar), b:Math.round(a.b/scalar)};
	}
	push(c)
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

	blur()
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
	grad(l)
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
	pop()
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
	
	clear()
	{
		this.colBuffer=[];
		this.colSum=[];
		this.length=0;
		this.isEnded=false;
	}
}

class mind_ball{
	constructor(c)
	{
		this.x=8; this.y=-7; this.z=70; this.size=1;
		this.phase=1;
		this.alpha=256;
		this.wait_time=-1;
		this.ms=0;
		this.col="#ffffff";
		if(!c) rgb2hex(random(192,256),random(192,256),random(192,256));
		else this.col=rgb2hex(c);
	}
	movement()
	{
		let absorbed=false;
		let amplify=60.0/frameRate();
		this.ms+=0.04*amplify;
		switch(this.phase)
		{
			case 1:
				this.size=1; this.z-=0.1*amplify;
				if(this.z <= 0)
				{
				  this.z=0; this.phase = 2;
				}
				break;
			case 2:
				this.size=1; this.x-=0.1*amplify;
				if(x <= -2)
				{
				  this.wait_time=0; absorbed=true; this.phase = 3;
				}
				break;
			case 3:
				this.size=0; this.wait_time+=amplify;
				if(this.wait_time >= 25)
				{
				  this.x=-9.1; this.y=-17; this.z=-16; this.size=0.3; this.phase = 4;
				}
				break;
			case 4:
				this.size+=0.01*amplify; this.y-=0.1*amplify;
				if(this.size >= 3.72) this.alpha -= 2;
				if(this.size >= 5) this.phase = 5;
				break;
		}
		if(absorbed) return this.col;
		else return 0;
	}
	finished()
	{
		return this.phase == 5;
	}
	display()
	{
		push();
		fill(this.col, this.alpha);
		translate(this.x,this.y+(this.phase<3?Math.sin(this.ms):0),this.z);
		sphere(this.size);
		pop();
	}
}


let lb=new LinearBlurSystem(5);

let rotX=-0.45, rotY=0.58, transX=0, transY=0, scaleFactor=0, time=0;
let teapotColor=rgb2hex(255,244,231);

function setup() 
{ 
	createCanvas(windowWidth, windowHeight, WEBGL);
	noStroke();
}
function draw() 
{
	clear();
	//setting camera and light
	camera(0,0, (height/2.0) / tan(PI*30.0 / 180.0),0,-100,0,0,1,0);
	lights();
	ambientLight(34,5,15);
	directionalLight(135,135,135, -1, 1, -1);
	//setting position
	
	cameraMove();
	translate(transX,transY,0);
	rotateX(rotX);
	rotateY(-rotY);
	scale(1+0.1*scaleFactor);
	
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
	translate(300,150,-6*230);
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
}

function windowResized()
{
	resizeCanvas(windowWidth, windowHeight, false);
}

function mouseDragged(){
	rotY -= (mouseX - pmouseX) * 0.004;
	rotX -= (mouseY - pmouseY) * 0.004;
}

function mouseWheel(event) {
	let e = event.delta;
	scaleFactor -= e * 0.01;
}

function cameraMove()
{
	if (keyIsDown(LEFT_ARROW)) transX += 10;
	if (keyIsDown(RIGHT_ARROW)) transX -= 10;
	if (keyIsDown(UP_ARROW)) transY += 10;
	if (keyIsDown(DOWN_ARROW)) transY -= 10;
}

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
		else if(e.key.length==1)
		{
			bufferStr+=e.key;
			let currentCol=char2col(e.key);
			lb.push(currentCol);
		}
		buffer.textContent=bufferStr+"_";
	}
});

function toggleClick(e)
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
