'use strict';

Widget.Editabletext = function(aElm) {
	this.elm = aElm;
  
  this.elm.onclick = function() {
    this.edit = true;
  }
  var input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('autofocus', 'autofocus');
  var that = this;
  var form = document.createElement('form');
  form.appendChild(input);
  this.form = form;
};
//
//value property
//
Widget.Editabletext.prototype.__defineSetter__('value', function(aValue) {
  if(this.edit === true)
    this.form.firstChild.value = aValue;
  else
    this.elm.textContent = aValue;
});
Widget.Editabletext.prototype.__defineGetter__('value', function() {
  if(this.edit === true)
    return this.form.firstChild.value;
  else
    return this.elm.textContent;
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

