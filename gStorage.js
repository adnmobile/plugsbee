'use strict';

var gStorage = {
  addFolder: function(aFolder) {
    var folder = {
      id: aFolder.id,
      host: aFolder.host,
      name: aFolder.name,
      files: {} 
    };
    var folders = this.getFolders();
    folders[folder.id] = folder;
    localStorage.setItem('folders', JSON.stringify(folders));
  },
  deleteFolder: function(aPbFolder) {
    var folders = this.getFolders();
    delete folders[aPbFolder.id];
    localStorage.setItem('folders', JSON.stringify(folders));
  },
  deleteFile: function(aPbFile) {
    var files = this.getFiles();
    delete files[aPbFile.id];
    localStorage.setItem('files', JSON.stringify(files));
  },
  addFile: function(aPbFile) {
    var file = {
      id: aPbFile.id,
      name: aPbFile.name,
      miniature: aPbFile.miniatureURL,
      src: aPbFile.src,
      type: aPbFile.type,
      folderId: aPbFile.folder.id
    };
    var files = this.getFiles();
    files[file.id] = file;
    localStorage.setItem('files', JSON.stringify(files));
  },
  getFolders: function() {
    var folders = {};
    var store = localStorage.getItem('folders');
    if (!store)
      localStorage.setItem('folders', '{}')

    else
      folders = JSON.parse(store);

    return folders;
  },
  getFiles: function(aPbFolder) {
    var files = {};
    var store = localStorage.getItem('files');
    if (!store)
      localStorage.setItem('files', '{}')
    
    else {
      var parsed = JSON.parse(store);
      
      if (!aPbFolder)
        files = JSON.parse(store);
      
      else {
        var items = JSON.parse(store);
        files = {};
        for (var i in items) {
          if (items[i].folderId === aPbFolder.id)
            files[i] = items[i];
        }
      }

    }
    return files;
  },
  renameFolder: function(aFolder) {
    this.addFolder(aFolder);
  },
  renameFile: function(aFile) {
    this.addFile(aFile);
  },
};
