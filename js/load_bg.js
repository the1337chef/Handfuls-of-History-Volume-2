//Loads the background iamge first, before the
//gajillion thumbnails.
image = new Image();
prefix = '';
if (String(window.location).slice(-10) != 'index.html') {
	prefix = '../';
}
image.src = prefix + 'pictures/other-images/background.jpg';