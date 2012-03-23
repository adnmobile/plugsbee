'use strict';

Plugsbee.File = {
  folder: {},
  delete: function() {
    gInterface.eraseFile(this);
    gRemote.deleteFile(this);
    gStorage.deleteFile(this);
    delete Plugsbee.files[this.id];
    delete Plugsbee.folders[this.folder.id].files[this.id];
  },
  move: function(aPbFolder) {
    this.delete();

    this.folder = aPbFolder;
    var id = Math.random().toString().split('.')[1];
    this.draw();
    this.id = id;
    gInterface.handleFile(this);

    gRemote.newFile(this);
    gStorage.addFile(this);
    
    Plugsbee.files[this.id] = this;
    Plugsbee.folders[this.folder.id].files[this.id] = this;
  },
  rename: function(aName) {
    this.name = aName;
    gRemote.renameFile(this);
    gStorage.renameFile(this);
  },
  handleMedia: function() {
    var that = this;
    Plugsbee.media.getFileDataURI(this, function(dataURI) {
      that.fileDataURI = dataURI;
      resizeImageDataURI(dataURI, 84, 84, function(canvas) {
        Plugsbee.layout.setFileMiniature(that, canvas);
        that.miniatureDataURI = canvas.toDataURL();
        Plugsbee.storage.addFile(that);
      });
    });
  }
};


//~ setName.bind(Plugsbee.File);
//~ 
//~ Plugsbee.File.ui.setName = setName.bind(Plugsbee.File);
//~ Plugsbee.File.ui.setName();

//name property
//~ Object.defineProperty(Plugsbee.File, 'name', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aName) {
    //~ this._name = aName;
    //~ gInterface.setFileName(this);
  //~ },
  //~ get: function() {
    //~ return this._name;
  //~ },
//~ });
//~ //folder property
//~ Object.defineProperty(Plugsbee.File, 'folder', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aPbFolder) {
    //~ this._folder = aPbFolder;
    //~ gInterface.setFileFolder(this);
  //~ },
  //~ get: function() {
    //~ return this._folder;
  //~ },
//~ });
//~ //id property
//~ Object.defineProperty(Plugsbee.File, 'id', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aId) {
    //~ this._id = aId;
    //~ this.thumbnail.elm.setAttribute('data-id', aId);
  //~ },
  //~ get: function() {
    //~ return this._id;
  //~ },
//~ });
//~ 
//~ //fileURL property
//~ Object.defineProperty(Plugsbee.File, 'fileURL', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aFileURL) {
    //~ this._fileURL = aFileURL;
    //~ if (this.miniature)
      //~ return;
    //~ 
    //~ var that = this;
    //~ 
    //~ var xhr = new XMLHttpRequest();
    //~ xhr.open('GET', aFileURL, true);
    //~ xhr.responseType = 'arraybuffer';
    //~ xhr.onload = function() {
      //~ if (this.status !== 200)
       //~ return;
//~ 
      //~ var uInt8Array = new Uint8Array(this.response);
      //~ var binaryString = new Array(uInt8Array.length);
      //~ for (var i = 0; i < uInt8Array.length; i++) {
        //~ binaryString[i] = String.fromCharCode(uInt8Array[i]);
      //~ }
//~ 
      //~ var data = binaryString.join('');
      //~ var dataURI = 'data:'+that.type+';base64,'+window.btoa(data);
      //~ that.file = dataURI;
    //~ };
    //~ xhr.send();
  //~ },
  //~ get: function() {
    //~ return this._fileURL;
  //~ },
//~ });
//~ 
//~ 
//~ //file property
//~ Object.defineProperty(Plugsbee.File, 'file', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aFile) {
    //~ this._file = aFile;
//~ 
    //~ if ((this.type !== 'image/jpeg') && (this.type !== 'image/png')) {
      //~ this.miniature = gConfiguration.themeFolder + 'file.png';
      //~ return;
    //~ }
//~ 
    //~ var that = this;
    //~ resizeImageDataURI(aFile, 84, 84, function(canvas) {
      //~ gStorage.addFileMiniature(that, canvas.toDataURL());
      //~ that.miniature = canvas;
    //~ });
  //~ },
  //~ get: function() {
    //~ return this._file;
  //~ },
//~ });
//~ 
//~ //Miniature property
//~ Object.defineProperty(Plugsbee.File, 'miniature', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aMiniature) {
    //~ this._miniature = aMiniature;
    //~ gStorage.addFile(this);
    //~ gInterface.setFileMiniature(this);
  //~ },
  //~ get: function() {
    //~ return this._miniature;
  //~ },
//~ });

