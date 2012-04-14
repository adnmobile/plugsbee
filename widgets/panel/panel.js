'use strict';

Widget.Panel = function() {
  var div = document.createElement('ul');

  this.elm = div;
};
Widget.Panel.prototype.__defineSetter__('hidden', function(aBool) {
	this._hidden = aBool;
  this.elm.hidden = aBool;
});
Widget.Panel.prototype.__defineGetter__('hidden', function() {
	return this._hidden;
});
