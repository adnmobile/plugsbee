'use strict';

Plugsbee.Folder = {
  files: {},
  purge: function() {
    gRemote.purgeFolder(this);
    for (var i in this.files) {
      gStorage.deleteFile(this.files[i]);
      gInterface.eraseFile(this.files[i]);
      delete Plugsbee.files[this.files[i]];
    }
  },
  rename: function(aName) {
    this.name = aName;
    gRemote.renameFolder(this);
    gStorage.renameFolder(this);
  },
  delete: function() {
    gInterface.eraseFolder(this);
    gRemote.deleteFolder(this);
    gStorage.deleteFolder(this);
    delete Plugsbee.folders[this.id];
  },
};

//Name property
//~ Object.defineProperty(Plugsbee.Folder, 'name', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aName) {
    //~ this._name = aName;
    //~ gInterface.setFolderName(this);
  //~ },
  //~ get: function() {
    //~ return this._name;
  //~ },
//~ });

//Id property
//~ Object.defineProperty(Plugsbee.Folder, 'id', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aId) {
    //~ this._id = aId;
    //~ this.thumbnail.elm.setAttribute('data-id', aId);
    //~ this.panel.elm.setAttribute('data-name', aId);
  //~ },
  //~ get: function() {
    //~ return this._id;
  //~ },
//~ });

//Miniature property
//~ Object.defineProperty(Plugsbee.Folder, 'miniature', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aMiniature) {
    //~ this._miniature = aMiniature;
    //~ gInterface.setFolderMiniature(this);
  //~ },
  //~ get: function() {
    //~ return this._miniature;
  //~ },
//~ });

