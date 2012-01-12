'use strict';

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

Widget.Folder = function() {
  this.tab = microjungle([
    ['a', {class: 'folder tab'},
      ['li', {class: 'folder tab'},
        ['img', {src: 'themes/default/toto.png'}],
        ['span', {class: 'label'}]
      ],
      ['div', {class: 'arrow'}]
    ]
  ]);
  this.panel = microjungle([
    ['div', {class: 'panel', hidden: 'hidden'},
      ['figure', {class: 'file upload'},
        ['div', {class: 'thumbnail'}, 
          ['div', {class: 'area'}, 
            ['div', {class: 'text'}, 'Drop files here to upload']
          ]
        ],
        ['figcaption', {class: 'name'}, 'Upload files']
			]
    ]
  ]);
  // BUG 1 "no file upload on Safari"
  if(navigator.userAgent.match('AppleWebKit') && navigator.userAgent.match('Mobile'))
    this.panel.firstChild.style.display = 'none';
	//~ this._counter = 0;
	//~ this.elm = microjungle([
		//~ ['article', {draggable: 'true', class: 'folder', hidden: 'hidden'},
			//~ ['header',
				//~ ['span', {class: 'title'}],
				//~ ['span', {class: 'size'}, ' (0) '],
				//~ ['span', {class: 'public'}, 'public '],
				//~ ['input', {type: 'file', style: 'visibility: hidden;', onchange: 'gUserInterface.upload(event);'}],
				//~ ['button', {class: 'upload', onclick: 'this.previousSibling.click()'}, 'Upload'],
				//~ ['span', {class: 'creator'}],
			//~ ],
			//~ ['div', {class: 'files', hidden: 'hidden'}],
			//~ ['ul', {class: 'admin', hidden: 'hidden'},
				//~ ['li',
					//~ ['button', {class: 'share'}, 'Share']
				//~ ],
				//~ ['li',
					//~ ['button', {class: 'delete'}, 'Delete folder']
				//~ ]
			//~ ]
		//~ ]
	//~ ]);
	//~ var that = this;
	//~ this.elm.firstChild.addEventListener('click', function(e) {
		//~ that.elm.dispatchEvent(eventExpand);
	//~ });
	//~ this.elm.querySelector('.share').addEventListener('click', function() {
		//~ that.elm.dispatchEvent(shareEvent);
	//~ });
	//~ this.elm.querySelector('.delete').addEventListener('click', function() {
		//~ that.elm.dispatchEvent(eventDelete);
	//~ });
	//~ this.open = function() {
		//~ this.elm.dispatchEvent(eventOpen);
	//~ };
	//
	//Drag And Drop
	//		this.elm.querySelector('ul.admin').hidden = true;
	
	//Drop box
	//~ this.elm.addEventListener('drop', function(e) {
		//~ var dt = e.dataTransfer;
		//~ if(dt.getData('type') !== 'contact')
			//~ return false;
		//~ share(elm.id, dt.getData('jid'));
		//~ e.preventDefault();
	//~ });
	
	//Drag element
	//~ this.elm.addEventListener('dragstart', function (e) {
		//~ e.dataTransfer.setData('jid', this.id);
		//~ e.dataTransfer.setData('type', 'folder');
		//~ e.dataTransfer.setDragImage(this.elm.querySelector('span.title'), 0, 0);
	//~ });
	//~ this.elm.addEventListener('dragover', function(e) {
		//~ if (e.preventDefault) e.preventDefault(); // allows us to drop
		//~ e.dataTransfer.dropEffect = 'copy';
	//~ });
	//~ elm.addEventListener('dragenter', function(e) {
		//~ var dt = e.dataTransfer;
	//~ });
	//~ elm.addEventListener('dragleave', function(e) {
		//~ console.log('dragleave');
	//~ });
	//~ elm.addEventListener('dragend', function (e) {
	//~ });
	return this;
};
Widget.Folder.prototype.__defineSetter__('id', function(aId) {
	this._id = aId;
	this.tab.setAttribute('jid', aId);
	this.panel.setAttribute('jid', aId);
	this.panel.setAttribute('id', aId);
});
Widget.Folder.prototype.__defineGetter__('id', function() {
	return this._id;
});
Widget.Folder.prototype.__defineSetter__('hidden', function(aBool) {
	this._aHidden = aBool;
  this.tab.hidden = aBool;
  this.panel.hidden = aBool;
});
Widget.Folder.prototype.__defineGetter__('id', function() {
	return this._aHidden;
});
Widget.Folder.prototype.__defineSetter__('label', function(aLabel) {
	this._label = aLabel;
	this.tab.querySelector('.label').textContent = aLabel;
	this.tab.href = aLabel;
});
Widget.Folder.prototype.__defineGetter__('label', function() {
	return this._label;
});
