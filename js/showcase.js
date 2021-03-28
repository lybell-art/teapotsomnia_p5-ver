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
	console.log(isCam);
}
