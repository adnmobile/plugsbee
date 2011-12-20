'use strict';

var Widget = {};

var Plugsbee = {
	folders: {},
	files: {},
	contacts: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService)
};
Plugsbee.connection.on('connected', function() {
	//Create a contact for the user
	//~ var user = Object.create(Plugsbee.Contact);
	//~ user.jid = Plugsbee.connection.jid;
	//~ Plugsbee.user = user;
  console.log('connected');
	Plugsbee.getFolders();
});
Plugsbee.connection.on('XMLInput', function(data) {
	//~ var elm = microjungle([
		//~ ['pre', {class: "prettyprint in"}]
	//~ ]);
	//~ elm.textContent = formatXML(data);
	//~ document.getElementById('console').querySelector('div').appendChild(elm);
	//FIXME
	//~ prettyPrint();
});
Plugsbee.connection.on('XMLOutput', function(data) {
	//~ var elm = microjungle([
		//~ ['pre', {class: "prettyprint out"}]
	//~ ]);
	//~ elm.textContent = formatXML(data);
	//~ document.getElementById('console').querySelector('div').appendChild(elm);
	//FIXME
	//~ prettyPrint();
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

	var widget = new Widget.File();
	widget.label = file.name;
	widget.id = jid;
	widget.elm = aFolder.widget.panel.insertBefore(widget.elm, aFolder.widget.panel.lastChild);
	file.widget = widget;

	var fd = new FormData;
	fd.append(jid, aDOMFile);
	
	var xhr = new XMLHttpRequest();

	xhr.upload.addEventListener("progress",
		function(evt) {
			var progression = (evt.loaded/evt.total)*100;
      console.log(progression);
			if(onProgress)
				onProgress(file, progression);
		}, false
	);
	
	var that = this;
	xhr.addEventListener("load",
		function(evt) {
			var answer = JSON.parse(xhr.responseText);
			file.src = answer.src;
			file.widget.src = file.src;
			if(answer.thumbnail) {
				file.thumbnail = answer.thumbnail;
				file.widget.thumbnail = file.thumbnail;
			}
			file.widget.type = file.type;
			file.widget.href = '/'+file.folder.name+'/'+file.name;
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
	if(aFile.thumbnail)
		var entry = "<entry xmlns='http://www.w3.org/2005/Atom'><title>"+aFile.name+"</title><content src='"+aFile.src+"' type='"+aFile.type+"'/><link rel='preview' type='image/png' href='"+aFile.thumbnail+"'/></entry>";
	else
		var entry = "<entry xmlns='http://www.w3.org/2005/Atom'><title>"+aFile.name+"</title><content src='"+aFile.src+"' type='"+aFile.type+"'/></entry>";
	var that = this;
	
	Lightstring.pubsubPublish(this.connection, aFile.folder.server, aFile.folder.node, entry, aFile.id, function(err, answer) {
		if(err)
			return;

		aFile.folder.counter++
		aFile.folder.widget.counter = aFile.folder.counter;
		aFile.widget.deletable = true;
		aFile.widget.elm.addEventListener('delete', function() {
			aFile.widget.elm.parentNode.removeChild(aFile.widget.elm);
			that.deleteFile(aFile);
		});
	});
};
Plugsbee.createFolder = function (aName, aAccessmodel, onSuccess) {
	var id = Math.random().toString().split('.')[1];
	var fields = [];
	
	fields.push("<field var='pubsub#title'><value>"+aName+"</value></field>");
	fields.push("<field var='pubsub#access_model'><value>"+aAccessmodel+"</value></field>");
	
	var that = this;
	Lightstring.pubsubCreate(this.connection, gConfiguration.PubSubService, id, fields, function(err) {
		if(err) {
			console.log('ERROR');
			return;
		}
		var folder = Object.create(Plugsbee.Folder);
		folder.jid = gConfiguration.PubSubService+"/"+id;
		folder.name = aName;
		folder.creator = Plugsbee.user.jid;
		folder.accessmodel = aAccessmodel;
		
		var widget = new Widget.Folder();
		widget.id = folder.jid;
		widget.label = folder.name;
		var parent = document.getElementById('folders-list');
		widget.elm = parent.insertBefore(widget.elm, parent.querySelector('#newfolder'));
		widget.deletable= true;
		widget.uploadable = true;
		widget.elm.addEventListener('delete', function() {
			this.parentNode.removeChild(this);
			that.deleteFolder(folder);
		});
		folder.widget = widget;
		widget.hidden = false;
		widget.uploadable = true;
		if(aAccessmodel === 'whitelist')
			widget.sharable = true;
		else
			widget.public = true;

		Plugsbee.folders[folder.jid] = folder;
		
		onSuccess(folder);
	});
}
Plugsbee.getFolderCreator = function(folder) {
	var that = this;
	Lightstring.discoInfo(this.connection, gConfiguration.PubSubService, folder.node, function(aCreator) {
		folder.creator = aCreator;
		if(folder.creator === Plugsbee.connection.jid) {
			var widget = new Widget.Folder();
			widget.id = folder.jid;
			widget.label = folder.name;
      
			var folders = document.getElementById('folders');
			widget.tab = folders.appendChild(widget.tab);
      
      var deck = document.getElementById('deck');
      widget.panel = deck.appendChild(widget.panel);
			//~ widget.elm.addEventListener('delete', function() {
				//~ this.parentNode.removeChild(this);
				//~ that.deleteFolder(folder);
			//~ });

			folder.widget = widget;

			Plugsbee.folders[folder.jid] = folder;
      that.getFiles(folder);
    }
	});
};
Plugsbee.getFolders = function() {
	var that = this;
	Lightstring.discoItems(this.connection, gConfiguration.PubSubService, function(items) {
		items.forEach(function(item) {
			
			var folder = Object.create(Plugsbee.Folder);
			folder.jid = item.jid+'/'+item.node;
			folder.name = item.name;

			that.getFolderCreator(folder);
		});
	});
};
Plugsbee.deleteFile = function(file) {
	Lightstring.pubsubRetract(this.connection, file.folder.server, file.folder.node, file.id);
};
Plugsbee.deleteFolder = function(folder) {
	Lightstring.pubsubDelete(this.connection, folder.server, folder.node);
};
Plugsbee.getFiles = function(folder) {
	var that = this;
	//Retrives nodes
	Lightstring.pubsubItems(this.connection, folder.server, folder.node, function(items) {
		items.forEach(function(item) {

			var file = Object.create(Plugsbee.File);
			file.jid = folder.jid+'/'+item.id
			file.name = item.name;
			file.type = item.type;
			file.src = item.src;
			if(item.thumbnail)
				file.thumbnail = item.thumbnail;
			file.id = item.id;
			file.folder = folder;

			var widget = new Widget.File();
			widget.id = file.jid;
			widget.label = file.name;
			widget.src = file.src;
			widget.type = file.type;
			if(file.thumbnail)
				widget.thumbnail = file.thumbnail;
			widget.type = file.type;
			widget.href = '/'+file.folder.name+'/'+file.name;
      var panel = folder.widget.panel;
      var dropbox = folder.widget.panel.querySelector('.file.upload');
			widget.elm = panel.insertBefore(widget.elm, dropbox);
			file.widget = widget;
			
			folder.files[file.jid] = file;
			folder.counter++
			folder.widget.counter = folder.counter;
			//~ if(folder.creator === Plugsbee.user.jid)
      widget.deletable = true;
				
			widget.elm.addEventListener('delete', function() {
				file.widget.elm.parentNode.removeChild(file.widget.elm);
				that.deleteFile(file);
			});
		});
	});
};
//~ Plugsbee.getUserProfile = function() {
	//~ var aTo = Plugsbee.user.jid;
	//~ var that = this;
	//~ Lightstring.getVcard(this.connection, aTo, function(vcard) {
		//~ if(!vcard)
			//~ return;
		//~ var FN = vcard.querySelector('FN');
		//~ if(FN) {
			//~ FN = FN.textContent;
			//~ document.getElementById("settings-form").elements["name"].value = FN;
		//~ }
		//~ var EMAIL = vcard.querySelector('USERID');
		//~ if(EMAIL) {
			//~ EMAIL = EMAIL.textContent;
			//~ document.getElementById("settings-form").elements["email"].value = EMAIL;
		//~ }
	//~ });

//
// Folder
//
Plugsbee.Folder = {
	_jid: '',
	node: '',
	counter: 0,
	name: '',
	creator: '',
	accessmodel: '',
	files: {},
	set jid(aJid) {
		this._jid = aJid;
		this.server = aJid.split('/')[0];
		this.node = aJid.split('/')[1];
	},
	get jid() {
		return this._jid;
	},
};
//
// File
//
Plugsbee.File = {
	_jid: '',
	id: '',
	node: '',
	server: '',
	name: '',
	type: '',
	src: '',
	folder: null,
	set jid(aJid) {
		this._jid = aJid;
		this.server = aJid.split('/')[0];
		this.node = aJid.split('/')[1];
		this.id = aJid.split('/')[2];
	},
	get jid() {
		return this._jid;
	},
};
