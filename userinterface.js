'use strict';

Plugsbee.connection.on('connected', function() {
  gUserInterface.showSection('deck');
  //~ gUserInterface.accountMenu.textContent = Plugsbee.connection.jid.node;f
  gUserInterface.accountMenu.style.visibility = 'visible';
});

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
    //
    //Title
    //
    var title = document.getElementById('title');
    title.textContent = gConfiguration.name;
    this.title = new Widget.Editabletext(title);

    //
    //Account menu
    //
    this.accountMenu = document.getElementById('account-menu');

    this.accountMenu.addEventListener('click', function() {
			localStorage.removeItem("login");
			localStorage.removeItem("password");
			Plugsbee.connection.disconnect();
      window.location.reload();
		});
    

        //~ <!-- Add folder thumbnail -->
        //~ <li id="folder-adder" class="thumbnail upload">
          //~ <a>
            //~ <figure>
              //~ <div class="miniature">
                //~ <div class="area">
                //~ </div>
              //~ </div>
              //~ <figcaption class="label">New folder</figcaption> 
            //~ </figure>
          //~ </a>
        //~ </li>

    //
    //Folder adder
    //
    (function() {
      var folderAdder = new Widget.Thumbnail();
      folderAdder.elm.id = "folder-adder";
      folderAdder.label = "New folder";
      // No folder adder on iOS (no file upload support so pretty useless)
      if(platform.os.match('iOS'))
        folderAdder.elm.hidden = true;
      else {
        var input =  folderAdder.form.querySelector('input');
        folderAdder.elm.onclick = function(aEvent) {
          folderAdder.edit = true;
          //Workaround, the autofocus attribute doesn't works on Firefox (see thumbnail.js)
          folderAdder.form.querySelector('input').focus();
        };
        folderAdder.form.onsubmit = function(aEvent) {
          Plugsbee.createFolder(input.value, 'whitelist', function(folder) {
            folder.thumbnail.elm = document.getElementById('folders').insertBefore
            //~ gUserInterface.handleFolder(folder);
          });
          folderAdder.edit = false;
          input.value = '';
          return false;
        }
        input.onblur = function(aEvent) {
          folderAdder.edit = false;
          input.value = '';
          return false;
        }
      }
      folderAdder.elm = document.getElementById('folders').appendChild(folderAdder.elm);
      gUserInterface.folderAdder = folderAdder;
    })();

    //
    //Trash
    //
    (function() {
      var trash = new Widget.Thumbnail();
      trash.draggable = false;
      trash.miniature = gUserInterface.themeFolder + 'trash.png';
      trash.label = 'Trash';
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
        this.classList.remove('dragenter');
        var jid = evt.dataTransfer.getData('Text');
        
        var folder = Plugsbee.folders[jid];
        var file = Plugsbee.files[jid];
        if(folder) {
          Plugsbee.deleteFolder(folder);
        }
        else if(file) {
          Plugsbee.moveFile(file, Plugsbee.trash);
          document.getElementById('dock').hidden = true;
        }
        evt.preventDefault();
      });
      trash.elm = document.getElementById('folders').appendChild(trash.elm);
    })();

    //
    //Uploader
    //
    var filePicker = document.getElementById('file-picker');
    var uploadButton = document.getElementById('upload-button');
    //Disable it on Safari mobile since uploading file isn't possible
    if (platform.os.match('iOS')) {
      filePicker.parentNode.removeChild(filePicker);
      uploadButton.parentNode.removeChild(uploadButton);
    }
    else {
      filePicker.addEventListener('change', function upload(evt) {
        var file = evt.target.files[0];

        var folder = gUserInterface.currentFolder;

        Plugsbee.upload(file, folder);
      });
      
      uploadButton.addEventListener('click', function() {
        gUserInterface.openFilePicker();
      });
    }
    
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
  deleteFile: function() {
    var elm = document.activeElement;
    var jid = elm.getAttribute('data-jid');
    var file = Plugsbee.files[jid];
    Plugsbee.deleteFile(file);
  },
  deleteFolder: function() {
    var elm = document.activeElement;
    var jid = elm.getAttribute('data-jid');
    var folder = Plugsbee.folders[jid];
    Plugsbee.deleteFolder(folder);
  },
  showFolders: function() {
    //Move the folders thumbnails to their original location
    var folders = document.getElementById('deck').appendChild(document.getElementById('folders'));
    document.body.style.backgroundColor = 'white';
    //Unhide the current folder
    if (gUserInterface.currentFolder.thumbnail)
      gUserInterface.currentFolder.thumbnail.elm.hidden = false;
    folders.hidden = true;
    folders.classList.add('panel');
    //Unhide the folder adder
    if(!platform.os.match('iOS'))
      gUserInterface.folderAdder.elm.hidden = false;

    for (var i in Plugsbee.folders) {
      var folder = Plugsbee.folders[i];
      if(!folder.trash) {
        folder.thumbnail.draggable = true;
        folder.thumbnail.dropbox = false;
      }
    }
    
    document.getElementById('account-menu').hidden = false;
    
    var navButton = document.getElementById('nav-button')
    if(navButton)
      navButton.style.visibility = 'hidden';
    var uploadButton = document.getElementById('upload-button')
    if(uploadButton)
      uploadButton.style.visibility = 'hidden';
    
    this.title.value = gConfiguration.name;
    this.title.elm.onclick = null;

    this.showSection('deck');
		this.showPanel('folders');
  },
  showFolder: function(aFolder) {
    this.showSection('folders');
    document.body.style.backgroundColor = 'white';
    document.getElementById('account-menu').hidden = true;
    //Makes the folders thumbnail as dropbox
    for (var i in Plugsbee.folders) {
      var folder = Plugsbee.folders[i];
      if(!folder.trash) {
        folder.thumbnail.draggable = false;
        folder.thumbnail.dropbox = true;
      }
    }
    //Move the folders thumbnails to the dock
    var folders = document.getElementById('dock').appendChild(document.getElementById('folders'));
    folders.classList.remove('panel');
    folders.hidden = false;
    //Hide the current folder
    aFolder.thumbnail.elm.hidden = true;
    //Hide the folder adder for the moment
    gUserInterface.folderAdder.elm.hidden = true;

    var navButton = document.getElementById('nav-button')
    navButton.style.visibility = 'visible';
    navButton.textContent = 'Folders';
    navButton.href = '';
    navButton.onclick = function(e) {
      history.pushState(null, null, this.href);
      var event = document.createEvent('Event');
      event.initEvent('popstate', true, true);
      window.dispatchEvent(event);
      e.preventDefault();
    };
    
    if (!aFolder.trash) {
      var uploadButton = document.getElementById('upload-button')
      if(uploadButton)
        uploadButton.style.visibility = 'visible';
    }
    gUserInterface.showPanel(aFolder.panel);
    
    this.title.value = aFolder.name;
    
    this.title.elm.onclick = function(evt) {
      if(this.title.edit !== true)
        this.title.edit = true;
    };
    this.title.form.onsubmit = function(evt) {
      var value = this.title.value;
      this.title.edit = false;
      this.title.value = value;
      //~ aFolder.name = value;
      Plugsbee.renameFolder(aFolder, value);
      evt.preventDefault();
    };

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
  getFileFromName: function(aFolder, aName) {
    for (var i in aFolder.files) {
      var file = aFolder.files[i];
      if(file.name === aName) {
        return file;
      }
    }
  },
  showFile: function(aFile) {
    document.body.style.backgroundColor = 'black';
    this.showSection('viewer');
    document.getElementById('account-menu').hidden = true;
    var preview = document.getElementById('preview');
    var download = document.getElementById('download');
    //~ download.href = aFile.src.replace('http://media.plugsbee.com', 'http://download.plugsbee.com');
    download.href = aFile.src;
    
    this.title.value = aFile.name;

    this.title.elm.onclick = function(evt) {
      if(this.title.edit !== true)
        this.title.edit = true;
    };
    this.title.form.onsubmit = function(evt) {
      var value = title.value;
      this.title.edit = false;
      this.title.value = value;
      aFile.name = value;
      Plugsbee.renameFile(aFile);
      evt.preventDefault();
    };

    var getLink = document.getElementById('get-link');
    getLink.onclick = function() {
      window.prompt('Here is the link, you can simply copy it.', aFile.src);
    }

    var navButton = document.getElementById('nav-button');
    navButton.style.visibility = 'visible';
    navButton.textContent = aFile.folder.name;
    
    if(location.protocol !== 'file:') {
      navButton.href = '/'+aFile.folder.name;
      navButton.onclick = function(e) {
        history.pushState(null, null, this.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
        e.preventDefault();
      };
    }
    else {
      navButton.href = '#'+aFile.folder.name;
      navButton.onclick = function(e) {
        history.pushState(null, null, this.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
        e.preventDefault();
      };
    }
    
    
    if(!platform.os.match('iOS')) {
      var uploadButton = document.getElementById('upload-button');
      if(uploadButton)
        uploadButton.style.visibility = 'hidden';
    }

    var elm = this.previewBuilder(aFile);
    preview.innerHTML = elm;
  },
	showPanel: function(aPanel) {
    var deck = document.getElementById('deck');
    deck.hidden = false;
		
    var panels = document.querySelectorAll('.panel');
		for (var i in panels) {
			panels[i].hidden = true;
		}

    if(typeof aPanel === "string")
      document.getElementById(aPanel).hidden = false;
    else
      aPanel.hidden = false;
	},
	showSection: function(name) {
		var sections = document.querySelectorAll('section');
		for (var i in sections) {
      sections[i].hidden = true;
		}
		document.getElementById(name).hidden = false;
	},
  previewBuilder: function(aFile) {
    switch (aFile.type) {
      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
      case 'image/svg+xml':
        var previewElm = '<img src="'+aFile.src+'"/>';
        break;
      case 'video/webm':
      case 'video/ogg':
      case 'video/mp4':
        var previewElm = '<video src="'+aFile.src+'" autoplay="autoplay" controls="controls"/>';
        break;
      case 'audio/webm':
      case 'audio/ogg':
      case 'audio/wave':
      case 'audio/mpeg':
        var previewElm = '<audio src="'+aFile.src+'" autoplay="autoplay" controls="controls"/>';
        break;
      default:
        var previewElm = '<span>'+'No preview available yet.'+'</span>';
    }
    return previewElm;
  },
  handleFolder: function(aFolder) {
    var list = document.getElementById('folders');
    var deck = document.getElementById('deck');
    aFolder.thumbnail.elm = list.insertBefore(aFolder.thumbnail.elm, document.getElementById('folder-adder'));
    aFolder.panel.elm = deck.appendChild(aFolder.panel.elm);
  },
};

window.addEventListener("load", function() {
  gUserInterface.init();
});
