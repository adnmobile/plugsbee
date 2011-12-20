'use strict';

Widget.Group = function(aGroup) {
	this.elm = microjungle([
		['li', {'class': 'group', 'id': aGroup}, 
			['span', aGroup],
			['ul', {'hidden': 'hidden'}]
		]
	]);
	var elm = this.elm;
	elm.querySelector('span').addEventListener('click',
		function(evt) {
			elm.dispatchEvent(eventExpand);
		}
	);
	//~ elm.addEventListener('dragenter', function(e) {
		//~ this.dispatchEvent(eventOpen);
		//~ return false;
	//~ });
	//~ elm.addEventListener('dragleave', function(e) {
		//~ this.dispatchEvent(eventClose);
		//~ return false;
	//~ });
	elm.addEventListener('expand',
		function(evt) {
			var state = elm.getAttribute('data-open');
			if(state) {
				elm.dispatchEvent(eventClose);
			}
			else {
				elm.dispatchEvent(eventOpen);
			}
		}
	);
	elm.addEventListener('open',
		function(evt) {
			elm.querySelector('ul').hidden = false;
			elm.setAttribute('data-open', 'true');
		}
	);
	elm.addEventListener('close',
		function(evt) {
			elm.querySelector('ul').hidden = true;
			elm.removeAttribute('data-open');		
		}
	);
	
	//~ this.groupsFieldset.appendChild(microjungle([['input', {'type': 'checkbox', 'name': group, 'value': group}]]));
	//~ this.groupsFieldset.appendChild(microjungle([['label', {'for': group}, group]]));
	//~ this.groupsFieldset.appendChild(microjungle([['br']]));
	//~ return this;
};
Widget.Contact = function() {
	this.elm = microjungle([
		['li', {'class': 'contact', 'draggable': 'true'},
			['input', {'type': 'checkbox', 'hidden': 'hidden'}],
			['img', {class: 'image'}],
			['span']
		]
	]);
	
	//~ tabContact.addEventListener('dragstart', function (e) {
		//~ e.dataTransfer.setData('jid', this.getAttribute('jid'));
		//~ e.dataTransfer.setData('type', 'contact');
		//~ e.dataTransfer.setDragImage(tabContact.querySelector('span'), 0, 0);
	//~ });
	
	
	//~ tabContact.querySelector('input').onchange = function(event) {
		//~ var folderjid = document.querySelector('li.folder[data-sharing]').getAttribute('id');
		//~ var folder = account.folders[folderjid];
		//~ var checked = event.target.checked;
		//~ if(checked)
			//~ folder.share(contact);
		//~ else
			//~ folder.unShare(contact);
	//~ };
	this.elm.addEventListener('checkable',
		function(evt) {
			this.firstChild.hidden = false;
		}
	);
	this.elm.addEventListener('notcheckable',
		function(evt) {
			this.firstChild.hidden = true;
		}
	);
	this.elm.querySelector('input').addEventListener('change', function(evt) {
		if(this.checked === true) {
			this.parentNode.dispatchEvent(eventCheck);
		}
		else {
			this.parentNode.dispatchEvent(eventUncheck);
		}
	});
	//~ tabContact.addEventListener('drop', function(e) {
		//~ if(e.dataTransfer.getData('type') !== 'folder')
			//~ return false;
		//~ account.folders[e.dataTransfer.getData('jid')].sendLink(contact);
		//~ e.preventDefault();
	//~ });
	//~ elm.addEventListener('dragenter', function(e) {
		//~ var dt = e.dataTransfer;
	//~ });
	//~ elm.addEventListener('dragleave', function(e) {
		//~ console.log('dragleave');
	//~ });
	//~ tabContact.addEventListener('dragover', function(e) {
		//~ if (e.preventDefault) e.preventDefault(); // allows us to drop
	//~ });
	//~ return this;
};
Widget.Contact.prototype.__defineSetter__('label', function(aLabel) {
	this.elm.querySelector('span').textContent = aLabel;
});
Widget.Contact.prototype.__defineSetter__('id', function(aId) {
	this.elm.id = aId;
});
Widget.Contact.prototype.__defineSetter__('image', function(src) {
	this.elm.querySelector('.image').src = src;
	this.elm.querySelector('.image').style.visibility = 'visible';
});
