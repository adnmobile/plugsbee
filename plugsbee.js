'use strict';

var Plugsbee = {
	folders: {},
	files: {},
	contacts: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService)
};

Plugsbee.connection.load('DIGEST-MD5');
Plugsbee.connection.load('events');
Plugsbee.connection.load('presence');
Plugsbee.connection.load('dataforms');
Plugsbee.connection.load('disco');
Plugsbee.connection.load('pubsub');

var password = localStorage.getItem('password');
var login = localStorage.getItem('login');
if(password && login)
  Plugsbee.connection.connect(login, password);

Plugsbee.connection.on('connected', function() {
  console.log('connected');
  Plugsbee.connection.presence.send({priority: '0'});
  Plugsbee.connection.user = Plugsbee.connection.jid.node;
	Plugsbee.getFolders();
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
Plugsbee.connection.on('input', function(stanza) {
  var elm = document.createElement('pre');
  elm.classList.add('in');
  elm.appendChild(document.createElement('code'));
  elm.firstChild.textContent = vkbeautify(stanza.XML, 'xml');
  //~ elm.innerHTML = prettyPrintOne(elm.firstChild.outerHTML);
  document.getElementById('xmpp-console').appendChild(elm);
});
Plugsbee.connection.on('output', function(stanza) {
  var elm = document.createElement('pre');
  elm.classList.add('out');
  elm.appendChild(document.createElement('code'));
  elm.firstChild.textContent = vkbeautify(stanza.XML, 'xml');
  //~ elm.innerHTML = prettyPrintOne(elm.firstChild.outerHTML);
  document.getElementById('xmpp-console').appendChild(elm);
});
Plugsbee.upload = function(aDOMFile, aFolder, onSuccess, onProgress, onError) {
	var id = Math.random().toString().split('.')[1];
	var jid = aFolder.jid+'/'+id;

	var file = Object.call(Plugsbee.File);
	file.jid = jid;
	file.id = id;
	file.name = aDOMFile.name;
	file.type = aDOMFile.type;
	file.folder = aFolder;
	aFolder.files[jid] = file;


  var thumbnail = new Widget.Thumbnail();
  thumbnail.elm = file.folder.panel.elm.insertBefore(thumbnail.elm, file.folder.panel.elm.firstChild);
  thumbnail.id = file.jid;
  thumbnail.label = file.name;
  thumbnail.elm.classList.add('file');
  var progress = document.createElement('progress');
  progress.setAttribute('max', '100');
  progress.setAttribute('value', '0');
  var span = document.createElement('span');
  
  var img = thumbnail.elm.querySelector('img');
  img.hidden = true;
  thumbnail.elm.querySelector('div.miniature').appendChild(span);
  thumbnail.elm.querySelector('div.miniature').appendChild(progress);
  
  file.thumbnail = thumbnail;
  
	var fd = new FormData;
	fd.append(jid, aDOMFile);
	
	var xhr = new XMLHttpRequest();

	xhr.upload.addEventListener("progress",
		function(evt) {
			var progression = (evt.loaded/evt.total)*100;
      thumbnail.elm.querySelector('progress').setAttribute('value', progression);
      thumbnail.elm.querySelector('span').textContent = Math.round(progression)+'%';
      //~ console.log(progression);
			//~ if(onProgress)
				//~ onProgress(file, progression);
		}, false
	);
	
	var that = this;
	xhr.addEventListener("load",
		function(evt) {
			var answer = JSON.parse(xhr.responseText);
			file.src = answer.src;
			if(answer.thumbnail)
				file.miniature = answer.thumbnail;
      else
        file.miniature = gConfiguration.themeFolder+'/file.png';
  
      file.thumbnail.miniature = file.miniature;
      file.thumbnail.elm.querySelector('span').hidden = true;
      file.thumbnail.elm.querySelector('progress').hidden = true;
      file.thumbnail.elm.querySelector('img').hidden = false;
			file.thumbnail.elm.href = file.folder.name+'/'+file.name;
      file.thumbnail.elm.addEventListener('click', function(evt) {
        if(window.location.protocol !== 'file:')
          history.pushState(null, null, this.href);
        gUserInterface.showFile(file);
        evt.preventDefault();
      });
			that.addFile(file, onSuccess);
		}, false
	);
	//~ xhr.addEventListener("loadstart",
		//~ function(evt) {
			//~ console.log('start');
			//~ if(onStart)
				//~ onStart(file);
		//~ }, false
	//~ ); 
	//~ xhr.upload.addEventListener("loadend", test, false);
	//~ xhr.upload.addEventListener("error", test, false);  
	//~ xhr.upload.addEventListener("abort", test, false);
	//~ xhr.addEventListener("progress", test2, false); 
	//~ xhr.addEventListener("loadend", test2, false);
	//~ xhr.addEventListener("load", test2, false);  
	//~ xhr.addEventListener("error", test2, false);  
	//~ xhr.addEventListener("abort", test2, false);
	
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
	
  this.connection.send(Lightstring.stanza.pubsub.config(gConfiguration.PubSubService, aFolder.nodeId, fields));
}; 
Plugsbee.renameFile = function(aFile) {
  this.addFile(aFile);
  aFile.thumbnail.label = aFile.name;
}; 
Plugsbee.createFolder = function(aName, aAccessmodel, onSuccess, aId) {
  if(aId)
    var id = aId;
  else
    var id = Math.random().toString().split('.')[1];
	var fields = [];
	
	fields.push("<field var='pubsub#title'><value>"+aName+"</value></field>");
	fields.push("<field var='pubsub#access_model'><value>"+aAccessmodel+"</value></field>");
	
	var that = this;
  Plugsbee.connection.pubsub.create(gConfiguration.PubSubService, id, fields, function() {
    
    var folder = new Plugsbee.Folder();
    folder.jid = gConfiguration.PubSubService+'/'+id;
    Plugsbee.folders[folder.jid] = folder;
    folder.name = aName;
		folder.creator = Plugsbee.connection.jid;
		folder.accessmodel = aAccessmodel;

    if(onSuccess)
      onSuccess(folder);
	});
}
Plugsbee.getFolders = function() {
	var that = this;
  Plugsbee.connection.disco.items(gConfiguration.PubSubService, function(stanza) {
    var items = stanza.items;
		items.forEach(function(item) {
      var folder = new Plugsbee.Folder();
      //Trash folder
      if(item.node === btoa(Plugsbee.connection.jid.bare+'-trash')) {
        folder.trash = true;
        Plugsbee.trash = folder;
        //Thumbnail
        folder.thumbnail.elm = document.querySelector('.thumbnail.trash');
        //Panel
        folder.panel.elm = document.querySelector('.panel.trash');
        folder.jid = item.jid + '/' + item.node;
        folder.host = item.jid;
        folder.id = item.node;
      }
      //Normal folder
      else {
        folder.jid = item.jid + '/' + item.node;
        folder.host = item.jid;
        folder.id = item.node;
        folder.miniature = gUserInterface.themeFolder+'folder.png';
        
        gUserInterface.handleFolder(folder);
        //Thumbnail
        var folders = document.getElementById('folders');
        folder.thumbnail.elm = folders.insertBefore(folder.thumbnail.elm, document.getElementById('folder-adder'));
        //Panel
        var deck = document.getElementById('deck');
        folder.panel.elm = deck.appendChild(folder.panel.elm);
      }
      folder.name = item.name;
      Plugsbee.folders[folder.jid] = folder;
      Plugsbee.getFiles(folder);
		});
    if(!Plugsbee.trash) {
      Plugsbee.createFolder('Trash', 'whitelist', function(item) {
        var folder = Object.create(Plugsbee.Folder);
        folder.jid = item.server + '/' + item.node;
        folder.host = item.server;
        folder.id = item.node;

        Plugsbee.folders[folder.jid] = folder;
        folder.name = item.name;
        folder.trash = true;
        Plugsbee.trash = folder;
        gUserInterface.handleFolder(folder);
        Plugsbee.getFiles(folder);
      }, btoa(Plugsbee.connection.jid.bare+'-trash'));
    }
	});
};
Plugsbee.moveFile = function(file, newFolder) {
  Plugsbee.deleteFile(file);
  delete Plugsbee.folders[file.folder.jid].files[file.jid];
  delete Plugsbee.files[file.jid];

  file.folder = newFolder;
  var id = Math.random().toString().split('.')[1];
  file.id = id;

  file.thumbnail.elm = newFolder.panel.elm.appendChild(file.thumbnail.elm);
  
  Plugsbee.addFile(file);
  Plugsbee.files[file.jid] = file;
  Plugsbee.folders[file.folder.jid].files[file.jid] = file;
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
Plugsbee.getFiles = function(folder) {
	Plugsbee.connection.pubsub.items(folder.host, folder.id, function(stanza) {
    var items = stanza.items;
		items.forEach(function(item) {
			var file = new Plugsbee.File();
      file.folder = folder;
      file.id = item.id;
      file.jid = folder.jid + '/' + item.id;

			file.name = item.name;
			file.type = item.type;
			file.src = item.src;
			if(!item.miniature)
        file.miniature = gConfiguration.themeFolder+'file.png';
      else
        file.miniature = item.miniature;

      file.thumbnail.elm = folder.panel.append(file.thumbnail.elm);
      //~ thumbnail.draggable = true;

      Plugsbee.files[file.jid] = file;
			folder.files[file.jid] = file;
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
