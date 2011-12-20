'use strict';

Plugsbee.connection.on('connected', function() {
  gUserInterface.showSection('data');
	//~ gUserInterface.handlePath();
	//~ gUserInterface.menu.hidden = false;
	//~ document.getElementById('account-tab').textContent = Plugsbee.connection.jid;
});

//FIXME nice UI for those events
Plugsbee.connection.on('authFailed', function() {
	alert("Sorry the username or password you entered is invalid.");
});
Plugsbee.connection.once('disconnected', function() {
	//~ window.location.reload();
});
Plugsbee.connection.on('connFailed', function() {
	alert("ConnFailed");
});
//~ Plugsbee.connection.on('connecting', function() {
//~ });

var eventCancel = document.createEvent("CustomEvent");
eventCancel.initCustomEvent('cancel', false, false, '');

var eventExpand = document.createEvent("CustomEvent");
eventExpand.initCustomEvent('expand', false, false, '');

var eventOpen = document.createEvent("CustomEvent");
eventOpen.initCustomEvent('open', false, false, '');

var eventClose = document.createEvent("CustomEvent");
eventClose.initCustomEvent('close', false, false, '');

var eventCheck = document.createEvent("CustomEvent");
eventCheck.initCustomEvent('check', false, false, '');

var eventUncheck = document.createEvent("CustomEvent");
eventUncheck.initCustomEvent('uncheck', false, false, '');

var eventCheckable = document.createEvent("CustomEvent");
eventCheckable.initCustomEvent('checkable', false, false, '');

var eventNotCheckable = document.createEvent("CustomEvent");
eventNotCheckable.initCustomEvent('notcheckable', false, false, '');

var eventDelete = document.createEvent("CustomEvent");
eventDelete.initCustomEvent('delete', false, false, '');

var shareEvent = document.createEvent("CustomEvent");
shareEvent.initCustomEvent('share', false, false, '');

var gUserInterface = {
	init : function() {
		this.panels = {};
		this.__defineGetter__('themeFolder', function() {
			return '/themes/'+gConfiguration.theme+'/';
		});
		var panels = document.querySelectorAll('.panel');
    for (var i=0; i<panels.length; i++) {
      var name = panels[i].getAttribute('id');
      this.panels[name] = panels[i];
    }
    var uploadInput = document.getElementById('upload');
    uploadInput.addEventListener('change', function upload(evt) {
      var file = evt.target.files[0];

      var folder = gUserInterface.currentFolder;

      Plugsbee.upload(file, folder);
    });
    this.menu = document.getElementById('menu');
		var password = localStorage.getItem('password');
		var login = localStorage.getItem('login');
		if(password && login) {
			//~ this.showPanel("home");
			Plugsbee.connection.connect(login, password);
		}
		document.getElementById('logout').onclick = function(event) {
			localStorage.removeItem("password");
			localStorage.removeItem("login");
			Plugsbee.connection.disconnect();
		}
		var settingsForm = document.getElementById("settings-form");
		this.settingsForm = settingsForm;
		//~ settingsForm.onsubmit = function(event) {
			//~ saveSettings(settingsForm, event);
		//~ }
		var consoleForm = document.getElementById("output");
		this.consoleForm = consoleForm;
		//~ consoleForm.onsubmit = function(evt) {
			//~ var input = this.querySelector('textarea');
			//~ Plugsbee.connection.send(input.value);
			//~ consoleForm.reset();
			//~ evt.preventDefault();
		//~ }
		var popup = document.getElementById('popup');
		popup.addEventListener('click', function(evt) {
			var preview = document.getElementById('preview');
			if(evt.target === this) {
				this.removeChild(preview);
				this.hidden = true;
				history.pushState(null, null, '/');
				gUserInterface.handlePath();
			}
		}, false);
		
		this.popup = popup;
		
		//~ var addcontactForm = document.getElementById("addcontact-form");
		//~ addcontactForm.onsubmit = function(event) {
			//~ var elements = this.elements;
			//~ var groups = [];
			//~ var address = elements["address"].value;
			//~ for (var j=0;j<elements.length;j++) {
				//~ if((elements[j].getAttribute("type") == "checkbox") && (elements[j].checked == true)) {
					//~ groups.push(elements[j].value);
				//~ }
			//~ }
			//~ account.addContact(address, groups, function(aContact) {
				//~ gUserInterface.addContact(contact);
			//~ });
			//~ event.preventDefault();
		//~ }
		//~ var addgroupForm = document.getElementById("addgroup-form");
		//~ addgroupForm.onsubmit = function(event) {
			//~ var group = addgroupForm.elements["input"].value;
			//~ var input2 = document.createElement("input");
			//~ input2.setAttribute("type", "checkbox");
			//~ input2.setAttribute("name", group);
			//~ input2.setAttribute("value", group);
			//~ var label = document.createElement("label");
			//~ label.setAttribute("for", group);
			//~ label.textContent = group;
			//~ var br = document.createElement("br");
			//~ 
			//~ gUserInterface.groupsFieldset.appendChild(input2);
			//~ gUserInterface.groupsFieldset.appendChild(label);
			//~ gUserInterface.groupsFieldset.appendChild(br);
			//~ event.preventDefault();
		//~ }
		var loginForm = document.getElementById("login-form");
		loginForm.onsubmit = function(aEvent) {
			loginHandler(loginForm, aEvent);
		}
		//~ var registerForm = document.getElementById("register-form");
		//~ registerForm.onsubmit = function(aEvent) {
			//~ registerHandler(registerForm, aEvent);
		//~ }
		this.groupsFieldset = document.getElementById("groups-fieldset");
		this.tabsList = document.getElementById("tabs-list");
		this.sidebar = document.querySelector("sidebar");

		var links = document.getElementsByTagName('a');
		for (var y=0;y<links.length;y++) {
			if(links[y].id !== 'download')
				this.modifyAElement(links[y]);
		}
	},
	modifyAElement: function(aElm) {
		aElm.addEventListener("click", function(evt) {
			history.pushState(null, null, evt.currentTarget.href);
			gUserInterface.handlePath(this.getAttribute('href'));
			evt.preventDefault();
		}, true);
	},
	createFolderPopup: function() {
		document.getElementById('popup').hidden = false;
	},
	newFolder: function() {
		this.showMyFolders();
		var elm = document.getElementById('newfolder');
		elm.hidden = false;

		history.pushState(null, null, '/');
		this.handlePath();

		elm.querySelector('input').focus();


		document.addEventListener('click', test, true);
		function test(evt) {
			if(!elm.contains(evt.target))			
				elm.querySelector('form').dispatchEvent(eventCancel);
		}
	},
  currentFolder: {},
	handlePath: function() {
		var path = document.location.pathname.split('/');
    var folder;
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
			default:
        this.showSection('data');
        var pathFolder = unescape(path[1]);
        for (var i in Plugsbee.folders) {
          folder = Plugsbee.folders[i];
          if(folder.name === pathFolder) {
            gUserInterface.setActive(".tab[jid='"+folder.jid+"']");
            gUserInterface.showPanel(folder.jid);
            this.currentFolder = folder;
          }
        }
				if(path[2]) {
          var pathFile = unescape(path[2]);
          for (var i in folder.files) {
            var file = folder.files[i];
            if(file.name === pathFile) {
              var popup = document.getElementById('popup');
              popup.hidden = false;
              file.widget.preview = popup.appendChild(file.widget.preview);
              return;
            }
          }
				}
		}
	},
	setActive: function(selector) {
		var current = document.querySelector('[selected="true"]');
    if(current)
      current.removeAttribute('selected');
		document.querySelector(selector).setAttribute('selected', 'true');
	},
	showMyFolders: function() {
		var mytab = document.getElementById('my-tab');
		var notmytab = document.getElementById('notmy-tab');
		mytab.setAttribute('data-selected', 'true');
		notmytab.removeAttribute('data-selected');
		for (var i in Plugsbee.folders) {
			var folder = Plugsbee.folders[i];
			if(Plugsbee.user.jid === folder.creator)
				folder.widget.hidden = false;
			else
				folder.widget.hidden = true;
		}
	},
	showContactsFolders: function() {
		var mytab = document.getElementById('my-tab');
		var notmytab = document.getElementById('notmy-tab');
		notmytab.setAttribute('data-selected', 'true');
		mytab.removeAttribute('data-selected');
		for (var i in Plugsbee.folders) {
			var folder = Plugsbee.folders[i];
			if(Plugsbee.user.jid === folder.creator)
				folder.widget.hidden = true;
			else
				folder.widget.hidden = false;
		}
	},
	showPanel: function(name) {
		var panels = document.querySelectorAll('.panel');
		for (var i in panels) {
			panels[i].hidden = true;
		}
		document.getElementById(name).hidden = false;
	},
	showSection: function(name) {
		var sections = document.querySelectorAll('section');
		for (var i in sections) {
      sections[i].hidden = true;
		}
		document.getElementById(name).hidden = false;
	},
	removeContact : function(contact) {
		var tabContact = document.getElementById("tab-contact"+contact.address);
		this.tabsList.removeChild(tabContact);
	},
	center: function() {
		var elm = document.getElementById('preview');
		var deltaWidth = window.innerWidth - elm.offsetWidth;
		var deltaHeight = window.innerHeight - elm.offsetHeight;
		elm.style.marginLeft = deltaWidth/2+"px";
		elm.style.marginTop = deltaHeight/2+"px";
	},
	removeFile : function(aFile) {
		var fileElm = document.getElementById(aFile.jid);
		fileElm.parentNode.removeChild(fileElm);
		var folderElm = document.getElementById(aFile.folder.jid)
		folderElm.querySelector('span.size').textContent = ' ('+aFile.folder.count+') ';
		aFile.remove();
	},
	removeFolder : function(aFolder) {
		var folderElm = document.getElementById(aFolder.jid);
		folderElm.parentNode.removeChild(folderElm);
		aFolder.delete();
	}
};

function loginHandler(aForm, aEvent) {
	//~ document.getElementById('menu').hidden = false;
	var login = aForm.elements["login"].value;
	var password = aForm.elements["password"].value;
	localStorage.setItem('login', login);
	localStorage.setItem('password', password);
  Plugsbee.connection.connect(login, password);
  aEvent.preventDefault();
}

function registerHandler(aForm, aEvent) {
	account.BOSHService = gConfiguration.BOSHService;
	account.address = aForm.elements["login"].value;
	account.password = aForm.elements["password"].value;
	account.register();
	aEvent.preventDefault();
}

window.addEventListener("load",
	function() {
		gUserInterface.init();
	}, false
);
var toto = 0;
window.addEventListener("popstate",
	function(e) {
    //WORKAROUND webkit
    if(toto === 0) {
      toto = 1;
      return;
    }
    gUserInterface.handlePath();
	}, false
);

function saveSettings(aForm, aEvent) {
	var name = aForm.elements["name"].value;
	var email = aForm.elements["email"].value;
	account.name = name;
	account.emal = email;
	account.send(vCard.set(name, email));
	aEvent.preventDefault();
}
