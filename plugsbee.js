'use strict';

//window.URL
window.URL = window.webkitURL || window.URL;

var Plugsbee = {
  hosts: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService),
  createFolder: function() {
    var pbFolder = Object.create(Plugsbee.Folder);
    return pbFolder;
  },
  createFile: function() {
    var pbFile = Object.create(Plugsbee.File);
    return pbFile;
  },
  createHost: function() {
    var pbHost = Object.create(Plugsbee.Host);
    return pbHost;
  },
};

Plugsbee.Host = {
  folders: {}
};

Plugsbee.File = {
  folder: {},
  delete: function() {
    Plugsbee.layout.eraseFile(this);
    Plugsbee.remote.deleteFile(this);
    delete this.folder.files[this.id];
  },
  move: function(aPbFolder) {
    Plugsbee.layout.eraseFile(this);
    Plugsbee.remote.deleteFile(this);

    //Delete the file reference within the previous folder
    delete this.folder.files[this.id];

    //Update the folder reference
    this.folder = aPbFolder;
    //Add the file reference within the folder files object
    aPbFolder.files[this.id] = this;

    //Build the layout file object
    Plugsbee.layout.drawFile(this);

    //Add the remote file
    Plugsbee.remote.newFile(this);
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
      delete this.files[i];
    }
  },
  //~ rename: function(aName) {
    //~ Plugsbee.remote.renameFolder(this, aName);
    //~ return;
    //~ Plugsbee.layout.setFolderName(this);
  //~ },
  moveToTrash: function() {
    for (var i in this.files)
      this.files[i].move(Plugsbee.trash);
      
    this.delete();
  },
  delete: function() {
    Plugsbee.layout.eraseFolder(this);
    Plugsbee.remote.deleteFolder(this);
    delete this.host.folders[this.id];
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
  Plugsbee.user = Plugsbee.createHost();
  Plugsbee.trash = Plugsbee.createFolder();
  Plugsbee.trash.id = 'trash';
  Plugsbee.trash.host = Plugsbee.user;
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
