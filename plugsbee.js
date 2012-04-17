'use strict';

//window.URL
window.URL = window.webkitURL || window.URL;

var Plugsbee = {
	folders: {},
	files: {},
	contacts: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService),
  createFolder: function() {
    var pbFolder = Object.create(Plugsbee.Folder);
    return pbFolder;
  },
  createFile: function() {
    var pbFile = Object.create(Plugsbee.File);
    return pbFile;
  },
};

Plugsbee.File = {
  folder: {},
  delete: function() {
    Plugsbee.layout.eraseFile(this);
    Plugsbee.remote.deleteFile(this);
    delete Plugsbee.files[this.id];
    delete Plugsbee.folders[this.folder.id].files[this.id];
  },
  move: function(aPbFolder) {
    Plugsbee.layout.eraseFile(this);
    Plugsbee.remote.deleteFile(this);

    //Delete the file reference within the previous folder
    delete Plugsbee.folders[this.folder.id].files[this.id];

    //Update the folder reference
    this.folder = aPbFolder;
    //Add the file reference within the folder files object
    Plugsbee.folders[this.folder.id].files[this.id] = this;
    
    //New ID
    var id = Math.random().toString().split('.')[1];
    this.id = id;
    //Build the layout file object
    Plugsbee.layout.drawFile(this);
    
    //Add the remote file
    Plugsbee.remote.newFile(this);

    Plugsbee.files[this.id] = this;
    
  },
  rename: function(aName) {
    this.name = aName;
    Plugsbee.layout.setFileName(this);
    Plugsbee.remote.renameFile(this);
  }
};

Plugsbee.Folder = {
  files: {},
  purge: function() {
    Plugsbee.remote.purgeFolder(this);
    for (var i in this.files) {
      Plugsbee.layout.eraseFile(this.files[i]);
      delete Plugsbee.files[this.files[i]];
    }
  },
  rename: function(aName) {
    this.name = aName;
    Plugsbee.layout.setFolderName(this);
    Plugsbee.remote.renameFolder(this);
  },
  moveToTrash: function() {
    for (var i in this.files)
      this.files[i].move(Plugsbee.folders['trash']);
      
    this.delete();
  },
  delete: function() {
    Plugsbee.layout.eraseFolder(this);
    Plugsbee.remote.deleteFolder(this);
    delete Plugsbee.folders[this.id];
  },
};

Plugsbee.connection.load('events');
Plugsbee.connection.load('presence');
Plugsbee.connection.load('dataforms');
Plugsbee.connection.load('disco');
Plugsbee.connection.load('pubsub');

//~ context.network.onLine = false;


window.addEventListener("load", function() {
  Plugsbee.layout.init();

  var password = localStorage.getItem('password');
  var login = localStorage.getItem('login');
  if(!password || !login) {
    Plugsbee.connection.load('ANONYMOUS');
    Plugsbee.connection.connect('plugsbee.com');
    Plugsbee.connection.anonymous = true;
  }
  else {
    Plugsbee.connection.load('PLAIN');
    Plugsbee.connection.connect(login, password);
  }
});

Plugsbee.connection.on('connected', function() {
  console.log('connected');
  Plugsbee.layout.showFolders();

  Plugsbee.connection.presence.send({priority: '0'});
  Plugsbee.username = Plugsbee.connection.jid.node;
  //~ Plugsbee.layout.accountMenu.textContent = '◀ ' + Plugsbee.username;
  Plugsbee.layout.accountMenu.textContent = '◀ ' + Plugsbee.username;

  if (gConfiguration.PubSubService === 'PEP')
    gConfiguration.PubSubService = Plugsbee.connection.jid.bare;

  if (Plugsbee.connection.anonymous) {
    document.getElementById('anonymous').hidden = false;
    var pbFolder = Plugsbee.createFolder();
    pbFolder.id = 'trash';
  
    Plugsbee.remote.newFolder(pbFolder, function() {
      Plugsbee.folders['trash'] = pbFolder;
      Plugsbee.layout.drawFolder(pbFolder);
    });
    
    Plugsbee.layout.handlePath();
    return;
  }

  //Retrieves and handles folders from remote storage
  Plugsbee.remote.getFolders(function(pbFolders) {
    for (var i in pbFolders) {

      Plugsbee.folders[pbFolders[i].id] = pbFolders[i];
      Plugsbee.layout.drawFolder(pbFolders[i]);

      //Retrieves and handles files from remote storage
      Plugsbee.remote.getFiles(pbFolders[i], function(pbFiles) {
        if ((Object.keys(pbFiles).length) &&
            (pbFiles[Object.keys(pbFiles)[0]].folderId === 'trash' )) {
          Plugsbee.folders['trash'].thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/user-trash-full.png';
        }
        for (var y in pbFiles) {
          var folder = Plugsbee.folders[pbFiles[y].folderId];
          folder.files[pbFiles[y].id] = pbFiles[y];
          pbFiles[y].folder = folder;

          Plugsbee.layout.drawFile(pbFiles[y]);
          Plugsbee.files[pbFiles[y].id] = pbFiles[y];
        }
      });
    }
    Plugsbee.layout.handlePath();
  });
});
Plugsbee.connection.on('connecting', function() {
  console.log('connecting');
});
Plugsbee.connection.on('failure', function() {
  console.log('failure');
  alert('Wrong login and/or password.');
  Plugsbee.layout.showLogin();
});
Plugsbee.connection.on('disconnecting', function() {
  console.log('disconnecting');
});

Plugsbee.connection.on('disconnected', function() {
  console.log('disconnected');
  //~ delete Plugsbee.folders;
  //~ delete Plugsbee.files;
  //~ delete Plugsbee.contacts;
  //~ Plugsbee.connection = new Lightstring.Connection(gConfiguration.WebsocketService);
  //~ location.reload();
});
