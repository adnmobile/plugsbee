'use strict';
//~ 
//FIXME newfolder widget, where should it be?
//~ window.addEventListener('load', function() {
	//~ var elm = document.getElementById('newfolder');
	//~ var form = elm.querySelector('form');
//~ 
	//~ form.addEventListener('submit', 
		//~ function(event) {
			//~ var name = form.elements['title'].value;
			//~ var accessmodel = form.elements['public'].checked ? 'open' : 'whitelist';
//~ 
			//~ 
			//~ Plugsbee.createFolder(name, accessmodel, function(aFolder) {
				//~ form.reset();
				//~ elm.hidden = true;
				//~ aFolder.widget.open();
			//~ });
			//~ 
			//~ event.preventDefault();
		//~ }
	//~ );
	//~ form.addEventListener('cancel', 
		//~ function(event) {
			//~ //FIXME We MUST remove the listener
			//~ document.removeEventListener('click', test, true);
			//~ form.reset();
			//~ elm.hidden = true;
		//~ }
	//~ );
//~ }, false);


Widget.Panel = function() {
  this.elm = microjungle([
    ['div', {class: 'panel', hidden: 'hidden'},
      ['a', {class: 'thumbnail upload'},
        ['figure',
          ['div', {class: 'miniature'},
            ['div', {class: 'area'}, 
              ['div', {class: 'text'}, 'Drop files here to upload']
            ]
          ],
          ['figcaption', {'class': 'label'}, 'Upload files']
        ]
      ]
    ]
  ]);
  // No file upload on Safari mobile.
  if(navigator.userAgent.match('AppleWebKit') && navigator.userAgent.match('Mobile')) {
    this.elm.querySelector('.upload').hidden = true;
  }
  else {

  }
	return this;
};
Widget.Panel.prototype.__defineSetter__('jd', function(aId) {
	this._jid = aId;
	this.elm.setAttribute('data-jd', aId);
});
Widget.Panel.prototype.__defineGetter__('jid', function() {
	return this._jid;
});
Widget.Panel.prototype.__defineSetter__('hidden', function(aBool) {
	this._hidden = aBool;
  this.elm.hidden = aBool;
});
Widget.Panel.prototype.__defineGetter__('hidden', function() {
	return this._hidden;
});
