'use strict';

function shakeit() {
  var elms = document.querySelectorAll('.thumbnail');
  for (var i = 0; i < elms.length; i++) {
    if(elms[i].classList.contains('edit'))
      elms[i].classList.remove('edit');
    else
      elms[i].classList.add('edit');
    
  }
};

var Widget = {
  parser : new DOMParser(),
  parse: function(aStr) {
    return this.parser.parseFromString(aStr, "text/xml");
  }
};

var Plugsbee = {
	folders: {},
	files: {},
	contacts: {},
	connection: new Lightstring.Connection(gConfiguration.WebsocketService)
};
Plugsbee.connection.on('connected', function() {
  console.log('connected');
  Plugsbee.connection.user = Plugsbee.connection.jid.split('@')[0];
  Lightstring.presence(Plugsbee.connection, "0");
	Plugsbee.getFolders();
});
Plugsbee.connection.on('connecting', function() {
  console.log('connecting');
});
Plugsbee.connection.on('disconnecting', function() {
  console.log('disconnecting');
});
Plugsbee.connection.on('message', function(data) {

  if(data.firstChild.tagName !== 'event')
    return;
  
  //Folder deletion  
  if(data.firstChild.firstChild.tagName === 'delete')
    return;

  //Items retract
  if((data.firstChild.firstChild.tagName === 'items') && (data.firstChild.firstChild.firstChild.tagName === 'retract'))
    return;
    
  
  var service = data.getAttribute('from');
  var nodeid = data.querySelector('items').getAttribute('node');
  var folderjid = service+"/"+nodeid;
  
  var elm = data.querySelector('item');
  var itemid = elm.getAttribute('id');
  var filejid = folderjid+"/"+itemid;
  
  var folder = Plugsbee.folders[folderjid]
  
  //Return if the folder doesn't exist or if the file already exist
  if(!folder || folder.files[filejid])
    return;
  
  var item = {
    id: itemid,
    name: elm.querySelector('title').textContent,
    src: elm.querySelector('content').getAttribute('src'),
    type: elm.querySelector('content').getAttribute('type'),
  }
  var miniature = elm.querySelector('link');
  if(miniature)
    item.miniature = miniature.getAttribute('href');

  var file = Object.create(Plugsbee.File);
  file.jid = folder.jid+'/'+item.id
  file.name = item.name;
  file.type = item.type;
  file.src = item.src;
  if(!item.miniature)
    file.miniature = "themes/"+gConfiguration.theme+'/file.png';
  else
    file.miniature = item.miniature;
  file.id = item.id;
  file.folder = folder;


  var thumbnail = new Widget.Thumbnail();
  thumbnail.elm = folder.panel.append(thumbnail.elm);
  thumbnail.id = file.jid;
  thumbnail.label = file.name;
  thumbnail.miniature = file.miniature;
  thumbnail.href = file.folder.name+'/'+file.name;
  thumbnail.elm.classList.add('file');
  thumbnail.elm.addEventListener('click', function(evt) {
    if(window.location.protocol !== 'file:')
      history.pushState(null, null, this.href);
    gUserInterface.showFile(file);
    evt.preventDefault();
  });
  
  file.thumbnail = thumbnail;
  
  folder.files[file.jid] = file;
});
Plugsbee.connection.on('disconnected', function() {
  console.log('disconnected');
  //~ delete Plugsbee.folders;
  //~ delete Plugsbee.files;
  //~ delete Plugsbee.contacts;  
  //~ Plugsbee.connection = new Lightstring.Connection(gConfiguration.WebsocketService);
  //~ location.reload();
});
Plugsbee.connection.on('XMLInput', function(data) {
  //~ console.log('in: \n'+data);
	//~ var elm = microjungle([
		//~ ['pre', {class: "prettyprint in"}]
	//~ ]);
	//~ elm.textContent = formatXML(data);
	//~ document.getElementById('console').querySelector('div').appendChild(elm);
	//FIXME
	//~ prettyPrint();
});
Plugsbee.connection.on('XMLOutput', function(data) {
	//~ console.log('out: \n'+data);
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
        file.miniature = "themes/"+gConfiguration.theme+'/file.png';
  
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
	
	Lightstring.pubsubPublish(this.connection, aFile.folder.server, aFile.folder.node, entry, aFile.id, function(err, answer) {
		if(err)
			return;
    
    
		//~ aFile.widget.elm.addEventListener('delete', function() {
			//~ aFile.widget.elm.parentNode.removeChild(aFile.widget.elm);
			//~ that.deleteFile(aFile);
		//~ });
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
    folder.jid = gConfiguration.PubSubService+'/'+id;
    folder.name = aName;
		folder.creator = Plugsbee.connection.jid;
		folder.accessmodel = aAccessmodel;
    

    //Thumbnail widget
    var thumbnail = new Widget.Thumbnail();
    var folders = document.getElementById('folders');
    thumbnail.elm = folders.insertBefore(thumbnail.elm, folders.firstChild);
    thumbnail.jid = folder.jid;
    thumbnail.label = folder.name;
    thumbnail.href = folder.name;
    thumbnail.miniature = gUserInterface.themeFolder+'/'+'file.png';
    thumbnail.elm.classList.add('folder');

    //Panel widget
    var panel = new Widget.Panel();
    var deck = document.getElementById('deck');
    panel.elm = deck.appendChild(panel.elm);
    panel.id = folder.jid;

    //Makes the first element of the panel clickable
    panel.elm.firstChild.addEventListener('click', function() {
        gUserInterface.openFilePicker();
      });

    folder.panel = panel;
    folder.thumbnail = thumbnail;
    
      //~ widget.elm.addEventListener('delete', function() {
      //~ this.parentNode.removeChild(this);
      //~ that.deleteFolder(folder);
    //~ });  
  
    // BUG iOS
    folder.thumbnail.elm.addEventListener('touchstart', function() {});
    folder.thumbnail.elm.addEventListener('click', function(e) {
      gUserInterface.showFolder(folder);
      if(window.location.protocol !== 'file:')
        history.pushState(null, null, this.href);
      e.preventDefault();
    });

    Plugsbee.folders[folder.jid] = folder;

    if(onSuccess)
      onSuccess(folder);
	});
}
Plugsbee.getFolderCreator = function(folder) {
	var that = this;
	Lightstring.discoInfo(this.connection, gConfiguration.PubSubService, folder.node, function(aCreator) {
		if(aCreator !== Plugsbee.connection.jid) {
      delete Plugsbee.Folder[folder.jid];
      return;
    }

    folder.creator = aCreator;
    
    //Thumbnail widget
    var thumbnail = new Widget.Thumbnail();
    var folders = document.getElementById('folders');
    thumbnail.elm = folders.insertBefore(thumbnail.elm, folders.firstChild);
    thumbnail.jid = folder.jid;
    thumbnail.label = folder.name;
    thumbnail.href = folder.name;
    thumbnail.miniature = gUserInterface.themeFolder+'/'+'file.png';
    thumbnail.elm.classList.add('folder');

    //Panel widget
    var panel = new Widget.Panel();
    var deck = document.getElementById('deck');
    panel.elm = deck.appendChild(panel.elm);
    panel.jid = folder.jid;

    //Makes the first element of the panel clickable
    panel.elm.firstChild.addEventListener('click', function() {
        gUserInterface.openFilePicker();
      });

    folder.panel = panel;
    folder.thumbnail = thumbnail;
    
      //~ widget.elm.addEventListener('delete', function() {
      //~ this.parentNode.removeChild(this);
      //~ that.deleteFolder(folder);
    //~ });  
  
    // BUG iOS
    folder.thumbnail.elm.addEventListener('touchstart', function() {});
    folder.thumbnail.elm.addEventListener('click', function(e) {
      gUserInterface.showFolder(folder);
      if(window.location.protocol !== 'file:')
        history.pushState(null, null, this.href);
      e.preventDefault();
    });

    Plugsbee.folders[folder.jid] = folder;
    that.getFiles(folder);

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
  var elms = document.querySelectorAll('[data-jid="'+file.jid+'"]');
  for(var i = 0; i < elms.length; i++) {
    elms[i].parentNode.removeChild(elms[i]);
  }
	Lightstring.pubsubRetract(this.connection, file.folder.server, file.folder.node, file.id);
};
Plugsbee.deleteFolder = function(folder) {
  var elms = document.querySelectorAll('[data-jid="'+folder.jid+'"]');
  for(var i = 0; i < elms.length; i++) {
    elms[i].parentNode.removeChild(elms[i]);
  }
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
			if(!item.miniature)
        file.miniature = "themes/"+gConfiguration.theme+'/file.png';
      else
        file.miniature = item.miniature;
			file.id = item.id;
			file.folder = folder;


      var thumbnail = new Widget.Thumbnail();
      thumbnail.elm = folder.panel.append(thumbnail.elm);
      thumbnail.jid = file.jid;
      thumbnail.label = file.name;
      thumbnail.miniature = file.miniature;
      thumbnail.href = file.folder.name+'/'+file.name;
      thumbnail.elm.classList.add('file');
      thumbnail.elm.addEventListener('click', function(evt) {
        if(window.location.protocol !== 'file:')
          history.pushState(null, null, this.href);
        gUserInterface.showFile(file);
        evt.preventDefault();
      });
			
			file.thumbnail = thumbnail;
			
      Plugsbee.files[file.jid] = file;
			folder.files[file.jid] = file;
		});
	});
};
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
