'use strict';

var Plugsbee = {
	folders: {},
	files: {},
	contacts: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService)
};

Plugsbee.connection.load('PLAIN');
Plugsbee.connection.load('events');
Plugsbee.connection.load('presence');
Plugsbee.connection.load('dataforms');
Plugsbee.connection.load('disco');
Plugsbee.connection.load('pubsub');

var password = localStorage.getItem('password');
var login = localStorage.getItem('login');
if(password && login) {
  Plugsbee.jid = login;
  Plugsbee.connection.connect(login, password);
}

Plugsbee.connection.on('connected', function() {
  console.log('connected');
  Plugsbee.connection.presence.send({priority: '0'});
  Plugsbee.connection.user = Plugsbee.connection.jid.node;
	Plugsbee.getFolders();
  if (gConfiguration.PubSubService === 'PEP')
    gConfiguration.PubSubService = Plugsbee.jid;
  gUserInterface.showFolders();
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
	var jid = aFolder.jid+'/'+id;

	var file = new Plugsbee.File();
	file.jid = jid;
	file.id = id;
	file.name = aDOMFile.name;
	file.type = aDOMFile.type;
	file.folder = aFolder;
	aFolder.files[id] = file;
	Plugsbee.files[id] = file;

  var div = document.createElement('div');
  div.classList.add('miniature');
  var span = document.createElement('span');
  span.textContent = '0%';
  var progress = document.createElement('progress');
  progress.value = '0';
  progress.max = '100';
  span = div.appendChild(span);
  progress = div.appendChild(progress);
  file.thumbnail.miniature = div;
  
  var panel = aFolder.panel.elm;
  file.thumbnail.elm = panel.insertBefore(file.thumbnail.elm, panel.firstChild);
  
	var fd = new FormData;
	fd.append(jid, aDOMFile);
	
	var xhr = new XMLHttpRequest();

	xhr.upload.addEventListener("progress",
		function(evt) {
			var progression = (evt.loaded/evt.total)*100;
      progress.value = progression;
      span.textContent = Math.round(progression)+'%';
		}, false
	);
	
	xhr.addEventListener("load",
		function(evt) {
			var answer = JSON.parse(xhr.responseText);
			file.src = answer.src;
			if(answer.thumbnail)
				file.miniature = answer.thumbnail;
      else
        file.miniature = gConfiguration.themeFolder+'/file.png';
  
      file.draggable = true;
			file.thumbnail.href = file.folder.name+'/'+file.name;
			Plugsbee.addFile(file, onSuccess);
		}, false
	);

	xhr.open('POST', gConfiguration.uploadService);
	xhr.send(fd);
}
Plugsbee.addFile = function(aFile, onSuccess) {
	if(aFile.miniature)
		var entry = "<entry xmlns='http://www.w3.org/2005/Atom'><title>"+aFile.name+"</title><content src='"+aFile.src+"' type='"+aFile.type+"'/><link rel='preview' type='image/png' href='"+aFile.miniature+"'/></entry>";
	else
		var entry = "<entry xmlns='http://www.w3.org/2005/Atom'><title>"+aFile.name+"</title><content src='"+aFile.src+"' type='"+aFile.type+"'/></entry>";
	var that = this;
	
	Plugsbee.connection.pubsub.publish(aFile.folder.host, aFile.folder.id, entry, aFile.id);
};
Plugsbee.renameFolder = function(aFolder, aNewName) {
  aFolder.name = aNewName;
	var fields = [];
	aFolder.thumbnail.label = aFolder.name;
	fields.push("<field var='pubsub#title'><value>"+aNewName+"</value></field>");
	
  Plugsbee.connection.pubsub.configure(gConfiguration.PubSubService, aFolder.id, fields);
  //Updates href
  for (var i in aFolder.files)
    aFolder.files[i].name = aFolder.files[i].name;
}; 
Plugsbee.renameFile = function(aFile) {
  this.addFile(aFile);
}; 
Plugsbee.createFolder = function(aName, aAccessmodel, onSuccess, aId) {
  if(aId)
    var id = aId;
  else
    var id = 'urn:plugsbee:folder:'+Math.random().toString().split('.')[1];
    
	var fields = [];
	
	fields.push("<field var='pubsub#title'><value>"+aName+"</value></field>");
	fields.push("<field var='pubsub#access_model'><value>"+aAccessmodel+"</value></field>");
	fields.push("<field var='pubsub#persist_items'><value>1</value></field>");

  
	var that = this;
  
  Plugsbee.connection.pubsub.create(gConfiguration.PubSubService, id, fields, function() {
    
    var folder = new Plugsbee.Folder();
    folder.id = id;
    Plugsbee.folders[folder.id] = folder;
    folder.miniature = gUserInterface.themeFolder+'folder.png';
    folder.name = aName;
    folder.host = gConfiguration.PubSubService;
		//~ folder.creator = Plugsbee.jid;
		//~ folder.accessmodel = aAccessmodel;

    if(onSuccess)
      onSuccess(folder);
	});
}
Plugsbee.getFolders = function() {
	var that = this;
  Plugsbee.connection.disco.items(this.connection.jid.bare, function(stanza) {
    var items = stanza.items;
		items.forEach(function(item) {
      if (!item.node.match('urn:plugsbee:folder:'))
        return;

      var folder = new Plugsbee.Folder();
      folder.id = item.node;
      folder.host = item.jid;
      //Trash folder
      if(folder.id === 'urn:plugsbee:folder:trash') {
        folder.trash = true;
        Plugsbee.trash = folder;
        //Thumbnail
        folder.thumbnail.elm = document.querySelector('.thumbnail.trash');
        //Panel
        folder.panel.elm = document.querySelector('.panel.trash');
        
        folder.name = item.name;
        folder.thumbnail.href = 'trash';
      }
      //Normal folder
      else {
        folder.miniature = gUserInterface.themeFolder+'folder.png';
        gUserInterface.handleFolder(folder);

        //Thumbnail
        var folders = document.getElementById('folders');
        folder.thumbnail.elm = folders.insertBefore(folder.thumbnail.elm, folders.firstChild);
        //Panel
        var deck = document.getElementById('deck');
        folder.panel.elm = deck.appendChild(folder.panel.elm);
        
        folder.name = item.name;
      }
      Plugsbee.folders[folder.id] = folder;
      Plugsbee.getFiles(folder);
		});
    if(!Plugsbee.trash) {
      Plugsbee.createFolder('Trash', 'whitelist', function(item) {
        var folder = new Plugsbee.Folder();
        folder.id = item.node;
        folder.host = item.jid;
        Plugsbee.folders[folder.id] = folder;
        folder.trash = true;
        Plugsbee.trash = folder;

        //Thumbnail
        folder.thumbnail.elm = document.querySelector('.thumbnail.trash');
        //Panel
        folder.panel.elm = document.querySelector('.panel.trash');
        folder.name = 'Trash';
        folder.thumbnail.href = 'trash';

      }, 'urn:plugsbee:folder:trash');
    }
	});
};
Plugsbee.moveFile = function(file, newFolder) {
  Plugsbee.deleteFile(file);
  delete Plugsbee.folders[file.folder.id].files[file.id];
  delete Plugsbee.files[file.id];

  file.folder = newFolder;
  var id = Math.random().toString().split('.')[1];
  file.id = id;

  var panel = file.folder.panel.elm;
  file.thumbnail.elm = panel.insertBefore(file.thumbnail.elm, panel.firstChild);
  
  Plugsbee.addFile(file);
  Plugsbee.files[file.id] = file;
  Plugsbee.folders[file.folder.id].files[file.id] = file;
};
Plugsbee.deleteFile = function(file) {
  file.thumbnail.elm.parentNode.removeChild(file.thumbnail.elm);
  Plugsbee.connection.pubsub.retract(file.folder.host, file.folder.id, file.id);
};
Plugsbee.deleteFolder = function(folder) {
  folder.thumbnail.elm.parentNode.removeChild(folder.thumbnail.elm);
  folder.panel.elm.parentNode.removeChild(folder.panel.elm);
	Plugsbee.connection.pubsub['delete'](folder.host, folder.id);
};
Plugsbee.purgeFolder = function(aFolder) {
	Plugsbee.connection.pubsub.purge(aFolder.host, aFolder.id);
};
Plugsbee.getFiles = function(folder) {
	Plugsbee.connection.pubsub.items(folder.host, folder.id, function(stanza) {
    var items = stanza.items;
		items.forEach(function(item) {
			var file = new Plugsbee.File();
      file.folder = folder;
      file.id = item.id;

			file.name = item.name;
			file.type = item.type;
			file.src = item.src;
			if(!item.miniature)
        file.miniature = gConfiguration.themeFolder+'file.png';
      else
        file.miniature = item.miniature;

      gUserInterface.handleFile(file);
      //~ thumbnail.draggable = true;

      Plugsbee.files[file.id] = file;
			folder.files[file.id] = file;
		});
	});
};
//~ Plugsbee.getFolderCreator = function(folder) {
	//~ var that = this;
	//~ Plugsbee.connection.disco.info(gConfiguration.PubSubService, folder.node, function(stanza) {
    //~ var creator = '';
    //~ stanza.fields.fields.forEach(function(field) {
      //~ if (field['var'] === 'pubsub#creator')
        //~ creator = field.values[0];
    //~ });

		//~ if (creator !== Plugsbee.connection.jid.bare) {
      //~ delete Plugsbee.Folder[folder.jid];
      //~ return;
    //~ }

    //~ folder.creator = creator;
//~ 
	//~ });
//~ };
