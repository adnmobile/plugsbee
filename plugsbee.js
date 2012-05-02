'use strict';

//window.URL
window.URL = window.webkitURL || window.URL;

var Plugsbee = {
	folders: {},
	files: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService),
  createFolder: function() {
    var pbFolder = Object.create(Plugsbee.Folder);
    return pbFolder;
  },
  createFile: function() {
    var pbFile = Object.create(Plugsbee.File);
    return pbFile;
  },
  createUser: function() {
    var pbUser = Object.create(Plugsbee.User);
    return pbUser;
  },
};

Plugsbee.User = {
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
Plugsbee.connection.load('vcard');

//~ context.network.onLine = false;


window.addEventListener("load", function() {
  Plugsbee.user = Plugsbee.createUser();
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
  
  Plugsbee.user.id = Plugsbee.connection.jid.node;
  Plugsbee.user.name = Plugsbee.user.id;
  
  var path = decodeURIComponent(location.pathname).split('/');
  path.shift();
  var options = location.search;
  
  Plugsbee.remote.getProfile(function(profile) {
    Plugsbee.layout.accountForm.elements['name'].value = profile.name;
    Plugsbee.layout.accountForm.elements['email'].value = profile.email;
  });
  //~ Plugsbee.connection.presence.send({priority: '0'});
  Plugsbee.layout.accountMenu.textContent = '◀ ' + Plugsbee.user.name;

  if (gConfiguration.PubSubService === 'PEP')
    gConfiguration.PubSubService = Plugsbee.connection.jid.bare;

  Plugsbee.layout.handlePath();
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
