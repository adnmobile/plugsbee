'use strict';

Plugsbee.connection.on('connected', function() {
  //~ gUserInterface.showSection('deck');
  gUserInterface.handlePath();
	//~ gUserInterface.handlePath();
	//~ gUserInterface.menu.hidden = false;
	
  
  var accountMenu = document.getElementById('account-menu');
  accountMenu.textContent = Plugsbee.connection.user;
  accountMenu.style.visibility = 'visible';
});

var gUserInterface = {
  currentFolder: {},
  currentFile: {},
  themeFolder : 'themes/'+gConfiguration.theme+'/',
	init: function() {
    var that = this;

    //
    //Title
    //
    var title = document.getElementById('title');
    this.title =  new Widget.Editabletext(title);

    //
    //Dock
    //
    var dock  = document.getElementById('dock');
    var trash = document.getElementById('trash');
    trash.addEventListener('dragenter', function(evt) {
      trash.classList.add('dragenter');
    });
    trash.addEventListener('dragover', function(evt) {
      trash.classList.add('dragenter');
      evt.preventDefault()
    });
    trash.addEventListener('dragleave', function(evt) {
      trash.classList.remove('dragenter');
    });
    trash.addEventListener('drop', function(evt) {
      trash.classList.remove('dragenter');
      dock.hidden = true;
      var jid = evt.dataTransfer.getData('Text');
      
      var folder = Plugsbee.folders[jid];
      var file = Plugsbee.files[jid];
      if(folder)
        Plugsbee.deleteFolder(folder);
      else if(Plugsbee.files[jid])
        Plugsbee.deleteFile(file);
        
      evt.preventDefault();
    });

    //
    //Folder adder
    //
    var folderAdder = new Widget.Thumbnail;
    folderAdder.elm = document.getElementById('folder-adder');
    var input =  folderAdder.form.querySelector('input');
    folderAdder.elm.onclick = function(aEvent) {
      folderAdder.edit = true;
      //Workaround, the autofocus attribute doesn't works on Firefox (see thumbnail.js)
      folderAdder.form.querySelector('input').focus();
    };
    folderAdder.form.onsubmit = function(aEvent) {
      Plugsbee.createFolder(input.value, 'whitelist');
      folderAdder.edit = false;
      input.value = '';
      return false;
    }
    input.onblur = function(aEvent) {
      folderAdder.edit = false;
      input.value = '';
      return false;
    }
    
    //
    //Uploader
    //
    var filePicker = document.getElementById('file-picker');
    var uploadButton = document.getElementById('upload-button');
    //Disable it on Safari mobile since uploading file isn't possible
    if(bowser.ipad || bowser.iphone) {
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
        that.openFilePicker();
      });
    }

    //Account menu
    document.getElementById('account-menu').addEventListener('click', function() {
			localStorage.removeItem("login");
			localStorage.removeItem("password");
			Plugsbee.connection.disconnect();
      window.location.reload();
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
      aEvent.preventDefault();
		}
    
    //Registration form
		var registerForm = document.getElementById("register-form");
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
    document.querySelector('header').style.width = "1024px";
    var navButton = document.getElementById('nav-button')
    if(navButton)
      navButton.style.visibility = 'hidden';
    var uploadButton = document.getElementById('upload-button')
    if(uploadButton)
      uploadButton.style.visibility = 'hidden';
      
    var title = this.title;
    title.value = 'Plugsbee';
    title.elm.onclick = null;

    this.showSection('deck');
		this.showPanel('folders');
  },
  showFolder: function(aFolder) {
    document.querySelector('header').style.width = "1024px";
    this.showSection('folders');
    
    var navButton = document.getElementById('nav-button')
    navButton.style.visibility = 'visible';
    navButton.textContent = 'Folders';
    navButton.href = '/';
    navButton.onclick = function(e) {
      if(window.location.protocol !== 'file:')
        history.pushState(null, null, this.href);
      gUserInterface.showFolders();
      e.preventDefault();
    };
    
    var uploadButton = document.getElementById('upload-button')
    if(uploadButton)
      uploadButton.style.visibility = 'visible';
    gUserInterface.showPanel(aFolder.panel);
    
    var title = this.title;
    title.value = aFolder.name;
    
    title.elm.onclick = function(evt) {
      if(title.edit !== true)
        title.edit = true;
    };
    title.form.onsubmit = function(evt) {
      var value = title.value;
      title.edit = false;
      title.value = value;
      //~ aFolder.name = value;
      Plugsbee.renameFolder(aFolder, value);
      event.preventDefault();
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
    this.showSection('viewer');
    
    var preview = document.getElementById('preview');
    var download = document.getElementById('download');
    download.href = aFile.src;

    document.querySelector('header').style.width = "100%";
    
    var title = this.title;
    title.value = aFile.name;
    //~ 
    title.elm.onclick = function(evt) {
      if(title.edit !== true)
        title.edit = true;
    };
    title.form.onsubmit = function(evt) {
      var value = title.value;
      title.edit = false;
      title.value = value;
      aFile.name = value;
      Plugsbee.addFile(aFile);
      event.preventDefault();
    };

    var navButton = document.getElementById('nav-button');
    navButton.style.visibility = 'visible';
    
    var navButton = document.getElementById('nav-button');
    navButton.style.visibility = 'visible';
    navButton.textContent = aFile.folder.name;
    navButton.href = '/'+aFile.folder.name;
    navButton.onclick = function(e) {
      if(window.location.protocol !== 'file:')
        history.pushState(null, null, this.href);
      gUserInterface.showFolder(aFile.folder);
      e.preventDefault();
    };
    
    //~ if(!bowser.iphone || !bowser.ipad) {
      var uploadButton = document.getElementById('upload-button');
      if(uploadButton)
        uploadButton.style.visibility = 'hidden';
    //~ }

    var elm = this.previewBuilder(aFile);
    preview.innerHTML = elm;
  },
	handlePath: function() {
		var path = document.location.pathname.split('/');
		switch(path[1]) {
			case 'settings':
				this.showPanel("settings");
				this.setActive('li#settings-tab');
				break;
			case 'help':
				this.showPanel("help");
				this.setActive('li#help-tab');
				break;
			case 'addcontact':
				this.showPanel("addcontact");
				this.setActive('a#addcontact-tab');
				break;
			case 'console':
				this.showPanel('console');
				this.setActive('li#console-tab');
				break;
			case 'upgrade':
				this.showSection('upgrade');
				break;
			//~ case '':
				//~ this.showFolders();
				//~ break;
			default:
        //~ this.showFolders();
        var folder = this.getFolderFromName(unescape(path[1]));
        
        if(!folder) {
          this.showFolders();
          return;
        }

        this.showFolder(folder);
				if(path[2]) {
          var file = this.getFileFromName(folder, unescape(path[2]));
          this.showFile(file);
				}
		}
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
        var previewElm = '<video src="'+aFile.src+'" autoplay controls/>';
        //Chrome canno't autoplay if injected
        //~ previewElm.addEventListener('canplay', function() { this.play(); } );
        break;
      case 'audio/webm':
      case 'audio/ogg':
      case 'audio/wave':
      case 'audio/mpeg':
        var previewElm = '<audio src="'+aFile.src+'" autoplay controls/>';
        //~ var titi = Widget.parse(previewElm);
        //~ console.log(titi);
        //~ console.log(titi.firstChild);
        //Chrome canno't autoplay if injected
        //~ previewElm.addEventListener('canplay', function() { this.play(); } );
        break;
      //~ case 'text/plain':
      //~ case 'text/xml':
      //~ case 'text/html':
      //~ case 'application/xml':
        //~ var previewElm = microjungle([
          //~ ['iframe', {src: aFile.src, id: 'preview'}]
        //~ ]);
        //~ break;
      //~ case 'application/pdf':
        //~ var previewElm = microjungle([
          //~ ['iframe', {src: 'http://docs.google.com/viewer?url='+aFile.src+'&embedded=true', id: 'preview'}]
        //~ ]);
        //~ break;
      default:
        var previewElm = '<span>'+'No preview available yet.'+'</span>';
    }
    return previewElm;
  }
	//~ removeFile : function(aFile) {
		//~ var fileElm = document.getElementById(aFile.jid);
		//~ fileElm.parentNode.removeChild(fileElm);
		//~ var folderElm = document.getElementById(aFile.folder.jid)
		//~ folderElm.querySelector('span.size').textContent = ' ('+aFile.folder.count+') ';
		//~ aFile.remove();
	//~ },
	//~ removeFolder : function(aFolder) {
		//~ var folderElm = document.getElementById(aFolder.jid);
		//~ folderElm.parentNode.removeChild(folderElm);
		//~ aFolder.delete();
	//~ }
};

window.addEventListener("load",
	function() {
		var password = localStorage.getItem('password');
		var login = localStorage.getItem('login');
		if(password && login)
			Plugsbee.connection.connect(login, password);
		gUserInterface.init();
	}, false
);

var toto = 0;
window.addEventListener("popstate",
	function(e) {
    // Webkit emit a popstate event on load
    if(toto === 0) {
      toto = 1;
      return;
      e.preventDefault();
    }
    gUserInterface.handlePath();
    
	}, false
);



