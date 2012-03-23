'use strict';

Plugsbee.storage = {
  addFolder: function(aPbFolder) {
    var folder = {
      id: aPbFolder.id,
      host: aPbFolder.host,
      name: aPbFolder.name,
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
      src: aPbFile.src,
      type: aPbFile.type,
      folderId: aPbFile.folder.id
    };
    if (aPbFile.miniatureDataURI)
      file.miniatureDataURI = aPbFile.miniatureDataURI;

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

//~ Plugsbee.storage = {
  //~ getFolders: function() {
    //~ 
    //~ var pbFolders = {};
    //~ var store = localStorage.getItem('folders');
    //~ if (!store)
      //~ localStorage.setItem('folders', '{}')
    //~ else {
      //~ var folders = JSON.parse(store);
      //~ for (var i in folders) {
        //~ var pbFolder = Object.create(Plugsbee.Folder);
        //~ pbFolder.id = folders[i].id;
        //~ pbFolder.host = folders[i].host;
        //~ pbFolder.name = folders[i].name;
//~ 
        //~ pbFolders[pbFolder.id] = pbFolder;
      //~ };
    //~ }
    //~ return pbFolders;
  //~ },
  //~ getFiles: function(aPbFolder) {
    //~ var pbFiles = {};
    //~ var store = localStorage.getItem('files');
    //~ if (!store)
      //~ localStorage.setItem('files', '{}')
//~ 
    //~ else {
      //~ var files = JSON.parse(store);
      //~ for (var i in files) {
        //~ if (!aPbFolder || (files[i].folderId === aPbFolder.id)) {
          //~ var pbFile = Plugsbee.createFile();
          //~ pbFile.id = files[i].id;
          //~ pbFile.type = files[i].type;
          //~ if (files[i].miniature)
            //~ pbFile.miniature = files[i].miniature;
          //~ pbFile.fileURL = files[i].src;
          //~ pbFile.name = files[i].name;
          //~ pbFile.folderId = files[i].folderId;
          //~ pbFiles[pbFile.id] = pbFile;
        //~ }
//~ 
      //~ };
      //~ 
      //~ var parsed = JSON.parse(store);
      //~ 
      //~ if (!aPbFolder)
        //~ files = JSON.parse(store);
      //~ 
      //~ else {
        //~ var items = JSON.parse(store);
        //~ files = {};
        //~ for (var i in items) {
          //~ if (items[i].folderId === aPbFolder.id)
            //~ files[i] = items[i];
        //~ }
      //~ }
//~ 
    //~ }
    //~ return pbFiles;
  //~ },
//~ };
