function pathways() {
	handle_current_pathway();
	//Alter links in text section. (For now, the rest
	//are just generated in the source. Ugly, but quick
	//and effective.)
	
	// Adding some JQuery, since IE 8 apparently
	// hates the old version. This is nicer anyway.
	var text = $('.text')[0];
	if (text) {
		process_text(text);
	}
}

function handle_current_pathway() {
	var slug = document.getElementsByTagName('h1')[0].id;
	if (slug) {
		parameters = '';
		var values = readCookie(slug);
		if (values) {
			values = values.split(':');
			pathway_slug = values[0];
			pathway_title = values[1];
			grouping_slug = values[2]
			grouping_title = values[3];

			if (pathway_slug) {
				//If there's a cookie for this page.
				var pathways = get_pathways();
				if (contains(pathways, pathway_slug)) {
					//Pathway is valid. Process.
					parameters = ", '" + values.join("', '") + "'";
					swap_navigation(pathway_slug);
				}
				else {
					if (grouping_title == 'Chronological Order') {
						//It's chronological, so we just need to correct the range.
						var h5s = document.getElementsByTagName('h5');
						var h5 = h5s[h5s.length -1];
						pathway_slug = h5.parentNode.id;
						pathway_title = h5.childNodes[0].innerHTML;
						var results = new Array(pathway_slug, pathway_title, grouping_slug, grouping_title);
						createCookie(slug, results.join(':'));
						handle_current_pathway();
					}
					else {
						//Invalid path from a followed link.
						eraseCookie(slug);
					}
				}
			}
		}
	}
}

function get_pathways() {
	var pathways_list = document.getElementById('pathways_list');
	var results = new Array();
	var lis = getChildrenByTagName(pathways_list, 'LI');
	for (var i in lis) {
		results.push(lis[i].id);
	}
	return results;
}

function set_two_pathways(link, pathway_slug, pathway_title, grouping_slug, grouping_title) {
	//Alters the pathway setting both for the link we're
	//following and for the current page.
	slug = document.getElementsByTagName('h1')[0].id
	var results = new Array(pathway_slug, pathway_title, grouping_slug, grouping_title);
	createCookie(slug, results.join(':'));
	set_pathway(link, pathway_slug, pathway_title, grouping_slug, grouping_title);
}

function set_pathway(link, pathway_slug, pathway_title, grouping_slug, grouping_title) {
	//Alters the pathway setting of the link we're following.
	slug = link.href.split('/').slice(-1)[0].slice(0,-5);
	if (pathway_slug) {
		var results = new Array(pathway_slug, pathway_title, grouping_slug, grouping_title);
		createCookie(slug, results.join(':'));
	}
	else {
		eraseCookie(slug);
	}
}

function process_text(text) {
	var paragraphs = getChildrenByTagName(text, 'P');
	var links = new Array();
	for (var i in paragraphs) {
		var p_links = getChildrenByTagName(paragraphs[i], 'A')
		for (var j in p_links) {
			links.push(p_links[j])
		}
	}
	for (var i in links) {
		var target = links[i].href.split('/').slice(-2)
		//If it's a link to an element page:
		if (target[0].slice(0, 7) == 'chapter' && target[1] != 'index.html') {
			var pathway;
			if (window.pathway) {
				pathway = ", '" + window.pathway + "'";
			}
			else {
				pathway = '';
			}
			links[i].onclick = new Function("set_pathway(this" + parameters + ")");
		}
	}
}

function swap_navigation(pathway) {
	var navigations = $('.navigation');
	var originals = $('.prev_next');
	var original_copy = originals[0].cloneNode(true);
	
	var pathway = document.getElementById(pathway_slug);
	var replace = getChildrenByTagName(pathway, 'DIV')[0];
	var replace_copy = replace.cloneNode(true);
	
	var pathways_list = document.getElementById('pathways_list');
	
	//Change the two main ones to the new pathway.
	navigations[0].removeChild(originals[0]);
	navigations[0].appendChild(replace);
	navigations[1].removeChild(originals[1]);
	navigations[1].appendChild(replace_copy);
	
	//Delete the pathway's old listing.
	pathways_list.removeChild(pathway);
	
	//Insert chapter order into pathways list.
	var chapter_number = window.location.href.split('/').slice(-2)[0].slice(-2);
	var li = document.createElement('li');
	li.id = 'chapter-' + chapter_number;
	var h5 = document.createElement('h5');
	h5.appendChild(document.getElementById('chapter_link').cloneNode(true));
	li.appendChild(h5);
	li.appendChild(original_copy);
	pathways_list.insertBefore(li, pathways_list.firstChild);
	
	//Insert pathway notice paragraph.
	p = document.createElement('p');
	p.id = 'to_pathway'
	inner = '<a href="../alternate-storylines/index.html">Alternate Pathways</a> »\r\n'
	inner += '<a href="../alternate-storylines/' + grouping_slug + '.html">' + grouping_title + "</a> »\r\n"
	inner += '<a href="../alternate-storylines/' + grouping_slug + '.html#' + pathway_slug + '">' + pathway_title + "</a>"
	p.innerHTML = inner
	replace = $('.prev_next')[0];
	navigations[0].insertBefore(p, replace)
}