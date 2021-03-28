function vmin(p)
{
  return Math.min(window.innerWidth,window.innerHeight) * p / 100;
}
function between(input, a, b)
{
  return a<=input && input<=b;
}
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
