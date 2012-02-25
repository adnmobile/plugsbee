'use strict';

Widget.Panel = function() {
  var thumbnail = (new Widget.Thumbnail()).elm;
  thumbnail.classList.add('upload');
  thumbnail.removeAttribute('draggable');
  thumbnail.querySelector('.miniature').innerHTML =  
    "<div class='area'>"+
    "</div>";
  thumbnail.querySelector('.label').textContent = "Upload";
  thumbnail.addEventListener('click', function() {
    gUserInterface.openFilePicker();
  });
  var div = document.createElement('div');
  div.classList.add('panel');
  div.hidden = true;
  
  div.appendChild(thumbnail);
  
  this.elm = div;
};

//Properties
Widget.Panel.prototype.__defineSetter__('jid', function(aId) {
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
