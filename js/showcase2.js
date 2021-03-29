const bodyTag=document.getElementsByTagName("body")[0];
switch(timeDetect())
{
	case _NOON:bodyTag.classList.add('noon'); break;
	case _NIGHT:bodyTag.classList.add('midnight'); break;
}

var video = document.querySelector("#webcam");
 
if (navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia({ video: true })
	.then(function (stream) {
		video.srcObject = stream;
	})
	.catch(function (err0r) {
		console.log("Something went wrong!");
	});
}
