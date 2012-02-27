'use strict';

//Folder
Plugsbee.Folder = function() {
  this.thumbnail = new Widget.Thumbnail();
  this.thumbnail.elm.setAttribute('data-type', 'folder');
  this.thumbnail.draggable = true;
  this.thumbnail.elm.classList.add('folder');
  this.panel = new Widget.Panel();
  this.files = {};
};
//Properties
Plugsbee.Folder.prototype.__defineSetter__('id', function(aID) {
  this._id = aID;
  this.thumbnail.elm.setAttribute('data-id', aID);
});
Plugsbee.Folder.prototype.__defineGetter__('id', function() {
  return this._id;
});
Plugsbee.Folder.prototype.__defineSetter__('name', function(aName) {
  this._name = aName;
  this.thumbnail.label = aName;
  this.thumbnail.href = aName;
});
Plugsbee.Folder.prototype.__defineGetter__('name', function() {
  return this._name;
});
Plugsbee.Folder.prototype.__defineSetter__('miniature', function(aMiniature) {
  this._miniature = aMiniature;
  this.thumbnail.miniature = aMiniature
});
Plugsbee.Folder.prototype.__defineGetter__('miniature', function() {
  return this._miniature;
});

//File
Plugsbee.File = function() {
  this.thumbnail = new Widget.Thumbnail();
  this.thumbnail.elm.setAttribute('data-type', 'file');
  this.thumbnail.draggable = true;
  this.thumbnail.elm.classList.add('file');
  this.type = '';
  this.src = '';
};
Plugsbee.File.prototype.__defineSetter__('id', function(aID) {
  this._id = aID;
  this.thumbnail.elm.setAttribute('data-id', aID);
});
Plugsbee.File.prototype.__defineGetter__('id', function() {
  return this._id;
});
Plugsbee.File.prototype.__defineSetter__('name', function(aName) {
  this._name = aName;
  this.thumbnail.label = aName;
  if (this.folder)
    this.thumbnail.href = this.folder.name+'/'+aName;
});
Plugsbee.File.prototype.__defineGetter__('name', function() {
  return this._name;
});
Plugsbee.File.prototype.__defineSetter__('folder', function(aFolder) {
  this._folder = aFolder;
  if (this.name)
    this.thumbnail.href = aFolder.name+'/'+this.name;
});
Plugsbee.File.prototype.__defineGetter__('folder', function() {
  return this._folder;
});
Plugsbee.File.prototype.__defineSetter__('miniature', function(aMiniature) {
  this._miniature = aMiniature;
  this.thumbnail.miniature = aMiniature;
  
  //~ var dataURL = localStorage.getItem(this.jid);
  //~ if (dataURL) {
    //~ this.thumbnail.miniature = dataURL;
    //~ return;
  //~ }
  //~ 
  //~ var file = this;

  //~ var options = {
    //~ 'method': 'GET',
    //~ 'url': this.miniature
  //~ };
  //~ http.request(options, function(data) {
    //~ var uInt8Array = new Uint8Array(data);
    //~ var i = uInt8Array.length;
    //~ var binaryString = new Array(i);
    //~ while (i--)
      //~ binaryString[i] = String.fromCharCode(uInt8Array[i]);
    //~ var data = binaryString.join('');
//~ console.log(data);
    //~ store.set(file.jid, data);
    //~ var dataURL = "data:" + file.type + ";base64," + base64.encode(data);
    //~ file.thumbnail.miniature = dataURL;
    //~ store.set(file.jid, dataURL);
  //~ });
});
Plugsbee.File.prototype.__defineGetter__('miniature', function() {
  return this._miniature;
});
