'use strict';

Widget.Panel = function() {
  
  var thumbnail = (new Widget.Thumbnail()).elm;
  thumbnail.classList.add('upload');
  thumbnail.removeAttribute('draggable');
  thumbnail.querySelector('.miniature').innerHTML =  
    "<div class='area'>"+
      "<div class='text'>Drop files here to upload</div>"+
    "</div>";
  thumbnail.querySelector('.label').textContent = "Upload files";
  var div = document.createElement('div');
  div.classList.add('panel');
  div.hidden = true;
  
  div.appendChild(thumbnail);
  
  this.elm = div;

  // No file upload on Safari mobile.
  if (platform.os.match('iOS'))
    this.elm.querySelector('.upload').hidden = true;
};
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
Widget.Panel.prototype.append = function (aElm) {
  return this.elm.insertBefore(aElm,this.elm.firstChild);
}
