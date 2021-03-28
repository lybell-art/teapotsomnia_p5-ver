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
			console.log(this.length-i);
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


let lb=new LinearBlurSystem(5);

let rotX, rotY, transX, transY, scaleFactor, time;
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
	camera(0,-400, (height/2.0) / tan(PI*30.0 / 180.0),0,-200,0,0,1,0);
	lights();
	ambientLight(34,5,15);
	directionalLight(135,135,135, -1, 1, -1);
	//setting position
	translate(transX,transY,0);
	rotateX(rotX);
	rotateY(-rotY);
	scale(1+scaleFactor);
	
	//drawing terrain
	push();
	rotateX(PI);
	scale(1);
	fill(117,203,255);
	model(terrain1);
	translate(0,3,0);
	fill(255,229,245);
	model(terrain2);
	pop();
	
	//drawing trees
	push();
	scale(1.7);
	rotateX(PI);
	translate(10,2,-42);
	fill(65, 166, 159);
	for(var i=0; i<13; i++)
	{
		model(tree);
		translate(0,0,7);
	}
	pop();
	
	//drawing teapot
	push();
	rotateX(HALF_PI);
	rotateZ(-HALF_PI);
	translate(0,-9,3);
	fill(teapotColor);
	model(teapot);
	pop();
}


window.addEventListener("keydown", e => {
	const buffer = document.getElementById("type_buffer");
	if (buffer)
	{
		if(e.keyCode == 13) //enter
		{
			bufferStr="";
			lb.blur();
			console.log(lb.grad(3));
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
	if(isCam) e.classList.add('camOn');
	else e.classList.remove('camOn');
}
