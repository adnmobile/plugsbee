'use strict';

Widget.Editabletext = function(aElm) {
	this.elm = aElm;
  this.onsubmit = null;
  var that = this;
  this.onclick = function(e) {
   if (e.target.tagName !== 'span')
    return;
   that.edit = true;
   //~ this.removeEventListener('click', that.onclick);
  }
  
  var span = document.createElement('span');
  this.elm = span;

  var input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('autofocus', 'autofocus');
  var form = document.createElement('form');
  form.appendChild(input);
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var value = this.elements[0].value;
    that.onsubmit(value);
    that.edit = false;
    that.value = value;
  });
  
  this.form = form;
};
//
//value property
//
Widget.Editabletext.prototype.__defineSetter__('value', function(aValue) {
  this._value = aValue;
  if(this.edit === true)
    this.form.firstChild.value = aValue;
  else
    this.elm.textContent = aValue;
});
Widget.Editabletext.prototype.__defineGetter__('value', function() {
  return this._value;
});
//
//edit property
//
Widget.Editabletext.prototype.__defineSetter__('edit', function(aBool) {
	this._edit = aBool;
  var that = this;
  if(aBool === true) {
    this.originalValue = this.elm.textContent;
    //~ this.elm.textContent = '';
    this.elm.removeChild(this.elm.firstChild);
    this.form.firstChild.value = this.originalValue;
    this.form.firstChild.onblur = function(evt) {
      that.edit = false;
      that.value = that.originalValue;
    };
    this.form = this.elm.appendChild(this.form);
    this.form.firstChild.focus();
  }
  if(aBool === false) {
    this.form.firstChild.onblur = null;
    this.elm.innerHTML = this.originalValue;
  }
});
Widget.Editabletext.prototype.__defineGetter__('edit', function() {
	return this._edit;
});
//
//editable property
//
Widget.Editabletext.prototype.__defineSetter__('editable', function(aBool) {
	this._editable = aBool;
  var that = this;
  if(aBool === true) {
    this.elm.classList.add('editable');
    this.elm.addEventListener('click', this.onclick);
  }
  if(aBool === false) {
    this.elm.classList.remove('editable');
    this.elm.removeEventListener('click', this.onclick);
  }
});
Widget.Editabletext.prototype.__defineGetter__('editable', function() {
	return this._editable;
});

