'use strict';

//Folder
Plugsbee.Folder = function() {
  this.thumbnail = new Widget.Thumbnail();
  this.thumbnail.draggable = true;
  this.thumbnail.elm.classList.add('folder');
  this.panel = new Widget.Panel();
  this.files = {};
};
//Properties
Plugsbee.Folder.prototype.__defineSetter__('jid', function(aJID) {
  this._jid = aJID;
  this.thumbnail.jid = this._jid;
  this.panel.jid = this._jid;
});
Plugsbee.Folder.prototype.__defineGetter__('jid', function() {
  return this._jid;
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
  this.thumbnail.draggable = true;
  this.thumbnail.elm.classList.add('file');
  this.type = '';
  this.src = '';
};
Plugsbee.File.prototype.__defineSetter__('jid', function(aJID) {
  this._jid = aJID;
  this.thumbnail.jid = this._jid;
});
Plugsbee.File.prototype.__defineGetter__('jid', function() {
  return this._jid;
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
  this.thumbnail.miniature = aMiniature
  //~ base64.encode(
});
Plugsbee.File.prototype.__defineGetter__('miniature', function() {
  return this._miniature;
});
