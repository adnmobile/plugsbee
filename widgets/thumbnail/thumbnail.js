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
      "<menu>"+
        "<ul>"+
          "<li><span hidden='hidden' class='edit'>X</span>"+
            "<ul id='voletMenu' hidden='hidden'>"+
              "<li>Rename</li>"+
              "<li>Delete</li>"+
            "</ul>"+
          "</li>"+
        "</ul>"+
      "</menu>"+
    "</li>";

  this.elm = elm.firstChild;
  var elm = document.createElement('div');
  elm.innerHTML = 
    "<form>"+
      "<input type='text' name='name' autofocus='autofocus'/>"+
    "</form>";
  this.form = elm.firstChild;
  var that = this;
  //~ this.elm.addEventListener('focusin', function() {
    //~ if (this.getAttribute('data-menu') !== 'true')
      //~ this.querySelector('img').src = this.miniatureActive;
  //~ }, true);
  //~ this.elm.addEventListener('focusout', function() {
    //~ if (this.getAttribute('data-menu') !== 'true')
      //~ this.querySelector('img').src = this.miniature;
  //~ }, true);
  //~ this.elm.addEventListener('mouseover', function() {
    //~ console.log(this.miniatureActive);
    //~ if (this.getAttribute('data-menu') !== 'true')
      //~ this.querySelector('img').src = this.miniatureActive;
  //~ }, true);
  //~ this.elm.addEventListener('mouseout', function() {
    //~ if (this.getAttribute('data-menu') !== 'true')
      //~ this.querySelector('img').src = this.miniature;
  //~ }, true);


  this.dragStart = function(evt) {
    //Set the drag image
    var img = this;

    evt.dataTransfer.setDragImage(img, -10, -10);
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
  };
  this.dragEnd = function(evt) {
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

    var pbFolderId = this.getAttribute('data-id');
    var pbFolder = Plugsbee.folders[pbFolderId];
    if (evt.dataTransfer.files) {
      Plugsbee.layout.upload(evt.dataTransfer.files, pbFolder);
    }
    else {
      var pbFileId = evt.dataTransfer.getData('Text');
      var pbFile = Plugsbee.files[pbFileId];
      pbFile.move(pbFolder);
    }
    evt.preventDefault();
  };
  // Menu events
  this.mouseEnterThumbnail = function(evt) {
    this.querySelector('span.edit').hidden = false;
  };
  this.mouseClickMenu = function(evt) {
    var menu = this.nextSibling;
    if (menu.hidden){
      for (var i in Plugsbee.folders) {
        if (i != 'trash') {
          Plugsbee.folders[i].thumbnail.elm.querySelector('ul#voletMenu').hidden = true;
          Plugsbee.folders[i].thumbnail.elm.querySelector('span.edit').hidden = true;
        }
      }
      if (Plugsbee.layout.currentFolder) {
        for (var i in Plugsbee.layout.currentFolder.files) {
          Plugsbee.layout.currentFolder.files[i].thumbnail.elm.querySelector('ul#voletMenu').hidden = true;
          Plugsbee.layout.currentFolder.files[i].thumbnail.elm.querySelector('span.edit').hidden = true;
        }
      }
      menu.hidden = false;
    }
    else
      menu.hidden = true;
  };
  this.mouseOutThumbnail = function(evt) {
    var menu = this.querySelector('ul#voletMenu');
    if (menu.hidden)
      this.querySelector('span.edit').hidden = true;
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
  this._miniature = aMiniature;
  var figure = this.elm.querySelector('figure');

  function addMiniatureElm(aMiniatureElm) {
    var miniature = figure.querySelector('.miniature');
    if(!miniature)
      figure.insertBefore(aMiniature, figure.firstChild);
    else
      figure.replaceChild(aMiniature, miniature);
  };
  
  if (aMiniature instanceof HTMLElement) {
    aMiniature.classList.add('miniature');
    addMiniatureElm(aMiniature);
  }
  else {
    var img = document.createElement('img');
    img.classList.add('miniature');
    if (aMiniature instanceof File) {
      img.onload = function() {
        window.URL.revokeObjectURL(this.src);
      };
      img.src = window.URL.createObjectURL(aMiniature);
    }
    else if (typeof aMiniature == 'string')
      img.src = aMiniature;

    aMiniature = img;
    addMiniatureElm(img);
  }
});
Widget.Thumbnail.prototype.__defineGetter__('miniature', function() {
	return this._miniature;
});
//
//href property
//
Widget.Thumbnail.prototype.__defineSetter__('href', function(aHref) {
	this._href = aHref;
  var href = aHref;

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
  var figcaption = this.elm.getElementsByTagName('figcaption')[0];
  if(aBool === true) {
    figcaption.textContent = '';
    figcaption.appendChild(this.form);
  }
  if(aBool === false) {
    figcaption.textContent = this.label;
  }
});
Widget.Thumbnail.prototype.__defineGetter__('edit', function() {
	return this._edit;
});

//
//menu property
//
Widget.Thumbnail.prototype.__defineSetter__('menu', function(aBool) {
	this._menu = aBool;
  var menu = this.elm.querySelector('span.edit');
  if(aBool === true) {
    //menu.hidden = false;
    this.elm.addEventListener('mouseover', this.mouseEnterThumbnail, false);
    this.elm.addEventListener('mouseout', this.mouseOutThumbnail, false);
    this.elm.querySelector('span.edit').addEventListener('click', this.mouseClickMenu, false);
    //this.elm.getElementsByTagName('a')[0].setAttribute('href', this._href + '?edit');
  }
  if(aBool === false) {
    menu.hidden = true;
    this.elm.getElementsByTagName('a')[0].setAttribute('href', this._href);
  }
});
Widget.Thumbnail.prototype.__defineGetter__('menu', function() {
	return this._menu;
});

