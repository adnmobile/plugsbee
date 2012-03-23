'use strict';

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

Plugsbee.connection.load('PLAIN');
Plugsbee.connection.load('events');
Plugsbee.connection.load('presence');
Plugsbee.connection.load('dataforms');
Plugsbee.connection.load('disco');
Plugsbee.connection.load('pubsub');

context.network.onLine = false;


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
    var pbFolders = Plugsbee.storage.getFolders();
    for (var i in pbFolders) {

      Plugsbee.folders[pbFolders[i].id] = pbFolders[i];
      Plugsbee.layout.drawFolder(pbFolders[i]);

      //Retrieves and handles files from storage
      var pbFiles = Plugsbee.storage.getFiles(pbFolders[i]);
      for (var y in pbFiles) {

        var folder = Plugsbee.folders[pbFiles[y].folderId];
        folder.files[pbFiles[y].id] = pbFiles[y];
        pbFiles[y].folder = folder;
        
        Plugsbee.layout.drawFile(pbFiles[y]);
        Plugsbee.files[pbFiles[y].id] = pbFiles[y];
        
        if (pbFiles[y].miniatureDataURI)
          Plugsbee.layout.setFileMiniature(pbFiles[y], pbFiles[y].miniatureDataURI);

      }
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
  Plugsbee.remote.getFolders(function(pbFolders) {
    for (var i in pbFolders) {

      Plugsbee.folders[pbFolders[i].id] = pbFolders[i];
      Plugsbee.layout.drawFolder(pbFolders[i]);
      Plugsbee.storage.addFolder(pbFolders[i]);


      //Retrieves and handles files from remote storage
      Plugsbee.remote.getFiles(pbFolders[i], function(pbFiles) {
        for (var y in pbFiles) {

          var folder = Plugsbee.folders[pbFiles[y].folderId];
          folder.files[pbFiles[y].id] = pbFiles[y];
          pbFiles[y].folder = folder;

          Plugsbee.layout.drawFile(pbFiles[y]);
          Plugsbee.storage.addFile(pbFiles[y]);
          Plugsbee.files[pbFiles[y].id] = pbFiles[y];

          pbFiles[y].handleMedia();

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


  pbFile.name = aDOMFile.name;
  pbFile.folder = aFolder;
  pbFile.id = id;
  pbFile.type = aDOMFile.type;
  
  Plugsbee.media.getMiniature(aDOMFile, function(canvas) {
    Plugsbee.layout.setFileMiniature(pbFile, canvas);
    pbFile.miniatureDataURI = canvas.toDataURL();
    Plugsbee.storage.addFile(pbFile);
  });

  Plugsbee.layout.drawFile(pbFile);

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
			pbFile.fileURL = answer.src;

      pbFile.thumbnail.draggable = true;
      pbFile.thumbnail.label = pbFile.name;

      Plugsbee.files[pbFile.id] = pbFile;
      aFolder.files[pbFile.id] = pbFile;
      Plugsbee.remote.newFile(pbFile);
      Plugsbee.storage.addFile(pbFile);
		}, false
	);

	xhr.open('POST', gConfiguration.uploadService);
	xhr.send(fd);
}
