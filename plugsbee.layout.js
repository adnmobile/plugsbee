'use strict';

Plugsbee.layout = {
  //
  //Folder
  //
  buildFolder: function(aPbFolder) {
    var thumbnail = new Widget.Thumbnail();
    thumbnail.elm.setAttribute('data-type', 'folder');
    thumbnail.elm.classList.add('folder');
    thumbnail.draggable = true;
    thumbnail.miniature = gUserInterface.themeFolder+'folder.png';
    thumbnail.label = aPbFolder.name;
    thumbnail.href = aPbFolder.name;
    aPbFolder.thumbnail = thumbnail;
    
    var panel = new Widget.Panel();
    panel.elm.firstChild.setAttribute('data-require', 'network');
    panel.elm.setAttribute('data-name', aPbFolder.id);
    aPbFolder.panel = panel;
  },
  drawFolder: function(aPbFolder) {
    this.buildFolder(aPbFolder);
    this.handleFolder(aPbFolder);
  },
  handleFolder: function(aPbFolder) {
    //Trash folder
    if (aPbFolder.id === 'trash') {
      //Thumbnail
      aPbFolder.thumbnail.elm = document.querySelector('.thumbnail.trash');
      aPbFolder.thumbnail.elm.hidden = false;
      //Panel
      aPbFolder.panel.elm = document.querySelector('.panel.trash');
    }
    else {
      //Thumbnail
      var folders = document.getElementById('folders');
      aPbFolder.thumbnail.elm = folders.insertBefore(aPbFolder.thumbnail.elm, folders.firstChild);
      //Panel
      var deck = document.getElementById('deck');
      aPbFolder.panel.elm = deck.appendChild(aPbFolder.panel.elm);
    }
  },
  eraseFolder: function(aFolder) {
    aFolder.thumbnail.elm.parentNode.removeChild(aFolder.thumbnail.elm);
    aFolder.panel.elm.parentNode.removeChild(aFolder.panel.elm);
  },
  setFolderName: function(aPbFolder) {
    aPbFolder.thumbnail.label = aPbFolder.name;
    aPbFolder.thumbnail.href = encodeURIComponent(aPbFolder.name);
    //Updates href
    for (var i in aPbFolder.files)
      aPbFolder.files[i].thumbnail.href = encodeURIComponent(aPbFolder.files[i].folder.name) + '/' + encodeURIComponent(aPbFolder.files[i].name);
  },
  setFolderMiniature: function(aPbFolder) {
    //Miniature
    aPbFolder.thumbnail.miniature = aPbFolder.miniature;
  },
  
  //
  //File
  //
  buildFile: function(aPbFile) {
    var thumbnail = new Widget.Thumbnail();
    thumbnail.elm.setAttribute('data-type', 'file');
    thumbnail.draggable = true;
    
    thumbnail.elm.classList.add('file');
    aPbFile.thumbnail = thumbnail;
    if (aPbFile.miniature)
      this.setFileMiniature(aPbFile);
    else
      this.setFileMiniature(aPbFile, gUserInterface.themeFolder+'file.png');
    if (aPbFile.name)
      this.setFileName(aPbFile);
  },
  drawFile: function(aPbFile) {
    this.buildFile(aPbFile);
    this.handleFile(aPbFile);
  },
  eraseFile: function(aPbFile) {
    aPbFile.thumbnail.elm.parentNode.removeChild(aPbFile.thumbnail.elm);
    delete aPbFile.thumbnail;
  },
  handleFile: function(aPbFile) { 
    var panel = aPbFile.folder.panel.elm;
    aPbFile.thumbnail.elm = panel.insertBefore(aPbFile.thumbnail.elm, panel.lastChild);
  },
  setFileName: function(aPbFile) {
    aPbFile.thumbnail.label = aPbFile.name;
    if (aPbFile.folder.id === "trash")
      aPbFile.thumbnail.href = 'trash' + '/' + encodeURIComponent(aPbFile.name);
    else
      aPbFile.thumbnail.href = aPbFile.folder.name + '/' + encodeURIComponent(aPbFile.name);
  },
  setFileMiniature: function(aPbFile, aMiniature) {
    var miniature = aMiniature || aPbFile.miniature; 
    aPbFile.thumbnail.miniature = miniature;
  }
};
