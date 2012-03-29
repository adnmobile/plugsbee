'use strict';

Widget.Panel = function() {
  var thumbnail = new Widget.Thumbnail();
  thumbnail.elm.classList.add('upload');
  thumbnail.elm.removeAttribute('draggable');

  var div = document.createElement('div');
  div.classList.add('area');
  div.classList.add('miniature');
  thumbnail.miniature = div;

  thumbnail.label = "Add file";
  thumbnail.elm.addEventListener('click', function() {
    Plugsbee.layout.openFilePicker();
  });
  var div = document.createElement('ul');
  div.classList.add('panel');
  div.hidden = true;

  div.appendChild(thumbnail.elm);

  this.elm = div;
};
Widget.Panel.prototype.__defineSetter__('hidden', function(aBool) {
	this._hidden = aBool;
  this.elm.hidden = aBool;
});
Widget.Panel.prototype.__defineGetter__('hidden', function() {
	return this._hidden;
});
