'use strict';

Plugsbee.layout = {
  handlePath: function() {
    var path = (decodeURIComponent(location.pathname)).split('/');
    path.shift();
    Plugsbee.layout.route(path);
  },
  route: function(aPath) {
    switch (aPath[0]) {
      case '':
        Plugsbee.layout.showFolders();
        break;
      case 'account':
        Plugsbee.layout.showAccount();
        break;
      case 'trash':
        Plugsbee.layout.showTrash();
        break;
      case 'login':
        Plugsbee.layout.showLogin();
        break;
      default:
        var folder = Plugsbee.folders[aPath[1]];
        if (folder)
          return Plugsbee.layout.showFolder(folder);
        
        Plugsbee.remote.getFolder(aPath[0], aPath[1], function(pbFolder) {
          Plugsbee.layout.buildFolder(pbFolder);
          var deck = document.getElementById('deck');
          pbFolder.panel.elm = deck.appendChild(pbFolder.panel.elm);
          for (var i in pbFolder.files) {
            Plugsbee.layout.drawFile(pbFolder.files[i]);
          }
          Plugsbee.layout.showFolder(pbFolder);
        });
    }
  },
  //
  //Folder
  //
  buildFolder: function(aPbFolder) {
    var thumbnail = new Widget.Thumbnail();
    thumbnail.elm.setAttribute('data-type', 'folder');
    thumbnail.elm.setAttribute('data-id', aPbFolder.id);
    thumbnail.elm.classList.add('folder');
    thumbnail.draggable = true;
    thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/folder.png';
    if (aPbFolder.id === 'trash') {
      thumbnail.href = 'trash';
      thumbnail.label = 'Trash';
    }
    else {
      thumbnail.href = encodeURIComponent(Plugsbee.username) + '/' + encodeURIComponent(aPbFolder.name);
      thumbnail.label = aPbFolder.name;
    }
    thumbnail.elm.addEventListener('click', function(e) {
      e.preventDefault();
      history.pushState(null, null, this.firstChild.href);
      var event = document.createEvent('Event');
      event.initEvent('popstate', true, true);
      window.dispatchEvent(event);
    }, true);
    thumbnail.elm.addEventListener('focusin', function() {
      this.querySelector('img').src = Plugsbee.layout.themeFolder + 'folders/folder-open.png';
    });
    thumbnail.elm.addEventListener('focusout', function() {
      this.querySelector('img').src = Plugsbee.layout.themeFolder + 'folders/folder.png';
    });
    thumbnail.elm.addEventListener('mouseover', function() {
      this.querySelector('img').src = Plugsbee.layout.themeFolder + 'folders/folder-open.png';
    });
    thumbnail.elm.addEventListener('mouseout', function() {
      this.querySelector('img').src = Plugsbee.layout.themeFolder + 'folders/folder.png';
    });
    thumbnail.elm.addEventListener('click', function() {
      this.querySelector('img').src = Plugsbee.layout.themeFolder + 'folders/folder.png';
    });
    aPbFolder.thumbnail = thumbnail;

    var panel = new Widget.Panel();
    panel.elm.setAttribute('data-name', aPbFolder.id);
    panel.elm.classList.add('hidden');
    aPbFolder.panel = panel;
  },
  drawFolder: function(aPbFolder) {
    this.buildFolder(aPbFolder);
    this.handleFolder(aPbFolder);
  },
  handleFolder: function(aPbFolder) {
    //Trash folder
    if (aPbFolder.id === 'trash') {
      //Thumbnail
      aPbFolder.thumbnail.elm = document.querySelector('.thumbnail.trash');
      aPbFolder.thumbnail.elm.hidden = false;
      //Panel
      aPbFolder.panel.elm = document.querySelector('#deck > .trash');

      if (Object.keys(aPbFolder.files).length)
        aPbFolder.thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/user-trash-full.png';
    }
    else {
      //Thumbnail
      var folders = document.getElementById('folders');
      aPbFolder.thumbnail.elm = folders.insertBefore(aPbFolder.thumbnail.elm, folders.firstChild);
      //Panel
      var deck = document.getElementById('deck');
      aPbFolder.panel.elm = deck.appendChild(aPbFolder.panel.elm);
    }
  },
  eraseFolder: function(aFolder) {
    aFolder.thumbnail.elm.parentNode.removeChild(aFolder.thumbnail.elm);
    aFolder.panel.elm.parentNode.removeChild(aFolder.panel.elm);
  },
  setFolderName: function(aPbFolder) {
    aPbFolder.thumbnail.label = aPbFolder.name;
    aPbFolder.thumbnail.href = encodeURIComponent(Plugsbee.username) + '/' + encodeURIComponent(aPbFolder.name);
    //~ for (var i in aPbFolder.files)
      //~ aPbFolder.files[i].thumbnail.href = encodeURIComponent(aPbFolder.files[i].folder.name) + '/' + encodeURIComponent(aPbFolder.files[i].name);
  },
  setFolderMiniature: function(aPbFolder) {
    //Miniature
    aPbFolder.thumbnail.miniature = aPbFolder.miniature;
  },

  //
  //File
  //
  buildFile: function(aPbFile) {
    var thumbnail = new Widget.Thumbnail();
    thumbnail.elm.setAttribute('data-type', 'file');
    thumbnail.elm.setAttribute('data-id', aPbFile.id);
    thumbnail.draggable = true;

    thumbnail.elm.classList.add('file');
    aPbFile.thumbnail = thumbnail;

    if (aPbFile.fileURL) {
      switch (aPbFile.type) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/gif':
        case 'image/svg+xml':
          Plugsbee.layout.setFileMiniature(aPbFile, aPbFile.fileURL);
          break;
        default:
          Plugsbee.layout.setFileMiniature(aPbFile, gConfiguration.themeFolder + 'files/empty.png');
      }
    }

    if (aPbFile.name)
      this.setFileName(aPbFile);

    aPbFile.thumbnail.href = aPbFile.fileURL;
  },
  drawFile: function(aPbFile) {
    this.buildFile(aPbFile);
    this.handleFile(aPbFile);
  },
  eraseFile: function(aPbFile) {
    aPbFile.thumbnail.elm.parentNode.removeChild(aPbFile.thumbnail.elm);
    delete aPbFile.thumbnail;
  },
  handleFile: function(aPbFile) {
    var panel = aPbFile.folder.panel.elm;
    //~ aPbFile.thumbnail.elm = panel.insertBefore(aPbFile.thumbnail.elm, panel.firstChild);
    aPbFile.thumbnail.elm = panel.insertBefore(aPbFile.thumbnail.elm, panel.firstChild);
  },
  setFileName: function(aPbFile) {
    aPbFile.thumbnail.label = aPbFile.name;
    if (aPbFile.folder.id === "trash")
      aPbFile.thumbnail.href = 'trash' + '/' + encodeURIComponent(aPbFile.name);
    else
      aPbFile.thumbnail.href = encodeURIComponent(aPbFile.folder.name) + '/' + encodeURIComponent(aPbFile.name);
  },
  setFileMiniature: function(aPbFile, aMiniature) {
    var miniature = aMiniature || aPbFile.miniature;
    aPbFile.thumbnail.miniature = miniature;
  },
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
    //Deck
    //
    (function() {
      var deck = Object.create(SWStack);
      deck.rootElement = document.getElementById('deck');
      deck.rootElement.addEventListener('mousewheel', function(e) {
        this.scrollTop = this.scrollTop-Math.round(e.wheelDelta);
      });
      Plugsbee.layout.deck = deck;
    })();

    //
    //Left header
    //
    (function() {
      var stack = Object.create(SWStack);
      stack.rootElement = document.querySelector('div.left');
      Plugsbee.layout.leftHeader = stack;
    })();

    //
    //Right header
    //
    (function() {
      var stack = Object.create(SWStack);
      stack.rootElement = document.querySelector('div.right');
      Plugsbee.layout.rightHeader = stack;
    })();

    //
    //Title
    //
    (function() {
      var contextTitle = new Widget.Editabletext();
      contextTitle.value = gConfiguration.name;
      contextTitle.elm = document.querySelector('.center').appendChild(contextTitle.elm);
      Plugsbee.layout.contextTitle = contextTitle;
    })();
 
    //
    //Login button
    //
    (function() {
      var loginButton = document.createElement('a');
      loginButton.textContent = '◀ Login';
      loginButton.setAttribute('data-name', 'login');
      loginButton.classList.add('button');
      loginButton.classList.add('green');
      loginButton.href = '/login';
      loginButton.onclick = function(e) {
        e.preventDefault();
        history.pushState(null, null, this.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
      };
      loginButton.classList.add('hidden');
      Plugsbee.layout.loginButton = document.querySelector('div.left').appendChild(loginButton);
    })();

    //
    //Folders button
    //
    (function() {
      var foldersButton = document.createElement('a');
      foldersButton.textContent = '◀ Folders';
      foldersButton.setAttribute('data-name', 'folders');
      foldersButton.classList.add('button');
      foldersButton.classList.add('green');
      foldersButton.href = '/';
      foldersButton.onclick = function(e) {
        e.preventDefault();
        history.pushState(null, null, this.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
      };
      foldersButton.classList.add('hidden');
      Plugsbee.layout.foldersButton = document.querySelector('div.left').appendChild(foldersButton);
    })();

    //
    //Account menu
    //
    (function() {
      var accountMenu = document.createElement('a');
      //~ accountMenu.textContent = '';
      accountMenu.setAttribute('data-name', 'account');
      accountMenu.classList.add('button');
      accountMenu.classList.add('green');
      accountMenu.classList.add('hidden');
      accountMenu.href = '/account';
      accountMenu.onclick = function(e) {
        e.preventDefault();
        history.pushState(null, null, this.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
      };
      Plugsbee.layout.accountMenu = document.querySelector('div.left').appendChild(accountMenu);
    })();
  
    //
    //Navigation button
    //
    //~ (function() {
      //~ var navButton = {
        //~ setHref: function(aHref) {
          //~ this.elm.href = aHref;
        //~ }
      //~ };
      //~ navButton.elm = document.createElement('a');
      //~ navButton.elm.id = 'nav-button';
      //~ navButton.elm.hidden = true;
      //~ loginButton.classList.add('hidden');
      //~ navButton.elm.textContent = 'Log in';
      //~ navButton.elm.onclick = function(e) {
        //~ e.preventDefault();
        //~ history.pushState(null, null, this.href);
        //~ var event = document.createEvent('Event');
        //~ event.initEvent('popstate', true, true);
        //~ window.dispatchEvent(event);
      //~ };
      //~ navButton.elm = document.querySelector('div.left').appendChild(navButton.elm);
      //~ this.accountMenu = navButton;
      //~ this.accountMenu.setHref('/');
    //~ })();

    //
    //Add folder button
    //
    (function() {
      var addFolderButton = document.createElement('button');
      addFolderButton.textContent = "+ New folder";
      addFolderButton.setAttribute('data-name', 'add-folder');
      addFolderButton.classList.add('button');
      addFolderButton.classList.add('green');
      addFolderButton.classList.add('hidden');
      addFolderButton.addEventListener('click', Plugsbee.layout.addFolder);
      Plugsbee.layout.addFolderButton = document.querySelector('div.left').appendChild(addFolderButton);
    })();

    //
    //Add file button
    //
    (function() {
      var addFileButton = document.createElement('button');
      addFileButton.textContent = "+ Add files";
      addFileButton.setAttribute('data-name', 'add-files');
      addFileButton.classList.add('button');
      addFileButton.classList.add('green');
      addFileButton.classList.add('hidden');
      addFileButton.addEventListener('click', Plugsbee.layout.openFilePicker);
      Plugsbee.layout.addFileButton = document.querySelector('div.left').appendChild(addFileButton);
    })();

    //
    //Edit folders button
    //
    var editFoldersButton = document.createElement('button');
    editFoldersButton.textContent = "⚙ Edit";
    editFoldersButton.classList.add('edit');
    editFoldersButton.setAttribute('data-name', 'edit-folders');
    editFoldersButton.setAttribute('data-require', 'upload');
    editFoldersButton.setAttribute('data-state', 'off');
    editFoldersButton.classList.add('button');
    editFoldersButton.classList.add('green');
    editFoldersButton.classList.add('hidden');
    editFoldersButton.addEventListener('click', function() {
      if (this.getAttribute('data-state') === 'off') {
        this.textContent = '✔ Done';
        this.setAttribute('data-state', 'on');
        Plugsbee.layout.leftHeader.selectedItem = 'add-folder';
      }
      else {
        this.textContent = "⚙ Edit";
        this.setAttribute('data-state', 'off');
        if (Plugsbee.connection.anonymous)
          Plugsbee.layout.leftHeader.selectedItem = 'login';
        else
          Plugsbee.layout.leftHeader.selectedItem = 'account';
      }
    });
    this.editFoldersButton = document.querySelector('div.right').appendChild(editFoldersButton);

    //
    //Edit files button
    //
    var editFilesButton = document.createElement('button');
    editFilesButton.textContent = "⚙ Edit";
    editFilesButton.setAttribute('data-require', 'upload');
    editFilesButton.setAttribute('data-name', 'edit-files');
    editFilesButton.setAttribute('data-state', 'off');
    editFilesButton.classList.add('hidden');
    editFilesButton.classList.add('button');
    editFilesButton.classList.add('green');
    editFilesButton.classList.add('edit');
    editFilesButton.addEventListener('click', function() {
      if (this.getAttribute('data-state') === 'off') {
        this.textContent = '✔ Done';
        this.setAttribute('data-state', 'on');
        Plugsbee.layout.leftHeader.selectedItem = 'add-files';
      }
      else {
        this.textContent = "⚙ Edit";
        this.setAttribute('data-state', 'off');
        Plugsbee.layout.leftHeader.selectedItem = 'folders';
      }
    });
    this.editFilesButton = document.querySelector('div.right').appendChild(editFilesButton);
    
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
    //~ this.editButton = document.querySelector('div.right').appendChild(editButton);

    //
    //Folder adder
    //
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

    //
    //Empty trash button
    //
    (function() {
      var emptyTrashButton = document.createElement('a');
      emptyTrashButton.id = "empty-trash";
      emptyTrashButton.textContent = "Empty trash";
      emptyTrashButton.classList.add('hidden');
	  emptyTrashButton.classList.add('button');
      emptyTrashButton.classList.add('green');
      emptyTrashButton.setAttribute('data-require', "network");
      emptyTrashButton.setAttribute('data-name', "empty-trash");
      emptyTrashButton.addEventListener('click', Plugsbee.layout.emptyTrash);
      Plugsbee.layout.emptyTrashButton = document.querySelector('div.right').appendChild(emptyTrashButton);
    })();

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
      trash.miniature = Plugsbee.layout.themeFolder + 'folders/user-trash.png';
      trash.elm.classList.add('trash');
      trash.elm.addEventListener('click', function(e) {
        e.preventDefault();
        history.pushState(null, null, this.firstChild.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
      }, true);
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
        evt.preventDefault();
        this.classList.remove('dragenter');
        var id = evt.dataTransfer.getData('text/plain');
        if (!id)
          return;

        var file = Plugsbee.files[id];
        var folder = Plugsbee.folders[id];

        var trash = Plugsbee.folders['trash']
        
        if (folder)
          folder.moveToTrash();
        else if (file) {
          file.move(trash);
          document.getElementById('dock').hidden = true;
          
        if (Object.keys(trash.files).length)
          trash.thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/user-trash-full.png';
        }
      });
      trash.elm = document.getElementById('folders').appendChild(trash.elm);
      //Panel
      var panel = new Widget.Panel();
      panel.elm.classList.add('trash');
      panel.elm.setAttribute('data-name', 'trash');
      panel.elm = document.getElementById('deck').appendChild(panel.elm);
    })();

    //
    //File picker
    //
    var filePicker = document.getElementById('file-picker');
    filePicker.addEventListener('change', function upload(evt) {
      var files = evt.target.files;

      var folder = Plugsbee.layout.currentFolder;

      Plugsbee.layout.upload(files, folder);
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
      location.pathname = '/';
      //~ location.reload();
      //~ Plugsbee.connection.connect(login, password);
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
    thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/folder.png';
    thumbnail.elm.addEventListener('mouseenter', function() {
      this.querySelector('img').src = Plugsbee.layout.themeFolder + 'folders/folder-open.png';
    });
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
        pbFolder.id = name;
        pbFolder.host = gConfiguration.PubSubService;
        Plugsbee.layout.drawFolder(pbFolder);


        Plugsbee.remote.newFolder(pbFolder);

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
    thumbnail.elm.querySelector('input').focus();
  },
  showWelcome: function() {
    document.body.style.backgroundColor = 'white';

    //Header
    this.navButton.elm.hidden = true;
    this.emptyTrashButton.hidden = true;
    this.editFoldersButton.hidden = true;
    this.editFilesButton.hidden = true;
    //Title
    this.contextTitle.value = gConfiguration.name;
    this.contextTitle.editable = false;

    this.deck.selectedPanel = Plugsbee.username;
  },
  showLogin: function() {
    document.body.style.backgroundColor = 'white';

    //Header
    this.leftHeader.selectedItem = '';
    this.rightHeader.selectedItem = '';

    //Title
    this.contextTitle.value = gConfiguration.name;
    this.contextTitle.editable = false;

    this.deck.selectedPanel = 'login';
  },
  showAccount: function() {
    document.body.style.backgroundColor = 'white';

    //Header
    this.leftHeader.selectedItem = 'folders';
    this.rightHeader.selectedItem = '';

    //Title
    this.contextTitle.value = Plugsbee.username;
    this.contextTitle.editable = false;

    this.deck.selectedPanel = 'account';
  },
  showFolders: function() {
    document.body.style.backgroundColor = 'white';
    //Move the folders thumbnails to their original location
    var folders = document.querySelector('section[data-name="folders"]').appendChild(document.getElementById('folders'));
    //Unhide the current folder
    if (Plugsbee.layout.currentFolder.thumbnail)
      Plugsbee.layout.currentFolder.thumbnail.elm.hidden = false;
    //~ folders.hidden = true;
    folders.parentNode.classList.add('panel');

    for (var i in Plugsbee.folders) {
      var folder = Plugsbee.folders[i];
      if(!folder.trash) {
        folder.thumbnail.draggable = true;
        folder.thumbnail.dropbox = false;
      }
    }

    //Header
    if (Plugsbee.connection.anonymous)
      this.leftHeader.selectedItem = 'login';
    else
      this.leftHeader.selectedItem = 'account';
  
    this.rightHeader.selectedItem = 'edit-folders';

    //Title
    this.contextTitle.value = gConfiguration.name;
    this.contextTitle.editable = false;

    this.deck.selectedPanel = 'folders';
  },
  showFolder: function(aFolder) {
    Plugsbee.layout.deck.selectedPanel = 'folders';
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
    folders.parentNode.classList.remove('panel');
    folders.hidden = false;
    //Hide the current folder
    aFolder.thumbnail.elm.hidden = true;
    //Hide the folder adder for the moment
    //~ gUserInterface.hidden = true;

    //Header
    this.leftHeader.selectedItem = 'folders';
    this.rightHeader.selectedItem = 'edit-files';
    //Title
    this.contextTitle.value = aFolder.name;
    this.contextTitle.editable = true;
    this.contextTitle.onsubmit = function(value) {
      aFolder.rename(value);
    };
    Plugsbee.layout.deck.selectedPanel = aFolder.id;


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
    Plugsbee.folders['trash'].thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/user-trash.png';
  },
  showTrash: function() {
    var aFolder = Plugsbee.folders['trash'];
    Plugsbee.layout.deck.selectedPanel = 'folders';
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
    //~ Plugsbee.layout.hidden = true;

    //Header
    this.leftHeader.selectedItem = 'folders';
    this.rightHeader.selectedItem = 'empty-trash';
    //Title
    this.contextTitle.value = 'Trash';
    this.contextTitle.editable = false;

    Plugsbee.layout.deck.selectedPanel = 'trash';


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
  logOut: function() {
    localStorage.removeItem("login");
    localStorage.removeItem("password");
    Plugsbee.connection.disconnect();
    window.location.assign('/');
  },
  upload: function(aFiles, aFolder) {
    for (var i = 0; i < aFiles.length; i++) {
      var id = Math.random().toString().split('.')[1];
      var pbFile = Object.create(Plugsbee.File);


      pbFile.name = aFiles[i].name;
      pbFile.folder = aFolder;
      pbFile.id = id;
      pbFile.type = aFiles[i].type;
      Plugsbee.layout.drawFile(pbFile);

      switch (pbFile.type) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/gif':
        case 'image/svg+xml':
          Plugsbee.layout.setFileMiniature(pbFile, aFiles[i]);
          break;
        default:
          Plugsbee.layout.setFileMiniature(pbFile, gConfiguration.themeFolder + 'files/empty.png');
      }

      Plugsbee.remote.uploadFile(pbFile, aFiles[i],
        function(aPbFile, progression) {
          aPbFile.thumbnail.label = Math.round(progression)+'%';
        },
        function(pbFile, answer) {
          pbFile.fileURL = answer.src;
          pbFile.thumbnail.draggable = true;
          pbFile.thumbnail.label = pbFile.name;
          Plugsbee.files[pbFile.id] = pbFile;
          pbFile.folder.files[pbFile.id] = pbFile;

          Plugsbee.remote.newFile(pbFile);

        }
      );
    }
  }
};

//
// Listen for popstate event
//
//The setTimeout avoid to handle the initial popstate event
window.setTimeout(function() {
  window.addEventListener("popstate", Plugsbee.layout.handlePath, false);
}, 1000);

//
//
//
(function() {
  // Theme
  gConfiguration.themeFolder = 'themes/'+gConfiguration.theme+'/';
  var link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = gConfiguration.themeFolder + 'style.css';
  var sheet = document.head.appendChild(link);

  //Application cache stuff
  function handleCacheEvent(e) {
    console.log('application cache: ' + e.type);
  }
  function handleCacheError(e) {
    console.log('application cache: ' + e.type);
  };
  // Fired after the first cache of the manifest.
  window.applicationCache.addEventListener('cached', handleCacheEvent, false);
  // Checking for an update. Always the first event fired in the sequence.
  window.applicationCache.addEventListener('checking', handleCacheEvent, false);
  // An update was found. The browser is fetching resources.
  window.applicationCache.addEventListener('downloading', handleCacheEvent, false);
  // The manifest returns 404 or 410, the download failed,
  // or the manifest changed while the download was in progress.
  window.applicationCache.addEventListener('error', handleCacheError, false);
  // Fired after the first download of the manifest.
  window.applicationCache.addEventListener('noupdate', handleCacheEvent, false);
  // Fired if the manifest file returns a 404 or 410.
  // This results in the application cache being deleted.
  window.applicationCache.addEventListener('obsolete', handleCacheEvent, false);
  // Fired for each resource listed in the manifest as it is being fetched.
  window.applicationCache.addEventListener('progress', handleCacheEvent, false);
  // Fired when the manifest resources have been newly redownloaded.
  window.applicationCache.addEventListener('updateready', handleCacheEvent, false);

  // Document title
  document.title = gConfiguration.name;

  // Favicon
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="icon" type="image/png" sizes="16x16" href="'+gConfiguration.themeFolder+'icons/16x16.png"/>'
  );

  // iOS stuff
  //
  // Icons //FIXME: This should works for Android
  //
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="apple-touch-icon" href="' + gConfiguration.themeFolder+'icons/57x57.png"/>' +
    '<link rel="apple-touch-icon" sizes="72x72" href="'+gConfiguration.themeFolder+'icons/72x72.png"/>' +
    '<link rel="apple-touch-icon" sizes="114x114" href="'+gConfiguration.themeFolder+'icons/114x114.png"/>'
  );

  //
  // iOS web-app
  //
  //~ document.head.insertAdjacentHTML('beforeend',
    //~ '<meta name="apple-mobile-web-app-capable" content="yes"/>' +
    //~ '<meta name="apple-mobile-web-app-status-bar-style" content="black"/>'
  //~ );

  // FIXME add startup image -- 1004*768 for ipad and 320 x 460 for ipod portrait for both
  /*document.head.insertAdjacentHTML('beforeend',
    '<link rel="apple-touch-startup-image" href="/startup.png">'
  );*/
})();

window.addEventListener('load', function() {
  //Check support for input type="file"
  function inputTypeFileSupport() {
    var input = document.createElement('input');
    input.type = 'file';
    return !input.disabled;
  }
  //Hide upload stuff
  if (!inputTypeFileSupport()) {
    document.styleSheets[0].insertRule(
      '.upload, #upload-button, [data-require="upload"], #folder-adder {' +
        'display: none !important;' +
      '}',
    0);
  }
});
