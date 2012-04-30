'use strict';

Plugsbee.layout = {
  handlePath: function() {
    var path = decodeURIComponent(location.pathname).split('/');
    path.shift();
    Plugsbee.layout.route(path, location.search);
  },
  route: function(aPath, aOptions) {
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
      case 'register':
        Plugsbee.layout.showRegister();
        break;
      default:
        var folder = Plugsbee.folders[aPath[1]];
        if (folder) {
          if (aOptions === "?edit")
            Plugsbee.layout.showFolderEdit(folder);
          else 
            Plugsbee.layout.showFolder(folder);
          return;
        }
        
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
    //Thumbnail
    var thumbnail = document.createElement('li');
    thumbnail.setAttribute('data-type', 'folder');
    thumbnail.setAttribute('data-id', aPbFolder.id);
    thumbnail.classList.add('thumbnail', 'folder');
    thumbnail.innerHTML =
      "<a href='" +
        encodeURIComponent(Plugsbee.username) +
        '/' +
        encodeURIComponent(aPbFolder.name) +
      "'>"+
        "<figure>"+
          "<img class='miniature noshadow' src='" +
            Plugsbee.layout.themeFolder +
              'folders/folder.png' +
          "'/>"+
          "<figcaption class='label'/>"+
        "</figure>"+
      "</a>"+
      "<menu>"+
        "<ul>"+
          "<li><span hidden='hidden' class='edit'>X</span>"+
            "<ul id='voletMenu' hidden='hidden'>"+
              "<li>Rename</li>"+
              "<li>Delete</li>"+
            "</ul>"+
          "</li>"+
        "</ul>"+
      "</menu>";
    thumbnail.querySelector('.label').textContent = aPbFolder.name;
    thumbnail.addEventListener('mouseover', function(e) {
      this.querySelector('span.edit').hidden = false;
    }, false);
    thumbnail.addEventListener('mouseout', function(e) {
      var menu = this.querySelector('ul#voletMenu');
      if (menu.hidden)
        this.querySelector('span.edit').hidden = true;
    }, false);
    thumbnail.addEventListener('click', function(e) {
      if (e.target.tagName === "span") {
        var menu = this.querySelector('ul#voletMenu');
        menu.hidden = !menu.hidden;
      }
    }, true);
    thumbnail.addEventListener('click', function(e) {
      if (e.target.tagName === "span") {
        e.preventDefault();
      }
      else {
        e.preventDefault();
        history.pushState(null, null, this.firstChild.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
      }
    }, true);
    aPbFolder.thumbnail = thumbnail;

    //Panel
    var panel = document.createElement('ul');
    panel.setAttribute('data-name', aPbFolder.id);
    panel.classList.add('hidden');
    panel.addEventListener('mousewheel', function(e) {
      if (e.wheelDeltaY)
        this.scrollTop = this.scrollTop-Math.round((e.wheelDeltaY/60)*30);
    });
    panel.addEventListener('DOMMouseScroll', function(e) {
      this.scrollTop = this.scrollTop-Math.round((e.detail/2)*30);
    });
    panel.addEventListener('drop', function(e) {
      e.preventDefault();
      var pbFolderId = this.getAttribute('data-name');
      var pbFolder = Plugsbee.folders[pbFolderId];
      if (e.dataTransfer.files) {
        Plugsbee.layout.upload(e.dataTransfer.files, pbFolder);
      }
    });
    panel.addEventListener('dragover', function(e) {
      e.preventDefault();
    });
    aPbFolder.panel = panel;

    //Title
    var title = document.createElement('span');
    title.textContent = aPbFolder.name;
    title.setAttribute('data-name', aPbFolder.id);
    title.classList.add('hidden');
    aPbFolder.title = title;
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
    }
    else {
      //Thumbnail
      var folders = document.getElementById('folders');
      aPbFolder.thumbnail = folders.insertBefore(aPbFolder.thumbnail, folders.children[1]);
      //Panel
      var deck = document.getElementById('deck');
      aPbFolder.panel = deck.appendChild(aPbFolder.panel);
      //Title
      var middle = document.querySelector('div.middle');
      aPbFolder.title = middle.appendChild(aPbFolder.title);
    }
  },
  eraseFolder: function(aFolder) {
    aFolder.panel.elm.parentNode.removeChild(aFolder.panel.elm);
    aFolder.thumbnail.elm.classList.add('fadeOut');
    aFolder.thumbnail.elm.addEventListener('webkitAnimationEnd', function(e) {
      this.parentNode.removeChild(this);
    });
    aFolder.thumbnail.elm.addEventListener('animationend', function(e) {
      this.parentNode.removeChild(this);
    });
    
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
    //Thumbnail
    var thumbnail = document.createElement('li');
    thumbnail.setAttribute('data-type', 'file');
    thumbnail.setAttribute('data-id', aPbFile.id);
    thumbnail.classList.add('thumbnail', 'file', 'fadeIn');
    thumbnail.innerHTML =
      "<a href='" + aPbFile.fileURL + "'>"+
        "<figure>"+
          "<img class='miniature'/>"+
          "<figcaption class='label'/>"+
        "</figure>"+
      "</a>"+
      "<menu>"+
        "<ul>"+
          "<li><span hidden='hidden' class='edit'>X</span>"+
            "<ul id='voletMenu' hidden='hidden'>"+
              "<li>Rename</li>"+
              "<li>Delete</li>"+
            "</ul>"+
          "</li>"+
        "</ul>"+
      "</menu>";
    thumbnail.querySelector('.label').textContent = aPbFile.name;

    if (!aPbFile.miniatureURL) {
      var category = Plugsbee.mimetypes[aPbFile.type];
      if (!category)
        category = "empty";
      thumbnail.querySelector('.miniature').src = gConfiguration.themeFolder + 'files/' + category + '.png';
      thumbnail.querySelector('.miniature').classList.add('noshadow');
    }
    else {
      thumbnail.querySelector('.miniature').src = aPbFile.miniatureURL;
    }
    
    thumbnail.addEventListener('mouseover', function(e) {
      this.querySelector('span.edit').hidden = false;
    }, false);
    thumbnail.addEventListener('mouseout', function(e) {
      var menu = this.querySelector('ul#voletMenu');
      if (menu.hidden)
        this.querySelector('span.edit').hidden = true;
    }, false);
    thumbnail.addEventListener('click', function(e) {
      if (e.target.tagName === "span") {
        var menu = this.querySelector('ul#voletMenu');
        menu.hidden = !menu.hidden;
      }
    }, false);
    aPbFile.thumbnail = thumbnail;
  },
  drawFile: function(aPbFile) {
    this.buildFile(aPbFile);
    this.handleFile(aPbFile);
  },
  eraseFile: function(aPbFile) {
    aPbFile.thumbnail.elm.classList.remove('fadeIn');
    aPbFile.thumbnail.elm.classList.add('fadeOut');
    //FIXME why 2 catched animation event?
    aPbFile.thumbnail.elm.addEventListener('webkitAnimationEnd', function(e) {
      this.parentNode.removeChild(this);
      delete aPbFile.thumbnail;
    });
    aPbFile.thumbnail.elm.addEventListener('animationend', function(e) {
      this.parentNode.removeChild(this);
      delete aPbFile.thumbnail;
    });
  },
  handleFile: function(aPbFile) {
    var panel = aPbFile.folder.panel;
    aPbFile.thumbnail = panel.insertBefore(aPbFile.thumbnail, panel.firstChild);
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
      Plugsbee.layout.deck = deck;
    })();

    //
    //Folders panel
    //
    (function() {
      var folders = document.querySelector('section[data-name="folders"]');
      folders.addEventListener('mousewheel', function(e) {
        if (e.wheelDeltaY)
          this.scrollTop = this.scrollTop-Math.round((e.wheelDeltaY/60)*30);
      });
      folders.addEventListener('DOMMouseScroll', function(e) {
        this.scrollTop = this.scrollTop-Math.round((e.detail/2)*30);
      });
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
    //Middle header
    //
    (function() {
      var stack = Object.create(SWStack);
      stack.rootElement = document.querySelector('div.middle');
      Plugsbee.layout.middleHeader = stack;
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
      var elm = document.createElement('span');
      elm.textContent = gConfiguration.name;
      elm.setAttribute('data-name', 'title');
      Plugsbee.layout.middleHeader.rootElement.appendChild(elm);
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
      accountMenu.textContent = '◀ Account';
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
    //Folder adder
    //
    (function() {
    
      var thumbnail = document.getElementById('folderAdder');
      thumbnail.querySelector('.miniature').src = Plugsbee.layout.themeFolder + 'folders/folder.png';

      thumbnail.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        var name = this.elements.name.value;
        if (name) {
          var pbFolder = Plugsbee.createFolder();

          thumbnail.hidden = true;
          this.reset();

          pbFolder.name = name;
          pbFolder.id = name;
          pbFolder.host = gConfiguration.PubSubService;
          Plugsbee.layout.drawFolder(pbFolder);


          Plugsbee.remote.newFolder(pbFolder);

          Plugsbee.folders[pbFolder.id] = pbFolder;
        }
        else {
          var cancelEvent = document.createEvent('CustomEvent');
          cancelEvent.initCustomEvent('cancel', false, false, false);
          this.dispatchEvent(cancelEvent); 
        }
      });
      thumbnail.addEventListener('webkitAnimationEnd', function(e) {
        if (e.animationName === 'fadeout')
          this.hidden = true;
      });
      thumbnail.addEventListener('animationend', function(e) {
        if (e.animationName === 'fadeout')
          this.hidden = true;
      });
      thumbnail.querySelector('form').elements.name.addEventListener('blur', function() {
        var cancelEvent = document.createEvent('CustomEvent');
        cancelEvent.initCustomEvent('cancel', false, false, false);
        thumbnail.querySelector('form').dispatchEvent(cancelEvent); 
      });
      thumbnail.querySelector('form').addEventListener('cancel', function(e) {
        Plugsbee.layout.folderAdder.classList.add('fadeOut');
        Plugsbee.layout.folderAdder.classList.remove('fadeIn');
        this.reset();
      });

      var folders = document.getElementById('folders');
      thumbnail.querySelector('input').focus();

      Plugsbee.layout.folderAdder = thumbnail;
    })();
  
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
      addFolderButton.addEventListener('click', Plugsbee.layout.showFolderAdder);
      Plugsbee.layout.addFolderButton = document.querySelector('div.right').appendChild(addFolderButton);
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
      Plugsbee.layout.addFileButton = document.querySelector('div.right').appendChild(addFileButton);
    })();

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
      var thumbnail = document.querySelector('#folders > .trash');
      thumbnail.querySelector('.miniature').src = Plugsbee.layout.themeFolder + 'folders/user-trash.png';
      thumbnail.addEventListener('click', function(e) {
        e.preventDefault();
        history.pushState(null, null, this.firstChild.href);
        var event = document.createEvent('Event');
        event.initEvent('popstate', true, true);
        window.dispatchEvent(event);
      }, true);
      thumbnail.addEventListener('dragenter', function(evt) {
        this.classList.add('dragenter');
      });
      thumbnail.addEventListener('dragover', function(evt) {
        this.classList.add('dragenter');
        evt.preventDefault()
      });
      thumbnail.addEventListener('dragleave', function(evt) {
        this.classList.remove('dragenter');
      });
      thumbnail.addEventListener('drop', function(evt) {
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
          
        if (Object.keys(trash.files).length)
          trash.thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/user-trash-full.png';
        }
      });
      //Panel
      var panel = document.querySelector('#deck > .trash');
      panel.addEventListener('mousewheel', function(e) {
        this.scrollTop = this.scrollTop-Math.round(e.wheelDelta);
      });
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
    (function() {
      var loginForm = document.getElementById("login-form");
      loginForm.onsubmit = function(e) {
        e.preventDefault();
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
      };
    })();
    
    //Account form
    (function() {
      var accountForm = document.getElementById("account-form");
      accountForm.onsubmit = function(e) {
        e.preventDefault();
        var name = this.elements["name"].value;
        var email = this.elements["email"].value;

        var pbProfile = {
          name: name,
          email: email
        };

        Plugsbee.remote.setProfile(pbProfile);
      }

      Plugsbee.layout.accountForm = accountForm;
    })();

    //Registration form
    var registerForm = document.getElementById("register-form");
    registerForm.onsubmit = function(aEvent) {
      alert('coming soon');
      return;
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
  showFolderAdder: function() {
    Plugsbee.layout.folderAdder.classList.add('fadeIn');
    Plugsbee.layout.folderAdder.classList.remove('fadeOut');
    Plugsbee.layout.folderAdder.hidden = false;
    Plugsbee.layout.folderAdder.querySelector('input').focus();
  },
  showWelcome: function() {
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
    //Header
    this.leftHeader.selectedChild = 'folders';
    this.rightHeader.selectedChild = '';
    this.rightHeader.selectedChild = 'title';

    this.deck.selectedPanel = 'login';
  },
  showRegister: function() {
    //Header
    this.leftHeader.selectedChild = 'folders';
    this.rightHeader.selectedChild = '';
    this.rightHeader.selectedChild = 'title';

    this.deck.selectedPanel = 'register';
  },
  showAccount: function() {
    //Header
    this.leftHeader.selectedChild = 'folders';
    this.rightHeader.selectedChild = '';
    this.middleHeader.selectedChild = 'account';

    this.deck.selectedChild = 'account';
  },
  showFolders: function() {
    //Header
    if (Plugsbee.connection.anonymous)
      this.leftHeader.selectedChild = 'login';
    else
      this.leftHeader.selectedChild = 'account';
    this.rightHeader.selectedChild = 'add-folder';
    this.middleHeader.selectedChild = 'title';

    this.deck.selectedChild = 'folders';
  },
  showFolder: function(aFolder) {
    this.deck.selectedChild = 'folders';

    //Header
    this.leftHeader.selectedChild = 'folders';
    this.rightHeader.selectedChild = 'add-files';
    this.middleHeader.selectedChild = aFolder.id;

    Plugsbee.layout.deck.selectedChild = aFolder.id;

    this.currentFolder = aFolder;
  },
  updateFolderEditPanel: function(aPbFolder) {
    var deleteFolderButton = document.getElementById('delete-folder-button');
    deleteFolderButton.onclick = function() {
      aPbFolder.moveToTrash();
      document.querySelector('div.left > a[data-name="folders"]').click();
    };
  },
  emptyTrash: function() {
    Plugsbee.folders['trash'].purge();
    Plugsbee.folders['trash'].thumbnail.miniature = Plugsbee.layout.themeFolder + 'folders/user-trash.png';
  },
  showTrash: function() {
    var aFolder = Plugsbee.folders['trash'];
    Plugsbee.layout.deck.selectedPanel = 'folders';

    //Header
    this.leftHeader.selectedChild = 'folders';
    this.rightHeader.selectedItem = 'empty-trash';
    this.middleHeader.selectedItem = 'trash';

    this.deck.selectedPanel = 'trash';

    this.currentFolder = aFolder;
  },
  logOut: function() {
    localStorage.removeItem("login");
    localStorage.removeItem("password");
    Plugsbee.connection.disconnect();
    window.location.assign('/');
  },
  upload: function(aFiles, aPbFolder) {
    for (var i = 0; i < aFiles.length; i++) {
      console.log(aFiles[i].type);
      var id = Math.random().toString().split('.')[1];
      var file = aFiles[i];
      var pbFile = Object.create(Plugsbee.File);
      pbFile.name = aFiles[i].name;
      pbFile.folder = aPbFolder;
      pbFile.id = id;
      pbFile.type = aFiles[i].type;
      Plugsbee.layout.drawFile(pbFile);

      switch (pbFile.type) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/gif':
        case 'image/svg+xml':
          //generate a miniatur
          resizeImage(aFiles[i], 80, 80, function(canvas) {
            //use it as a thumbnail
            Plugsbee.layout.setFileMiniature(pbFile, canvas);

            canvas.toBlob(function(blob) {
              //upload the thumbnail
              Plugsbee.remote.uploadFile(pbFile, blob,
                //on progress
                null,
                //on success
                function(pbFile, answer) {
                  var img = document.createElement('img');
                  img.onload = function() {
                    Plugsbee.layout.setFileMiniature(pbFile, img);
                  }
                  img.src = answer.src;
                  
                  pbFile.miniatureURL = answer.src;
                  //upload the original file
                  Plugsbee.remote.uploadFile(pbFile, file,
                    //on progress
                    function(aPbFile, progression) {
                      aPbFile.thumbnail.label = Math.round(progression)+'%';
                    },
                    //on success
                    function(pbFile, answer) {
                      console.log(answer);
                      pbFile.fileURL = answer.src;
                      pbFile.thumbnail.href = answer.src;
                      pbFile.thumbnail.draggable = true;
                      pbFile.thumbnail.label = pbFile.name;
                      Plugsbee.files[pbFile.id] = pbFile;
                      pbFile.folder.files[pbFile.id] = pbFile;

                      Plugsbee.remote.newFile(pbFile);

                    }
                  );
                }
              );
            });
          });
          break;
        default:
          //upload the original file
          Plugsbee.remote.uploadFile(pbFile, file,
            //on progress
            function(aPbFile, progression) {
              aPbFile.thumbnail.label = Math.round(progression)+'%';
            },
            //on success
            function(pbFile, answer) {
              console.log(answer);
              pbFile.fileURL = answer.src;
              pbFile.thumbnail.href = answer.src;
              pbFile.thumbnail.draggable = true;
              pbFile.thumbnail.label = pbFile.name;
              Plugsbee.files[pbFile.id] = pbFile;
              pbFile.folder.files[pbFile.id] = pbFile;

              Plugsbee.remote.newFile(pbFile);

            }
          );
      }
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

  // Title
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
  //Title
  document.querySelector('[data-name="title"]').textContent = gConfiguration.name;
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
