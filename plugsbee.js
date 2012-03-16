'use strict';

var Plugsbee = {
	folders: {},
	files: {},
	contacts: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService),
  handleFolder: function(aFolder) {
    var pbFolder = Object.create(Plugsbee.Folder);
    pbFolder.draw();
    for (var i in aFolder)
      pbFolder[i] = aFolder[i];
    
    this.folders[pbFolder.id] = pbFolder;

    gInterface.handleFolder(pbFolder);

    return pbFolder;
  },
  handleFile: function(aFile) {
    var pbFile = Object.create(Plugsbee.File);
    pbFile.draw();

    var folder = Plugsbee.folders[aFile.folderId];

    pbFile.folder = folder;
    pbFile.id = aFile.id;
    pbFile.name = aFile.name;
    pbFile.type = aFile.type;
    pbFile.fileURL = aFile.src;
    if (aFile.miniature) {
      pbFile.miniatureURL = aFile.miniature;
    }

    folder.files[pbFile.id] = pbFile;
    this.files[pbFile.id] = pbFile;
    gInterface.handleFile(pbFile);

    return pbFile;
  }
};

Plugsbee.connection.load('PLAIN');
Plugsbee.connection.load('events');
Plugsbee.connection.load('presence');
Plugsbee.connection.load('dataforms');
Plugsbee.connection.load('disco');
Plugsbee.connection.load('pubsub');

//~ context.network.onLine = false;


window.addEventListener("load", function() {
  if (context.network.onLine) {
    var password = localStorage.getItem('password');
    var login = localStorage.getItem('login');
    if(!password || !login) {
      gUserInterface.showLogin();
      return;
    }
    Plugsbee.jid = login;
    Plugsbee.connection.connect(login, password);
  }
  else {
    //Retrieves and handles folders from offline storage
    var folders = gStorage.getFolders();
    for (var i in folders) {
      var pbFolder = Plugsbee.handleFolder(folders[i]);
      
      //Retrieves and handles files from offline storage
      var files = gStorage.getFiles(pbFolder);
      for (var y in files)
        Plugsbee.handleFile(files[y]);
    };
  }
});



Plugsbee.connection.on('connected', function() {
  console.log('connected');
  gUserInterface.showFolders();
  Plugsbee.connection.presence.send({priority: '0'});
  Plugsbee.connection.user = Plugsbee.connection.jid.node;
  if (gConfiguration.PubSubService === 'PEP')
    gConfiguration.PubSubService = Plugsbee.jid;
  
  //Retrieves and handles folders from remote storage
  gRemote.getFolders(function(folders) {
    for (var i in folders) {

      var pbFolder = Plugsbee.handleFolder(folders[i]);
      gStorage.addFolder(pbFolder);

      //Retrieves and handles files from remote storage
      gRemote.getFiles(pbFolder, function(files) {
        for (var y in files) {

          var pbFile = Plugsbee.handleFile(files[y]);
          gStorage.addFile(pbFile);

        }
      });
    }
    //~ if(!Plugsbee.folders['trash']) {
      //~ var pbolder = Object.create(Plugsbee.Folder);
      //~ pbFolder.draw();
      //~ pbFolder.id = 'trash';
      //~ pbFolder.name = 'Trash';
      //~ 
      //~ gRemote.newFolder(pbFolder, function(pbFolder) {
        //~ console.log(pbFolder);
        //~ //Thumbnail
        //~ pbFolder.thumbnail.elm = document.querySelector('.thumbnail.trash');
        //~ pbFolder.thumbnail.elm.hidden = false;
        //~ //Panel
        //~ pbFolder.panel.elm = document.querySelector('.panel.trash');
        //~ 
        //~ gStorage.addFolder(pbFolder);
      //~ });
    //~ }
  });
});
Plugsbee.connection.on('connecting', function() {
  console.log('connecting');
});
Plugsbee.connection.on('failure', function() {
  console.log('failure');
  alert('Wrong login and/or password.');
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

Plugsbee.upload = function(aDOMFile, aFolder, onSuccess, onProgress, onError) {
	var id = Math.random().toString().split('.')[1];
  var pbFile = Object.create(Plugsbee.File);

  
  pbFile.folder = aFolder;
  pbFile.draw();
  pbFile.id = id;
  pbFile.name = aDOMFile.name;
  pbFile.type = aDOMFile.type;

  pbFile.file = aDOMFile;

  gInterface.handleFile(pbFile);

	var fd = new FormData;
	fd.append(aFolder.id + '/' + id, aDOMFile);
	
	var xhr = new XMLHttpRequest();

	xhr.upload.addEventListener("progress",
		function(evt) {
			var progression = (evt.loaded/evt.total)*100;
      pbFile.thumbnail.label = Math.round(progression)+'%'
		}, false
	);
	
  
	xhr.addEventListener("load",
		function(evt) {
			var answer = JSON.parse(xhr.responseText);
			pbFile._fileURL = answer.src;
  
      pbFile.thumbnail.draggable = true;
      pbFile.thumbnail.label = pbFile.name;
      
      Plugsbee.files[pbFile.id] = pbFile;
      aFolder.files[pbFile.id] = pbFile;
      gRemote.newFile(pbFile);
      gStorage.addFile(pbFile);
		}, false
	);

	xhr.open('POST', gConfiguration.uploadService);
	xhr.send(fd);
}
