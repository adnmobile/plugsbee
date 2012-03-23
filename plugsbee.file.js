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
    Plugsbee.layout.setFileName(this);
    Plugsbee.remote.renameFile(this);
    Plugsbee.storage.renameFile(this);
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
