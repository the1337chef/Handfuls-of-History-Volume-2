function start() {
	//set_GetElements();
	redefine_cookies();
	pathways();
	set_special_links();
}

//Scripts by Scott Andrew, edited by Peter-Paul Koch of Quirksmode.
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function redefine_cookies() {
	//By me. If cookies don't work (i.e. in Safari from a local file),
	//use Sessvars instead.
	createCookie('test','test');
	var test = readCookie('test');
	eraseCookie('test');
	if (!test) {
		createCookie = new Function('name','value','days', 'sessvars[name] = value;');
		readCookie = new Function('name', 'return sessvars[name];');
		eraseCookie = new Function('name', 'sessvars[name] = undefined;')
	}
}

function set_special_links() {
	// Sets links to images, documents, and external sites to open in a new window or tab.
	$(".text a[href $='.pdf'], .text a[href $='.jpg'], .text a[href ^='http']").attr('target', '_blank');
	// Sets image links to display thumbnails on hover.
	$(".text a[href $='.jpg']").imgPreview({
		imgCSS: { width: 300 }
	});
}


function getChildrenByTagName(parent, tag) {
	results = new Array();
	children = parent.childNodes;
	for (i in children) {
		if (children[i].tagName == tag) {
			results.push(children[i]);
		}
	}
	return results;
}

function contains(haystack, needle) {
	for (var i in haystack) {
		if (haystack[i] === needle) {
			return true;
		}
	}
	return false;
}