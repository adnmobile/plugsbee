'use strict';

Plugsbee.connection.on('connected', function() {
  gUserInterface.showSection('deck');
	//~ gUserInterface.handlePath();
	//~ gUserInterface.menu.hidden = false;
	
  
  var accountMenu = document.getElementById('account-menu');
  accountMenu.textContent = Plugsbee.connection.user;
  accountMenu.style.visibility = 'visible';
});

var gUserInterface = {
  currentFolder: {},
	init: function() {
    var that = this;
    

		this.__defineGetter__('themeFolder', function() {
			return 'themes/'+gConfiguration.theme+'/';
		});
    
    //
    //Uploader
    //
    var filePicker = document.getElementById('file-picker');
    var uploadButton = document.getElementById('upload-button');
    //Disable it on Safari mobile since uploading file isn't possible
    if(navigator.userAgent.match('AppleWebKit') && navigator.userAgent.match('Mobile')) {
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
	//~ newFolder: function() {
		//~ this.showMyFolders();
		//~ var elm = document.getElementById('newfolder');
		//~ elm.hidden = false;
//~ 
		//~ history.pushState(null, null, '/');
		//~ this.handlePath();
//~ 
		//~ elm.querySelector('input').focus();
//~ 
//~ 
		//~ document.addEventListener('click', test, true);
		//~ function test(evt) {
			//~ if(!elm.contains(evt.target))			
				//~ elm.querySelector('form').dispatchEvent(eventCancel);
		//~ }
	//~ },
  showFolders: function() {
    document.querySelector('header').style.width = "1024px";
    var navButton = document.getElementById('nav-button')
    if(navButton)
      navButton.style.visibility = 'hidden';
    var uploadButton = document.getElementById('upload-button')
    if(uploadButton)
      uploadButton.style.visibility = 'hidden';
    var title = document.getElementById('title');
    title.textContent = 'iPressbook';
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
    var title = document.getElementById('title');
    title.textContent = aFolder.name;
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
    
    var viewer = document.getElementById('viewer');

    document.querySelector('header').style.width = "100%";
    
    var title = document.getElementById('title');
    title.textContent = aFile.name;

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
    
    if(!(navigator.userAgent.match('AppleWebKit') && navigator.userAgent.match('Mobile'))) {
      var uploadButton = document.getElementById('upload-button');
      uploadButton.style.visibility = 'hidden';
    }

    var preview = this.previewBuilder(aFile);
    viewer.innerHTML = preview;
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
        var previewElm = '<img id="preview" src="'+aFile.src+'"/>';
        break;
      case 'video/webm':
      case 'video/ogg':
      case 'video/mp4':
        var previewElm = '<video id="preview" src="'+aFile.src+'" autoplay controls/>';
        //Chrome canno't autoplay if injected
        //~ previewElm.addEventListener('canplay', function() { this.play(); } );
        break;
      case 'audio/webm':
      case 'audio/ogg':
      case 'audio/wave':
      case 'audio/mpeg':
        var previewElm = '<audio id="preview" src="'+aFile.src+'" autoplay controls/>';
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
        var previewElm = '<span id="preview">'+'No preview available yet.'+'</span>';
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



