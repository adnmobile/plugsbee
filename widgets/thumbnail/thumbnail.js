'use strict';

Widget.Thumbnail = function() {
  var elm = document.createElement('div');
  elm.innerHTML = 
    "<li class='thumbnail'>"+
      "<a>"+
        "<figure>"+
          "<figcaption class='label'/>"+
        "</figure>"+
      "</a>"+
    "</li>";
  this.elm = elm.firstChild;
  
  elm = document.createElement('div');
  elm.innerHTML = 
    "<form>"+
      "<input type='text' name='name' autofocus='autofocus'/>"+
    "</form>";
  this.form = elm.firstChild;

  this.elm.addEventListener('click', function(e) {
    if(location.protocol === 'file:' || e.target.tagName === 'input')
      return;
    
    e.preventDefault();
    history.pushState(null, null, this.firstChild.href);
    var event = document.createEvent('Event');
    event.initEvent('popstate', true, true);
    window.dispatchEvent(event);
  }, true);
  
  this.dragStart = function(evt) {
    //Set the drag image
    var img = this;

    evt.dataTransfer.setDragImage(img, -10, -10);
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    //Show the dock
    document.getElementById('dock').hidden = false;
  };
  this.dragEnd = function(evt) {
    //Hide the dock
    document.getElementById('dock').hidden = true;
  };

  this.dragEnter = function(evt) {
    this.classList.add('dragenter');
  };
  this.dragOver = function(evt) {
    this.classList.add('dragenter');
    evt.preventDefault();
  };
  this.dragLeave = function(evt) {
    this.classList.remove('dragenter');
  };
  this.drop = function(evt) {
    this.classList.remove('dragenter');

    var fileId = evt.dataTransfer.getData('Text');
    var folderId = this.getAttribute('data-id');

    var folder = Plugsbee.folders[folderId];
    var file = Plugsbee.files[fileId];

    file.move(folder);

    //Hide the dock
    document.getElementById('dock').hidden = true;

    evt.preventDefault();
  };
};
//
//draggable property
//
Widget.Thumbnail.prototype.__defineSetter__('draggable', function(aBool) {
	this._draggable = aBool;
  if (aBool === false) {
    this.elm.removeAttribute('draggable');
    this.elm.removeEventListener('dragstart', this.dragStart);
    this.elm.removeEventListener('dragend', this.dragEnd);
  }
  else if (aBool === true) {
    this.elm.setAttribute('draggable', 'draggable');
    this.elm.addEventListener('dragstart', this.dragStart);
    this.elm.addEventListener('dragend', this.dragEnd);
  }
});
//
//dropbox property
//
Widget.Thumbnail.prototype.__defineSetter__('dropbox', function(aBool) {
	this._draggable = aBool;
  if (aBool === false) {
    this.elm.classList.remove('dragenter');
    this.elm.removeEventListener('dragenter', this.dragEnter);
    this.elm.removeEventListener('dragover', this.dragOver);
    this.elm.removeEventListener('dragleave', this.dragLeave);
    this.elm.removeEventListener('drop', this.drop);
  }
  else if (aBool === true) {
    this.elm.addEventListener('dragenter', this.dragEnter);
    this.elm.addEventListener('dragover', this.dragOver);
    this.elm.addEventListener('dragleave', this.dragLeave);
    this.elm.addEventListener('drop', this.drop);
  }
});
Widget.Thumbnail.prototype.__defineGetter__('dropbox', function() {
	return this._dropbox;
});
//
//miniature property
//
Widget.Thumbnail.prototype.__defineSetter__('miniature', function(aMiniature) {
  var figure = this.elm.querySelector('figure');
  if (typeof aMiniature == 'string') {
    var img = document.createElement('img');
    img.classList.add('miniature');
    img.src = aMiniature;
    aMiniature = img;
  }
  var miniature = figure.querySelector('.miniature');
  if(!miniature) {
    figure.insertBefore(aMiniature, figure.firstChild);
  }
  else {
    figure.replaceChild(aMiniature, miniature);
    //~ figure.replaceChild(miniature, aMiniature);
  }
});
Widget.Thumbnail.prototype.__defineGetter__('miniature', function() {
	return this.elm.getElementsByClassName('miniature')[0];
});
//
//href property
//
Widget.Thumbnail.prototype.__defineSetter__('href', function(aHref) {
	this._href = aHref;
  var href = aHref;
  if(location.protocol === 'file:')
    href = '#'+aHref

  this.elm.getElementsByTagName('a')[0].setAttribute('href', href);
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
  var figcaption = this.elm.getElementsByTagName('figcaption')[0];
  if(aBool === true) {
    figcaption.textContent = '';
    figcaption.appendChild(that.form);
  }
  if(aBool === false) {
    figcaption.textContent = this.label;
  }
});
Widget.Thumbnail.prototype.__defineGetter__('edit', function() {
	return this._edit;
});

