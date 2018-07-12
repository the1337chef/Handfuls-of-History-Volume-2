// Identify this as a page with images.
// Set it as early as possible.
has_images = true
child = false

$(document).ready(function() {
	// Decide if we're a parent or child window.
	child = false
	cookie_prefix = ''
	
	if (window.opener) {
		// Hide everything except browsing and
		// remove external window link.
		child = true
		cookie_prefix = 'external_'
		$("body > *").hide()
		$('#image_browsing').appendTo('body')
		$('.external').hide()
		$('body').attr('class', 'external')
		
		// Store window parameters on close.
		$(window).unload(function(){
			save_external_parameters()
		})
	} else {
		// This is the main window.
		
		// Show the browsing if the child window is closed
		interval = setInterval('check_child()', 400)
		
		// Close child window if this window is closed.
		$(window).unload(function(){
			if (window.external_window != undefined) {
				external_window.save_external_parameters()
				external_window.close()
			}
		})
		
	}
	
	// Assign click handlers to thumbnails.
	$("ul#thumbnails a.thumbnail").click(function(event){
		// "This" must be wrapped in "$()" in order
		// to make it a JQuery object.
		switch_image($(this))
		event.preventDefault()
	})
	
	// Get references to the main image and other info.
	img = $("img#image")
	current = img.attr("src").slice(-6,-4)
	num_images = $("ul#thumbnails a.thumbnail").size()
	
	// Place caption, if needed.
	link = $('a#image' + Number(current))
	place_caption(link)
	
	// Add controls.
	inner = '<ul><li id="external"><a href="" onClick="open_external_window(); return false;" id="external">Open in Separate Window</a></li>'
	inner += '<li><a id="fixed" onClick="set_image_mode(\'fixed\'); return false;" href="">Fixed Height</a> '
	inner += '<span id="plus_minus"><a id="minus" onClick="return false;" href="">-</a> '
	inner += '<a id="plus" onClick="return false;" href="">+</a></span></li>'
	inner += '<li><a id="full" onClick="set_image_mode(\'full\'); return false;" href="">Full Image Size</a></li>'
	inner += '<li><a id="fit" onClick="set_image_mode(\'fit\'); return false;" href="">Fit to Window</a></li>'
	$("div#controls").attr("innerHTML", inner)
	
	// Quick fix... Preferences were being tried before this function was called.
	// This means it's called twice, but it's still pretty fast.
	redefine_cookies()
	
	// Preferences
	height = Number(readCookie(cookie_prefix + 'height'))
	if (!height) {
		height = 400
	}
	
	image_mode = readCookie(cookie_prefix + 'image_mode')
	if (!image_mode) {
		if (child) {
			image_mode = 'fit'
		} else {
			image_mode = 'fixed'
		}
	}
	set_image_mode(image_mode)
	
	if (child) {
		// Switch image to match
		// the one currently selected in the parent.
		link = $('a#image' + Number(window.opener.current))
		switch_image_in_one_window(link)
	}
	
	// Keyboard navigation
	$(document).bind('keydown', 'Right', function() {
		increment_image(1);
	})
	
	$(document).bind('keydown', 'Left', function() {
		increment_image(-1);
	})
	
	// Sets textual links to images in this gallery to switch active image when clicked.
	if (!child) {
		var imgfolder = img.attr('src').slice(0,-6)
		$(".text a[href ^='"+imgfolder+"']").click(function(event){
			// "This" must be wrapped in "$()" in order
			// to make it a JQuery object.
			handle_text_link($(this))
			event.preventDefault()
		})
	}
	
	// Unfortunately, same-host browser security policies
	// treat each local file like a separate page, so
	// automatic pop-ups are just about impossible.
	
	//if (readCookie('external') && !window.opener) {
	//	open_external_window()
	//}
})

$(window).load(function() {
	// resize() does not work correctly in ready(),
	// since the image is not fully loaded. We still
	// want preferences loaded as soon as possible;
	// this comes along and resizes the image after
	// a moment.
	if (image_mode == 'fit') {
		resize()
	}
})

function check_child() {
	// If the child has been closed, re-show browsing.
	if (window.external_window == undefined || external_window.closed) {
		show_browsing()
	}
}

function save_external_parameters() {
	win_left = window.screenX || window.screenLeft
	win_top = window.screenY || window.screenTop
	win_width = $(window).width()
	win_height = $(window).height()
	external_parameters = ',left=' + win_left + ',top=' + win_top + ',width=' + win_width + ',height=' + win_height
	window.opener.createCookie('external_parameters', external_parameters)
	return external_parameters
}

function handle_text_link(text_link) {
	link = $('a#image'+parseInt(text_link.attr("href").slice(-6,-4)))
	switch_image(link)
}

function switch_image(link) {
	// Changes the image; also changes image in
	// opener or child, if present.
	switch_image_in_one_window(link)
	if (child) {
		link = window.opener.$('a#' + link.attr('id'))
		window.opener.switch_image_in_one_window(link)
	}
	if (window.external_window != undefined && !external_window.closed) {
		link = external_window.$('a#' + link.attr('id'))
		external_window.switch_image_in_one_window(link)
	}
}

function switch_image_in_one_window(link) {
	// Change the URL of the main image.
	current = link.attr("id").slice(5)
	url = link.attr("href")
	img.attr("src", url)
	
	//  Remove "selected" class, then add it to current thumbnail.
	$("#thumbnails li.selected").attr("class", "")
	$(link).parent().attr("class", "selected")
	
	if (image_mode == 'fit') {
		resize()
	}
	
	// Removes current caption, if one is present, and
	// adds one if it's needed.
	place_caption(link)
}

function increment_image(number) {
	// Change the image by the given amount, wrapping at the ends.
	new_number = Number(current) + Number(number)
	if (new_number > num_images) {
		new_number = 1
	}
	else if (new_number < 1) {
		new_number = num_images
	}
	link = $("a#image" + new_number)
	switch_image(link)
}

function open_external_window() {
	parameters = 'menubar=0,statusbar=0,location=0,resizable=1,scrollbars=1'
	external_parameters = readCookie('external_parameters')
	external_window = window.open(location.href, 'external', parameters + external_parameters);
	hide_browsing()
}

function hide_browsing() {
	$('#image_browsing').hide()
	createCookie('external', 'True', 7)
}

function show_browsing() {
	$('#image_browsing').show()
	eraseCookie('external')
}

function set_image_mode(mode) {
	// Sets the image mode to either fixed, full, or fit, and remembers
	// it via cookie.
	switch (mode) {
		case "fixed":
			$(window).unbind('resize')
			set_image_size(height)
			enable_plus_minus()
			break
		case "full":
			img.removeAttr('height')
			$(window).unbind('resize')
			disable_plus_minus()
			break
		case "fit":
			$(window).resize(resize)
			resize()
			disable_plus_minus()
			break
		default: return false
	}
	
	// Set active button.
	$('#controls a').removeAttr('class')
	$('#controls a#' + mode).attr('class', 'selected')
	
	// Set variable and cookie.
	
	image_mode = mode
	createCookie(cookie_prefix + 'image_mode', mode, 7)
}

function disable_plus_minus() {
	// Removes the functionality of the plus and minus buttons.
	$('#plus_minus').attr('class', 'disabled')
	$('#plus_minus a').unbind('click')
}

function enable_plus_minus() {
	// Adds the functionality of the plus and minus buttons.
	$('#plus_minus').removeAttr('class')
	$('#plus').click(function() { increment_image_size(50) })
	$('#minus').click(function() { increment_image_size(-50) })
}

function resize() {
	// Resizes the image to keep the div in the screen.
	// The code used to fit the entire div to the window:
	// div_height = $('#image_browsing').height()
	window_height = $(window).height()
	window_width = $(window).width()
	image_height = img.height()
	image_width = img.width()
	
	// Make image small enough for div to fit on screen height.
	// new_height = window_height - (div_height - image_height) - 10
	new_height = window_height - 110

	// Figure out the maximum height that will make the width fit
	// in the window.
	if (child) {
		margin_allowance = 40
	} else {
		margin_allowance = 110
	}
	max_height_for_width = image_height * (window_width - margin_allowance) / image_width
	
	// If the image would be too wide, make it smaller.
	if (new_height > max_height_for_width) {
		new_height = max_height_for_width
	}
	
	// Keep it from getting too small.
	if (new_height < 100) {
		new_height = 100
	}
	
	img.attr('height', new_height)
}

function increment_image_size(amount) {
	set_image_size(height + amount)
}

function set_image_size(new_fixed_height) {
	// Change the size of the image to the given amount.
	height = new_fixed_height
	
	// Keep it from getting too small.
	if (height < 100) {
		height = 100
	}
	
	// Keep it from getting too large
	// (Limiting it to the full image
	// height is unpredictable.)
	if (height > 1000) {
		height = 1000
	}
	
	img.attr("height", height)
	
	// Set cookie.
	createCookie(cookie_prefix + 'height', height, 7)
}

function place_caption(link) {
	$('#main_caption').remove()
	// If there is a caption to place...
	if (link.next().html()) {
		main_caption = link.next().clone()
		main_caption.attr("id", "main_caption")
		main_caption.insertAfter(img)
		$('<p id="main_caption">'+main_caption.html()+'</p>').insertAfter(img)
	}
}