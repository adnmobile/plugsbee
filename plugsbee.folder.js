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
    Plugsbee.layout.setFolderName(this);
    Plugsbee.remote.renameFolder(this);
    Plugsbee.storage.renameFolder(this);
  },
  delete: function() {
    Plugsbee.layout.eraseFolder(this);
    Plugsbee.remote.deleteFolder(this);
    Plugsbee.storage.deleteFolder(this);
    delete Plugsbee.folders[this.id];
  },
};
