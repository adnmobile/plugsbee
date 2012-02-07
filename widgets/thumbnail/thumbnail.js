'use strict';

Widget.Thumbnail = function() {
  var elm = document.createElement('div');
  elm.innerHTML = 
    "<a class='thumbnail' draggable='true'>"+
      "<figure>"+
        "<div class='miniature'>"+
          "<img/>"+
        "</div>"+
        "<figcaption class='label'/>"+
      "</figure>"+
    "</a>";
  this.elm = elm.firstChild;
  
  elm = document.createElement('div');
  elm.innerHTML = 
    "<form>"+
      "<input type='text' autofocus='autofocus'/>"+
    "</form>";
  this.form = elm.firstChild;

  this.elm.addEventListener('click', function(e) {
    if(location.protocol !== 'file:') {
      history.pushState(null, null, this.href);
      var event = document.createEvent('Event');
      event.initEvent('popstate', true, true);
      window.dispatchEvent(event);
      e.preventDefault();
    }
  }, true);

  this.elm.addEventListener('dragstart', function(evt) {
    var img = this.querySelector('img');
    evt.dataTransfer.setDragImage(img, -10, -10);
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('Text', this.getAttribute('data-jid'));
    document.getElementById('dock').hidden = false;
  });
  this.elm.addEventListener('dragend', function(evt) {
    document.getElementById('dock').hidden = true;
  });
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
  var href = aHref;
  if(location.protocol === 'file:')
    href = '#'+aHref

  this.elm.setAttribute('href', href);
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

