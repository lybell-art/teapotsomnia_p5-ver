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

function addCol(a,b)
{
	return {r: a.r+b.r , g:a.g+b.g, b:a.b+b.b};
}
function subCol(a,b)
{
	return {r: a.r-b.r , g:a.g-b.g, b:a.b-b.b};
}

let bufferStr="";
let colBuffer=[], colSum=[];
let blurRadius=5;

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
			let colLen=colBuffer.length;
			let lastCol=colSum[colLen-1];
			for(var i=blurRadius; i>1; i--)
			{
				let prevCol3=colBuffer[colLen-i];
				colSum.push(subCol(lastCol,prevCol3));
			}
			console.log(colSum);
			colBuffer=[];
			colSum=[];
		}
		else if(e.keyCode == 8) //backspace
		{
			bufferStr=bufferStr.slice(0,-1);
			colBuffer.pop();
			colSum.pop();
		}
		else if(e.key.length==1)
		{
			bufferStr+=e.key;
			let currentCol=char2col(e.key);
			colBuffer.push(currentCol);
			if(colSum.length == 0) colSum.push(currentCol);
			else
			{
				let prevCol=colSum[bufferStr.length-2];
				let resultCol=addCol(prevCol,currentCol);
				if(colSum.length >= blurRadius)
				{
					let prevCol2=colSum[bufferStr.length-blurRadius-1];
					resultCol=subCol(currentCol,prevCol2);
				}
				colSum.push(resultCol);
			}
		}
		buffer.textContent=bufferStr+"_";
	}
});
