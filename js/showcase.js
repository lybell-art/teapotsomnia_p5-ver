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
const button = document.querySelector('#cam_button');
let isCam=false;

function HSBtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
	h=h/360;
	s=s/100;
	v=v/100;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function char2col(a)
{
	let a_=a.charCodeAt(0);
	let res;
	if(between(a_,65,90)) res=HSBtoRGB(map(a_,65,91,0,360),45,80);
	else if(between(a_,97,122)) res=HSBtoRGB(map(a_,97,123,0,360),20,90);
	else if(between(a_,48,57)) res=HSBtoRGB(0,0,map(a_,48,58,60,90));
	else res=HSBtoRGB(340,5,96);
	return res;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgb2hex(r,g,b)
{
	if (arguments.length === 1) {
		g = r.g, b = r.b, r = r.r;
	}
	 return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function changeBGgrad(grad)
{
	let body=document.getElementsByTagName("body")[0];
	let str="linear-gradient(";
	for(var i=0; i<grad.length; i++)
	{
		str+=rgb2hex(grad[i]);
		if(i < grad.length-1) str+=",";
	}
	str+=")";
	let prefix=["-webkit-","-moz-","-o-","-ms-"];
	for(var p in prefix) {body.style.backgroundImage = p+str; console.log(p);};
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

button.addEventListener('click', event => {
	camOn=!camOn;
	if(isCam) button.classList.add('camOn');
	else button.classList.remove('camOn');
});
