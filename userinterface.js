'use strict';



var gUserInterface = {
  toggleXMPPConsole: function() {
    var elm = document.getElementById('xmpp-console');
    elm.hidden = !elm.hidden;
  },
  elm: {},
  currentFolder: {},
  currentFile: {},
  themeFolder : 'themes/'+gConfiguration.theme+'/',
	init: function(e) {
    
    //Avoid the loading of the page to fire a popstate event (webkit)
    window.setTimeout(function() {
      window.addEventListener("popstate",
        function() {
          var node = [];
          if (location.protocol === 'file:') {
            var hash = location.hash.split('#')[1];
            if(hash) {
              var split = hash.split('/');
              if(split)
                node = split;
              else
                node.push(hash);
            }
          }
          else {
            var split = location.pathname.split('/');
            node.push(split[1]);
            if (split[2])
              node.push(split[2]);
          }
          Router.route(node);
        }, false
      );
    }, 0);
    
    //
    //Deck
    //
    (function() {
      
      var deck = Object.create(SWDeck);
      deck.rootElement = document.getElementById('deck');
      gUserInterface.deck = deck;
      
    })();
    
    
    //
    //Title
    //
    (function() {
      
      var contextTitle = new Widget.Editabletext();
      contextTitle.value = gConfiguration.name;

      contextTitle.elm = document.querySelector('.center').appendChild(contextTitle.elm);


      gUserInterface.contextTitle = contextTitle;
    })();

    //
    //Navigation button
    //
    var navButton = {
      setHref: function(aHref) {
        if(location.protocol === 'file:')
          aHref = '#'+aHref
          
        this.elm.href = aHref;
      }
    };
    navButton.elm = document.createElement('a');
    navButton.elm.id = 'nav-button';
    navButton.elm.hidden = true;
    navButton.elm.textContent = 'Account';
    navButton.elm.onclick = function(e) {
      if(location.protocol === 'file:')
        return;
      e.preventDefault();
      history.pushState(null, null, this.href);
      var event = document.createEvent('Event');
      event.initEvent('popstate', true, true);
      window.dispatchEvent(event);
    };
    navButton.elm = document.querySelector('div.left').appendChild(navButton.elm);
    this.navButton = navButton;

    //
    //Folder adder
    //
    var folderAdder = document.createElement('button');
    folderAdder.id = "folder-adder";
    folderAdder.textContent = "New folder";
    folderAdder.setAttribute('data-require', "network");
    folderAdder.hidden = true;
    folderAdder.addEventListener('click', gUserInterface.addFolder); 
    //~ var input =  folderAdder.form.querySelector('input');
    //~ folderAdder.elm.onclick = function(aEvent) {
      //~ folderAdder.edit = true;
      //Workaround, the autofocus attribute doesn't works on Firefox (see thumbnail.js)
      //~ folderAdder.form.querySelector('input').focus();
    //~ };
    //~ folderAdder.form.onsubmit = function(aEvent) {
      //~ Plugsbee.createFolder(input.value, 'whitelist', function(folder) {
        //~ gUserInterface.handleFolder(folder);
      //~ });
      //~ folderAdder.edit = false;
      //~ input.value = '';
      //~ return false;
    //~ }
    //~ input.onblur = function(aEvent) {
      //~ folderAdder.edit = false;
      //~ input.value = '';
      //~ return false;
    //~ }
    //~ folderAdder.elm = document.getElementById('folders').appendChild(folderAdder.elm);
    this.folderAdder = document.querySelector('div.right').appendChild(folderAdder);

    //
    //Upload button
    //
    var uploadButton = document.createElement('button');
    uploadButton.id = "upload-button";
    uploadButton.textContent = "Add file";
    uploadButton.hidden = true;
    uploadButton.setAttribute('data-require', "network");
    uploadButton.addEventListener('click', gUserInterface.openFilePicker);  
    this.uploadButton = document.querySelector('div.right').appendChild(uploadButton);

    //
    //Empty trash
    //
    var emptyTrashButton = document.createElement('button');
    emptyTrashButton.id = "empty-trash";
    emptyTrashButton.textContent = "Empty trash";
    emptyTrashButton.hidden = true;
    emptyTrashButton.setAttribute('data-require', "network");
    emptyTrashButton.addEventListener('click', function(){
      gUserInterface.emptyTrash();
    });  
    this.emptyTrashButton = document.querySelector('div.right').appendChild(emptyTrashButton);

    //
    //Trash
    //
    (function() {
      //Thumbnail
      var trash = new Widget.Thumbnail();
      trash.draggable = false;
      trash.elm.hidden = true;
      trash.label = 'Trash';
      trash.elm.setAttribute('data-id', 'trash');
      trash.href = 'trash';
      trash.miniature = gUserInterface.themeFolder + 'trash.png';
      trash.elm.classList.add('trash');
      trash.elm.addEventListener('dragenter', function(evt) {
        this.classList.add('dragenter');
      });
      trash.elm.addEventListener('dragover', function(evt) {
        this.classList.add('dragenter');
        evt.preventDefault()
      });
      trash.elm.addEventListener('dragleave', function(evt) {
        this.classList.remove('dragenter');
      });
      trash.elm.addEventListener('drop', function(evt) {
        console.log('toto');
        evt.preventDefault();
        console.log('titi');
        this.classList.remove('dragenter');
        var id = evt.dataTransfer.getData('text/plain');
        if (!id)
          return;

        var file = Plugsbee.files[id];
        var folder = Plugsbee.folders[id];
        
        
        if (folder) {
          for (var i in folder.files)
            folder.files[i].move(Plugsbee.folders['trash']);
          gStorage.deleteFolder(folder);
          gRemote.deleteFolder(folder);
          gInterface.eraseFolder(folder);
          delete Plugsbee.folders[folder.id];
        }
        else if (file) {
          file.move(Plugsbee.folders['trash']);
          document.getElementById('dock').hidden = true;
        }
      });
      trash.elm = document.getElementById('folders').appendChild(trash.elm);
      //Panel
      var panel = new Widget.Panel();
      panel.elm.classList.add('trash');
      panel.elm.setAttribute('data-name', 'trash');
      panel.hidden = true;
      panel.elm.firstChild.hidden = true;
      panel.elm = document.getElementById('deck').appendChild(panel.elm);
    })();

    //
    //File picker
    //
    var filePicker = document.getElementById('file-picker');
    filePicker.addEventListener('change', function upload(evt) {
      var file = evt.target.files[0];

      var folder = gUserInterface.currentFolder;

      Plugsbee.upload(file, folder);
    });

    //
    //XMPP Console
    //
    Plugsbee.connection.on('input', function(stanza) {
      var elm = document.createElement('pre');
      elm.classList.add('in');
      elm.appendChild(document.createElement('code'));
      elm.firstChild.textContent = vkbeautify.xml(stanza.XML);
      //~ elm.innerHTML = prettyPrintOne(elm.firstChild.outerHTML);
      document.getElementById('xmpp-console').appendChild(elm);
    });
    Plugsbee.connection.on('output', function(stanza) {
      var elm = document.createElement('pre');
      elm.classList.add('out');
      elm.appendChild(document.createElement('code'));
      elm.firstChild.textContent = vkbeautify.xml(stanza.XML);
      //~ elm.innerHTML = prettyPrintOne(elm.firstChild.outerHTML);
      document.getElementById('xmpp-console').appendChild(elm);
    });
    
    //Settings
		//~ var settingsForm = document.getElementById("settings-form");
		//~ this.settingsForm = settingsForm;
		//~ settingsForm.onsubmit = function(event) {
			//~ saveSettings(settingsForm, event);
		//~ }
		//~ var consoleForm = document.getElementById("output");
		//~ this.consoleForm = consoleForm;
		//~ consoleForm.onsubmit = function(evt) {
			//~ var input = this.querySelector('textarea');
			//~ Plugsbee.connection.send(input.value);
			//~ consoleForm.reset();
			//~ evt.preventDefault();
		//~ }

    //Login form
		var loginForm = document.getElementById("login-form");
		loginForm.onsubmit = function(aEvent) {
      var login = this.elements["login"].value;
      if(!login.match('@'))
        login += '@plugsbee.com';
      var password = this.elements["password"].value;
      var remember = this.elements["remember"].checked;
      if(remember) {
        localStorage.setItem('login', login);
        localStorage.setItem('password', password);
      }
      else {
        localStorage.removeItem('login', login);
        localStorage.removeItem('password', password);
      }
      Plugsbee.connection.connect(login, password);
      Plugsbee.jid = login;
      aEvent.preventDefault();
		}
    
    //Registration form
    var registerForm = document.getElementById("register-form");
    if (gConfiguration.registration) {
      registerForm.onsubmit = function(aEvent) {
        var login = this.elements["login"].value;
        var password = this.elements["password"].value;

        var fd = new FormData;
        fd.append('login', login);
        fd.append('password', password);
        
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load",
          function() {
            if(xhr.responseText === 'ok')
              Plugsbee.connection.connect(login+'@plugsbee.com', password);
          }, false
        );

        xhr.open('POST', 'http://plugsbee.com:8282');
        xhr.send(fd);
        aEvent.preventDefault();
      }
    }
    else
      registerForm.parentNode.removeChild(registerForm);
	},
  openFilePicker: function() {
    document.getElementById('file-picker').click();
  },
  addFolder: function() {
    var thumbnail = new Widget.Thumbnail();
    thumbnail.miniature = gUserInterface.themeFolder+'folder.png';
    thumbnail.edit = true;
    var folders = document.getElementById('folders');
    
    function dispatchEvent() {
      var cancelEvent = document.createEvent('CustomEvent');
      cancelEvent.initCustomEvent('cancel', false, false, false);
      thumbnail.form.dispatchEvent(cancelEvent);
    };  
    
    thumbnail.form.addEventListener('submit', function(e) {
      e.preventDefault();
      this.elements.name.removeEventListener('blur', dispatchEvent);
      var name = this.elements.name.value;
      if (name) {
        var pbFolder = Plugsbee.createFolder();
        
        folders.removeChild(thumbnail.elm);

  
        pbFolder.name = name;
        pbFolder.id = Math.random().toString().split('.')[1];
        pbFolder.host = gConfiguration.PubSubService;
        Plugsbee.layout.drawFolder(pbFolder);
        
        
        Plugsbee.remote.newFolder(pbFolder);
        Plugsbee.storage.addFolder(pbFolder);
        

        Plugsbee.folders[pbFolder.id] = pbFolder;
      }
      else {
        dispatchEvent();
      }
    });
    thumbnail.form.elements.name.addEventListener('blur', dispatchEvent);
    thumbnail.form.addEventListener('cancel', function(e) {
      folders.removeChild(thumbnail.elm);
    });

    var folders = document.getElementById('folders');
    thumbnail.elm = folders.insertBefore(thumbnail.elm, folders.firstChild);
  }, 
  showWelcome: function() {
    document.body.style.backgroundColor = 'white';

    //Header
    this.navButton.elm.hidden = true;
    this.folderAdder.hidden = true;
    this.uploadButton.hidden = true;
    this.emptyTrashButton.hidden = true;
    //Title
    this.contextTitle.value = gConfiguration.name;
    this.contextTitle.editable = false;

    this.deck.selectedPanel = 'account';
  },
  showLogin: function() {
    document.body.style.backgroundColor = 'white';

    //Header
    this.navButton.elm.hidden = true;
    this.folderAdder.hidden = true;
    this.uploadButton.hidden = true;
    this.emptyTrashButton.hidden = true;
    //Title
    this.contextTitle.value = gConfiguration.name;
    this.contextTitle.editable = false;

    this.deck.selectedPanel = 'login';
  },
  showAccount: function() {
    document.body.style.backgroundColor = 'white';

    //Header
    this.navButton.elm.hidden = false;
    this.navButton.setHref('');
    this.navButton.elm.textContent = 'Folders';
    this.folderAdder.hidden = true;
    this.uploadButton.hidden = true;
    this.emptyTrashButton.hidden = true;
    //Title
    this.contextTitle.value = gConfiguration.name;
    this.contextTitle.editable = false;

    this.deck.selectedPanel = 'account';
  },
  showFolders: function() {
    document.body.style.backgroundColor = 'white';
    //Move the folders thumbnails to their original location
    var folders = document.getElementById('deck').appendChild(document.getElementById('folders'));
    //Unhide the current folder
    if (gUserInterface.currentFolder.thumbnail)
      gUserInterface.currentFolder.thumbnail.elm.hidden = false;
    folders.hidden = true;
    folders.classList.add('panel');

    for (var i in Plugsbee.folders) {
      var folder = Plugsbee.folders[i];
      if(!folder.trash) {
        folder.thumbnail.draggable = true;
        folder.thumbnail.dropbox = false;
      }
    }
    
    //Header
    this.navButton.elm.hidden = false;
    this.navButton.elm.textContent = "Account";
    this.navButton.setHref("account");
    
    document.getElementById('folder-adder').hidden = false;
    document.getElementById('upload-button').hidden = true;
    this.emptyTrashButton.hidden = true;
    //Title
    this.contextTitle.value = gConfiguration.name;
    this.contextTitle.editable = false;

		this.deck.selectedPanel = 'folders';
  },
  showFolder: function(aFolder) {
    gUserInterface.deck.selectedPanel = 'folders';
    document.body.style.backgroundColor = 'white';
    //Makes the folders thumbnail as dropbox
    for (var i in Plugsbee.folders) {
      var folder = Plugsbee.folders[i];
      if(!folder.trash) {
        folder.thumbnail.draggable = false;
        folder.thumbnail.dropbox = true;
      }
    }
    var dock = document.getElementById('dock');
    dock.hidden = true;
    //Move the folders thumbnails to the dock
    var folders = dock.appendChild(document.getElementById('folders'));
    folders.classList.remove('panel');
    folders.hidden = false;
    //Hide the current folder
    aFolder.thumbnail.elm.hidden = true;
    //Hide the folder adder for the moment
    //~ gUserInterface.hidden = true;

    //Header
    var navButton = this.navButton;
    navButton.elm.hidden = false;
    navButton.elm.textContent = 'Folders';
    navButton.setHref('');
    document.getElementById('folder-adder').hidden = true;
    document.getElementById('upload-button').hidden = false;
    this.emptyTrashButton.hidden = true;
    //Title
    this.contextTitle.value = aFolder.name;
    this.contextTitle.editable = true;
    this.contextTitle.onsubmit = function(value) {
      aFolder.rename(value);
    };
    gUserInterface.deck.selectedPanel = aFolder.id;
    
    
    //~ this.title.elm.onclick = function(evt) {
      //~ if(this.title.edit !== true)
        //~ this.title.edit = true;
    //~ };
    //~ this.title.form.onsubmit = function(evt) {
      //~ var value = this.title.value;
      //~ this.title.edit = false;
      //~ this.title.value = value;
      //~ aFolder.name = value;
      //~ Plugsbee.renameFolder(aFolder, value);
      //~ evt.preventDefault();
    //~ };

    this.currentFolder = aFolder;
  },
  emptyTrash: function() {
    Plugsbee.folders['trash'].purge();
  },    
  showTrash: function() {
    var aFolder = Plugsbee.folders['trash'];
    gUserInterface.deck.selectedPanel = 'folders';
    document.body.style.backgroundColor = 'white';
    //Makes the folders thumbnail as dropbox
    for (var i in Plugsbee.folders) {
      var folder = Plugsbee.folders[i];
      if(!folder.trash) {
        folder.thumbnail.draggable = false;
        folder.thumbnail.dropbox = true;
      }
    }
    var dock = document.getElementById('dock');
    dock.hidden = true;
    //Move the folders thumbnails to the dock
    var folders = document.getElementById('dock').appendChild(document.getElementById('folders'));
    folders.classList.remove('panel');
    folders.hidden = false;
    //Hide the current folder
    aFolder.thumbnail.elm.hidden = true;
    //Hide the folder adder for the moment
    gUserInterface.hidden = true;

    //Header
    var navButton = this.navButton;
    navButton.elm.hidden = false;
    navButton.elm.textContent = 'Folders';
    navButton.setHref('');
    document.getElementById('folder-adder').hidden = true;
    document.getElementById('upload-button').hidden = true;
    this.emptyTrashButton.hidden = false;
    //Title
    this.contextTitle.value = aFolder.name;
    this.contextTitle.editable = false;
    
    gUserInterface.deck.selectedPanel = 'trash';
    
    
    //~ this.title.elm.onclick = function(evt) {
      //~ if(this.title.edit !== true)
        //~ this.title.edit = true;
    //~ };
    //~ this.title.form.onsubmit = function(evt) {
      //~ var value = this.title.value;
      //~ this.title.edit = false;
      //~ this.title.value = value;
      //~ aFolder.name = value;
      //~ Plugsbee.renameFolder(aFolder, value);
      //~ evt.preventDefault();
    //~ };

    this.currentFolder = aFolder;
  },
  getFolderFromName: function(aName) {
    for (var i in Plugsbee.folders) {
      var folder = Plugsbee.folders[i];
      if(folder.name === aName) {
        return folder;
      }
    }
  },
  getFileFromName: function(aPbFolder, aName) {
    for (var i in aPbFolder.files) {
      var file = aPbFolder.files[i];
      if(file.name === aName) {
        return file;
      }
    }
  },
  showFile: function(aFile) {
    document.body.style.backgroundColor = 'black';
    gUserInterface.deck.selectedPanel = 'viewer';
    var preview = document.getElementById('preview');
    var download = document.getElementById('download');
    download.href = aFile.fileURL;
    
    //Title
    this.contextTitle.value = aFile.name;
    this.contextTitle.editable = true;
    this.contextTitle.onsubmit = function(value) {
      aFile.rename(value);
    };

    var getLink = document.getElementById('get-link');
    getLink.onclick = function() {
      window.prompt('Here is the link, you can simply copy it.', aFile.fileURL);
    }

    document.getElementById('folder-adder').hidden = true;
    document.getElementById('upload-button').hidden = true;
    this.emptyTrashButton.hidden = true;

    var navButton = this.navButton;
    navButton.elm.hidden = false;
    if (aFile.folder.id === 'trash')
      navButton.setHref('trash');
    else
      navButton.setHref(aFile.folder.name);
    navButton.elm.textContent = aFile.folder.name;
    
    //~ if(location.protocol !== 'file:') {
      //~ 
      //~ navButton.onclick = function(e) {
        //~ history.pushState(null, null, this.href);
        //~ var event = document.createEvent('Event');
        //~ event.initEvent('popstate', true, true);
        //~ window.dispatchEvent(event);
        //~ e.preventDefault();
      //~ };
    //~ }
    //~ else {
      //~ navButton.href = '#'+aFile.folder.name;
      //~ navButton.onclick = function(e) {
        //~ history.pushState(null, null, this.href);
        //~ var event = document.createEvent('Event');
        //~ event.initEvent('popstate', true, true);
        //~ window.dispatchEvent(event);
        //~ e.preventDefault();
      //~ };
    //~ }

    var elm = this.previewBuilder(aFile);
    preview.innerHTML = elm;
  },
  logOut: function() {
    localStorage.removeItem("login");
    localStorage.removeItem("password");
    Plugsbee.connection.disconnect();
    if (location.protocol === 'file:') {
      window.location.assign('#');
      window.location.reload();
    }
    else
      window.location.assign('/');

  },   
  previewBuilder: function(aFile) {
    //~ var src = window.URL.createObjectURL(aFile.file);
    var src = aFile.fileDataURI;
    switch (aFile.type) {
      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
      case 'image/svg+xml':
        var previewElm = '<img src="'+src+'"/>';
        break;
      case 'video/webm':
      case 'video/ogg':
      case 'video/mp4':
        var previewElm = '<video src="'+src+'" autoplay="autoplay" controls="controls"/>';
        break;
      case 'audio/webm':
      case 'audio/ogg':
      case 'audio/wave':
      case 'audio/mpeg':
        var previewElm = '<audio src="'+src+'" autoplay="autoplay" controls="controls"/>';
        break;
      default:
        var previewElm = '<span>'+'No preview available yet.'+'</span>';
    }
    //~ window.URL.revokeObjectURL(src);
    return previewElm;
  }
};

var Router = {
  route: function(aNode) {
    //~ console.log('routing: '+aNode[0]);
    //~ if(aNode[1])
      //~ console.log('routing: '+aNode[1]);
    switch (aNode[0]) {
			//~ case 'settings':
				//~ this.showPanel("settings");
				//~ this.setActive('li#settings-tab');
				//~ break;
			//~ case 'help':
				//~ this.showPanel("help");
				//~ this.setActive('li#help-tab');
				//~ break;
			//~ case 'addcontact':
				//~ this.showPanel("addcontact");
				//~ this.setActive('a#addcontact-tab');
				//~ break;
			case 'account':
				gUserInterface.showAccount();
				break;
			case 'trash':
				gUserInterface.showTrash();
        if (!aNode[1])
          return;

        var file = gUserInterface.getFileFromName(Plugsbee.folders['trash'], unescape(aNode[1]));
        if (file)
          gUserInterface.showFile(file);
				break;
			//~ case 'upgrade':
				//~ this.showSection('upgrade');
				//~ break;
			//~ case 'Trash':
				//~ gUserInterface.showTrash();

        //~ var file = gUserInterface.getFileFromName(Plugsbee.trash, unescape(aNode[1]));
        //~ if (file)
          //~ gUserInterface.showFile(file);
        //~ else
          //~ gUserInterface.showFolder(Plugsbee.trash);
        
        //~ break;
			default:
        var folder = gUserInterface.getFolderFromName(decodeURIComponent(aNode[0]));
        if (!folder) {
          gUserInterface.showFolders();
          return;
        }
        var file = gUserInterface.getFileFromName(folder, decodeURIComponent(aNode[1]));
        if (file)
          gUserInterface.showFile(file);
        else
          gUserInterface.showFolder(folder);
    }
  }
}

window.addEventListener("load", function() {
  gUserInterface.init();
});

(function() {
  // Document title
  document.title = gConfiguration.name;

  // Theme
  gConfiguration.themeFolder = 'themes/'+gConfiguration.theme+'/';
  yepnope(gConfiguration.themeFolder+'style.css');
  
  // Favicon
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="icon" type="image/png" sizes="16x16" href="'+gConfiguration.themeFolder+'icons/16x16.png"/>' 
  );
  
  //~ if ((platform.name === 'Chrome') && (location.protocol !== 'file:'))
  //~ yepnope('gStorageWithFS.js');
  
  // iOS stuff
  if (platform.os.match('iOS')) {
    //
    // Icons //FIXME: This should works for Android
    //
    document.head.insertAdjacentHTML('beforeend',
      '<link rel="apple-touch-icon" href="'+gConfiguration.themeFolder+'icons/57x57.png"/>' +
      '<link rel="apple-touch-icon" sizes="72x72" href="'+gConfiguration.themeFolder+'icons/72x72.png"/>' +
      '<link rel="apple-touch-icon" sizes="114x114" href="'+gConfiguration.themeFolder+'icons/114x114.png"/>'
    );
    
    //
    // Add to homescreen //FIXME: This should works for Android
    //
    yepnope('lib/add-to-homescreen/src/add2home.js');
    yepnope('lib/add-to-homescreen/style/add2home.css');

    //
    // Specific rules for iOS
    //
    yepnope(gConfiguration.themeFolder+'iOS.css');
    
    
    //
    // iOS web-app
    //
    document.head.insertAdjacentHTML('beforeend',
      '<meta name="apple-mobile-web-app-capable" content="yes"/>' + 
      '<meta name="apple-mobile-web-app-status-bar-style" content="black"/>'
    );
    
    // FIXME add startup image -- 1004*768 for ipad and 320 x 460 for ipod portrait for both
    /*document.head.insertAdjacentHTML('beforeend',
      '<link rel="apple-touch-startup-image" href="/startup.png">'
    );*/
  }
  
  function switchOffline() {
    //~ var nodes = document.querySelectorAll('[data-require~=network]');
    //~ for (var i = 0; nodes.length; i++) {
      //~ nodes[i].style.display = 'none';
    //~ };
    yepnope(gConfiguration.themeFolder+'offline.css');
  }
  //The network stuff
  window.addEventListener("load", function() {
    if (!context.network.onLine)
      switchOffline();
  });

  //~ app.ononline = function() {
    //~ switchOnline();
  //~ };
  //~ app.onoffline = function() {
    //~ switchOffline();
  //~ };
  
  //~ window.addEventListener('error', function(aMessage, aURL, aLineNumber) {
    //~ console.log(aMessage + ':' + aURL + ':' + aLineNumber);
  //~ });
})();
