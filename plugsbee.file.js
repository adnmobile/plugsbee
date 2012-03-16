'use strict';

Plugsbee.File = {
  folder: {},
  draw: function() {
    gInterface.drawFile(this);
  },
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
};
//name property
Object.defineProperty(Plugsbee.File, 'name', {
  configurable: true,
  enumerable:   true,
  set: function(aName) {
    this._name = aName;
    gInterface.setFileName(this);
  },
  get: function() {
    return this._name;
  },
});

//id property
Object.defineProperty(Plugsbee.File, 'id', {
  configurable: true,
  enumerable:   true,
  set: function(aId) {
    this._id = aId;
    this.thumbnail.elm.setAttribute('data-id', aId);
  },
  get: function() {
    return this._id;
  },
});

//fileURL property
Object.defineProperty(Plugsbee.File, 'fileURL', {
  configurable: true,
  enumerable:   true,
  set: function(aFileURL) {
    this._fileURL = aFileURL;
    
    var that = this;
    gStorage.getBinaryFile(this,
      //Success
      function(blob) {
        that.file = blob;
      },
      //Error
      function(error) {
        http.get(that._fileURL,
          //Success
          function(blob) {
            that.file = blob;
          },
          //Error
          function(error) {
            console.log(error);
          }
        );
      }
    );
  },
  get: function() {
    return this._fileURL;
  },
});

//file property
Object.defineProperty(Plugsbee.File, 'file', {
  configurable: true,
  enumerable:   true,
  set: function(aFile) {
    this._file = aFile;
    gStorage.addBinaryFile(this);

    if ((this.type !== 'image/jpeg') && (this.type !== 'image/png'))
      return;

    var that = this;
    gStorage.getBinaryMiniature(this,
      //Success
      function(blob) {
        that._miniature = blob;
        gInterface.setFileMiniature(that);
      },
      //Error
      function(error) {
        resizeImage(aFile, 84, 84, function(blob) {
          that.miniature = blob;
          gStorage.addBinaryMiniature(that);
        });
      }
    );
    //~ gInterface.setFileFile(this);
  },
  get: function() {
    return this._file;
  },
});

//MiniatureURL property
//~ Object.defineProperty(Plugsbee.File, 'miniatureURL', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aMiniatureURL) {
    //~ this._miniatureURL = aMiniatureURL;
    //~ 
    //~ var that = this;

  //~ },
  //~ get: function() {
    //~ return this._miniatureURL;
  //~ },
//~ });

//Miniature property
Object.defineProperty(Plugsbee.File, 'miniature', {
  configurable: true,
  enumerable:   true,
  set: function(aMiniature) {
    this._miniature = aMiniature;
    gStorage.addBinaryMiniature(this);
    gInterface.setFileMiniature(this);
  },
  get: function() {
    return this._miniature;
  },
});

