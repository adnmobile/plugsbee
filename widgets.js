


function Widget(aObject) {
  this._node = aObject.template;
  
};

Widget.prototype.__defineSetter__('parent', function(aWidget) {
  this._node = aWidget._node.appendChild(this._node);
});
Widget.prototype.__defineGetter__('parent', function() {
  return this._node.parentNode;
});
Widget.prototype.remove = function() {
  this.parent.removeChild(this._node);
};

//~ Widget.prototype.__defineSetter__('previous', function(aWidget) {
  //~ this._node = aWidget._node.appendChild(this._node);
//~ });
//~ Widget.prototype.__defineGetter__('previous', function() {
  //~ return this._node.previousElementSibling;
//~ });
//~ 
//~ Widget.prototype.__defineSetter__('next', function(aWidget) {
  //~ this._node = aWidget._node.appendChild(this._node);
//~ });
//~ Widget.prototype.__defineGetter__('next', function() {
  //~ return this._node.nextElementSibling;
//~ });



var deck = new Widget({
  template: document.createElement('div')
});



