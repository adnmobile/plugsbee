'use strict';

Widget.Thumbnail = function() {
	this.elm = microjungle([
		['a', {class: 'thumbnail', draggable: 'true'},
			['figure',
        ['div', {class: 'miniature'},
					['img']
        ],
        ['figcaption', {'class': 'label'}]
			]
    ]
	]);
  this.form = microjungle([
    ['form',
      ['input', {type: 'text', autofocus: 'autofocus'}]
    ]
  ]);
};
//
//jid property
//
Widget.Thumbnail.prototype.__defineSetter__('jid', function(aId) {
	this._jid = aId;
	this.elm.setAttribute('data-jid', aId);
});
Widget.Thumbnail.prototype.__defineGetter__('jid', function() {
	return this._jid;
});
//
//miniature property
//
Widget.Thumbnail.prototype.__defineSetter__('miniature', function(aSrc) {
	this._miniature = aSrc;
	this.elm.querySelector('img').setAttribute('src', aSrc);
});
Widget.Thumbnail.prototype.__defineGetter__('miniature', function() {
	return this._miniature;
});
//
//href property
//
Widget.Thumbnail.prototype.__defineSetter__('href', function(aHref) {
	this._href = aHref;
  this.elm.setAttribute('href', aHref);
	 //~ gUserInterface.modifyAElement(this.elm.querySelector('a.link'));
});
Widget.Thumbnail.prototype.__defineGetter__('href', function() {
	return this._href;
});
//
//name property
//
Widget.Thumbnail.prototype.__defineSetter__('label', function(aLabel) {
	this._label = aLabel;
	this.elm.querySelector('.label').textContent = aLabel;
});
Widget.Thumbnail.prototype.__defineGetter__('label', function() {
	return this._label;
});
//
//edit property
//
Widget.Thumbnail.prototype.__defineSetter__('edit', function(aBool) {
	this._edit = aBool;
  var that = this;
  var figcaption = that.elm.querySelector("figcaption");
  if(aBool === true) {
    figcaption.textContent = '';
    figcaption.appendChild(that.form);
  }
  if(aBool === false) {
    figcaption.removeChild(figcaption.firstChild);
    figcaption.textContent = this.label;
  }
});
Widget.Thumbnail.prototype.__defineGetter__('edit', function() {
	return this._edit;
});

