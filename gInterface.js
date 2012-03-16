'use strict';

var gInterface = {
  //
  //Folder
  //
  drawFolder: function(aPbFolder) {
    var thumbnail = new Widget.Thumbnail();
    thumbnail.elm.setAttribute('data-type', 'folder');
    thumbnail.elm.classList.add('folder');
    thumbnail.draggable = true;
    thumbnail.miniature = gUserInterface.themeFolder+'folder.png';
    aPbFolder.thumbnail = thumbnail;
    
    var panel = new Widget.Panel();
    panel.elm.firstChild.setAttribute('data-require', 'network');
    aPbFolder.panel = panel;
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
  setFolderName: function(aFolder) {
    aFolder.thumbnail.label = aFolder.name;
    aFolder.thumbnail.href = encodeURIComponent(aFolder.name);
    //Updates href
    for (var i in aFolder.files)
      aFolder.files[i].thumbnail.href = encodeURIComponent(aFolder.files[i].folder.name) + '/' + encodeURIComponent(aFolder.files[i].name);
  },
  setFolderMiniature: function(aPbFolder) {
    //Miniature
    aPbFolder.thumbnail.miniature = aPbFolder.miniature;
  },
  
  //
  //File
  //
  drawFile: function(aPbFile) {
    var thumbnail = new Widget.Thumbnail();
    thumbnail.elm.setAttribute('data-type', 'file');
    thumbnail.draggable = true;
    thumbnail.elm.classList.add('file');
    aPbFile.thumbnail = thumbnail;
    if (aPbFile.miniature)
      this.setFileMiniature(aPbFile);
    if (aPbFile.name)
      this.setFileName(aPbFile);
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
  setFileMiniature: function(aPbFile) {
    var blobURL = window.URL.createObjectURL(aPbFile.miniature);
    aPbFile.thumbnail.miniature = blobURL;
    window.URL.revokeObjectURL(blobURL);
  },
  //~ setFileFile: function(aPbFile) {
    //~ aPbFile.thumbnail.miniature = window.URL.createObjectURL(aPbFile.miniature);
  //~ },
}; 
