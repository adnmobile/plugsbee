'use strict';

Widget.File = function() {
	//~ this.elm = microjungle([
		//~ ['div', {class: 'file'},
			//~ ['figure',
				//~ ['a', {class: 'link'},
					//~ ['img', {'src': '/widgets/file/file.svg', class: 'thumbnail'}],
					//~ ['figcaption', {'class': 'name'}]
				//~ ]
			//~ ],
			//~ 
		//~ ]
	//~ ]);
	this.elm = microjungle([
		['a', {class: 'file', draggable: 'true'},
			['figure',
        ['div', {class: 'thumbnail'},
					['img', {src: 'widgets/file/file.svg', class: 'img'}]
        ],
        ['figcaption', {'class': 'name'}]
			],
      ['img', {src: 'widgets/file/delete.svg', class: 'delete'}]
    ]
	]);
  this.preview = microjungle([
    ['img']
  ]);
	var that = this;
	this.elm.addEventListener("click", function(evt) {
    if(evt.target.className === 'delete') {
      var eventDelete = document.createEvent("CustomEvent");
      eventDelete.initCustomEvent('delete', false, false, '');
      that.elm.dispatchEvent(eventDelete);
      evt.preventDefault();
      return;
    }
    
		if(evt.metaKey) {
			//~ //FIXME this would be better (close the socket on Gecko :-/ )
			//~ window.location.assign(that._src);
			window.open(that.src);
		}
		evt.preventDefault();
	});
	return this;
};
//
//deletable property
//
Widget.File.prototype.__defineSetter__('deletable', function(aDeletable) {
	var that = this;
	this._deletable = aDeletable;
	if(aDeletable)
		this.elm.setAttribute('deletable', 'true');
	else
		this.elm.removeAttribute('deletable');
});
Widget.File.prototype.__defineGetter__('deletable', function() {
	return this._deletable;
});
//
//id property
//
Widget.File.prototype.__defineSetter__('id', function(aId) {
	this._id = aId;
	this.elm.setAttribute('id', aId);
});
Widget.File.prototype.__defineGetter__('id', function() {
	return this._id;
});
//
//thumbnail property
//
Widget.File.prototype.__defineSetter__('thumbnail', function(aSrc) {
	this._thumbnail = aSrc;
	this.elm.querySelector('.img').setAttribute('src', aSrc);
});
Widget.File.prototype.__defineGetter__('thumbnail', function() {
	return this._thumbnail;
});
//
//href property
//
Widget.File.prototype.__defineSetter__('href', function(aHref) {
	this._href = aHref;
  this.elm.setAttribute('href', aHref);
	 //~ gUserInterface.modifyAElement(this.elm.querySelector('a.link'));
});
Widget.File.prototype.__defineGetter__('href', function() {
	return this._href;
});
//
//name property
//
Widget.File.prototype.__defineSetter__('label', function(aName) {
	this._name = aName;
	this.elm.querySelector('*.name').textContent = aName;
});
Widget.File.prototype.__defineGetter__('label', function() {
	return this._aName;
});
//
//type property
//
Widget.File.prototype.__defineSetter__('type', function(aType) {
	switch (aType) {
		case 'image/png':
		case 'image/jpeg':
		case 'image/gif':
		case 'image/svg+xml':
			var previewElm = microjungle([
				['img', {src: this.src, id: 'preview'}]
			]);
			break;
		case 'video/webm':
		case 'video/ogg':
		case 'video/mp4':
			var previewElm = microjungle([
				['video', {src: this.src, id: 'preview', controls: 'controls'}]
			]);
			break;
		case 'audio/webm':
		case 'audio/ogg':
		case 'audio/wave':
			var previewElm = microjungle([
				['audio', {src: this.src, id: 'preview', controls: 'controls'}]
			]);
			break;
		//FIXME preview for text use XHR?
		case 'text/plain':
		case 'text/xml':
		case 'application/xml':
			var previewElm = microjungle([
				['iframe', {src: this.src, id: 'preview'}]
			]);
			break;
		default:
			var previewElm = microjungle([
				['img', {src: 'widgets/file/file.svg', id: 'preview'}]
			]);
	}
	this.preview = previewElm;
});
