'use strict';

Plugsbee.remote = {
  getProfile: function(aOnSuccess) {
    Plugsbee.connection.vcard.get(Plugsbee.connection.jid.bare, function(vcard) {
      var pbProfile = {
        name: '',
        email: ''
      };
      var nameElm = vcard.getElementsByTagName('FN')[0];
      if (nameElm)
        pbProfile.name = nameElm.textContent;

      var emailElm = vcard.getElementsByTagName('USERID')[0];
      if (emailElm)
        pbProfile.email = emailElm.textContent;

      if (aOnSuccess)
        aOnSuccess(pbProfile);
    });
  },
  setProfile: function(aPbProfile, aOnSuccess) {
    var fields = [
      '<FN>' + aPbProfile.name + '</FN>',
      '<EMAIL><INTERNET/><PREF/><USERID>' + aPbProfile.email + '</USERID></EMAIL>'
    ];
    Plugsbee.connection.vcard.set(fields, function(stanza) {
      if (aOnSuccess)
        aOnSuccess();
    });
  },
  getFolders: function(pbHost, aOnSuccess) {
    Plugsbee.connection.disco.items(pbHost.id + '@plugsbee.com',
      //on success
      function(stanza) {
        var pbFolders = {};
        stanza.items.forEach(function(item) {
          if (!item.node.match('urn:plugsbee:folder:')) return;
          
          var pbFolder = Plugsbee.createFolder();
          pbFolder.id = item.node.split('urn:plugsbee:folder:')[1];
          pbFolder.host = pbHost;
          pbFolder.name = pbFolder.id;
          pbFolder.files = {};

          pbFolders[pbFolder.id] = pbFolder;
        });
        //~ if(!pbFolders['trash']) {
          //~ var pbFolder = Plugsbee.createFolder();
          //~ pbFolder.id = 'trash';
          //~ pbFolder.name = 'Trash';
          //~ pbFolders['trash'] = pbFolder;
        //~ 
          //~ Plugsbee.remote.newFolder(pbFolder, function() {
            //~ if (aOnSuccess)
              //~ aOnSuccess(pbFolders);
          //~ });
        //~ }
        if (aOnSuccess)
          aOnSuccess(pbFolders);
      }
    );
  },
  getFiles: function(aPbFolder, aOnSuccess) {
    Plugsbee.connection.pubsub.items(
      aPbFolder.host.id + '@plugsbee.com',
      'urn:plugsbee:folder:' + aPbFolder.id,
      undefined,
      function(stanza) {
        var pbFiles = {};
        for (var i = 0; i < stanza.items.length; i++) {
          var node = stanza.items[i];
          
          var pbFile = Plugsbee.createFile();
          pbFile.id = node.getAttribute('id');
          pbFile.type = node.querySelector('content').getAttribute('type');
          pbFile.fileURL = node.querySelector('content').getAttribute('src');
          pbFile.name = pbFile.id;
          pbFile.folderId = aPbFolder.id;
          pbFile.folder = aPbFolder;

          var preview = node.querySelector('link');
          if (preview)
            pbFile.miniatureURL = preview.getAttribute('src');

          pbFiles[pbFile.id] = pbFile;
        };
        if (aOnSuccess)
          aOnSuccess(pbFiles);
      }
    );
  },
  getFolder: function(aPbHost, aFolder, aOnSuccess) {
    var pbFolder = Plugsbee.createFolder();
    pbFolder.id = aFolder;
    pbFolder.host = aPbHost;
    pbFolder.name = aFolder;
    pbFolder.files = {};
    this.getFiles(pbFolder, function(pbFiles) {
      pbFolder.files = pbFiles;
      if (aOnSuccess)
        aOnSuccess(pbFolder);
    });
  },
  newFolder: function(aPbFolder, onSuccess) {      
    var fields = [
      "<field var='pubsub#access_model'><value>open</value></field>",
      "<field var='pubsub#persist_items'><value>1</value></field>",
      "<field var='pubsub#max_items'><value>100</value></field>"
    ];
    
    Plugsbee.connection.pubsub.create(
      aPbFolder.host.id + '@plugsbee.com',
      'urn:plugsbee:folder:' + aPbFolder.id, fields,
      function() {
        if(onSuccess)
          onSuccess(aPbFolder);
    });
  },
  deleteFolder: function(aPbFolder, aOnSuccess) {
    Plugsbee.connection.pubsub['delete'](
      aPbFolder.host.id + '@plugsbee.com',
      'urn:plugsbee:folder:' + aPbFolder.id,
      //on success
      function() {
        if (aOnSuccess)
          aOnSuccess();
      }
    );
  },
  //~ renameFolder: function(aPbFolder, aNewName, aOnSuccess) {
    //~ var oldName = aPbFolder.id;
    //~ aPbFolder.id = aNewName;
//~ 
    //~ //create the folder
    //~ this.newFolder(aPbFolder, function() {
      //~ console.log(Object.keys(aPbFolder.files));
      //~ return;
      //~ for (var i in aPbFolder.files)
        //~ aPbFolder.files[i].move(aPbFolder);
        //~ 
      //~ //delete the folder
      //~ aPbFolder.id = oldName;
      //~ Plugsbee.remote.deleteFolder(aPbFolder, function() {
        //~ aPbFolder.id = aNewName;
        //~ if (aOnSuccess) {
          //~ aOnSuccess(aPbFolder);
        //~ }
      //~ });
      //~ aPbFolder.id = aNewName;
    //~ });
  //~ },
  newFile: function(aPbFile, aOnSuccess) {
    var entry = 
      "<entry xmlns='http://www.w3.org/2005/Atom'>" + 
        "<title>" + aPbFile.name + "</title>" +
        "<content src='" + aPbFile.fileURL + "' type='" + aPbFile.type + "'/>";
    if (aPbFile.miniatureURL)
      entry += '<link rel="preview" src="' + aPbFile.miniatureURL + '"/>';
      
    entry += "</entry>";
          
    Plugsbee.connection.pubsub.publish(
      aPbFile.folder.host.id + '@plugsbee.com',
      'urn:plugsbee:folder:'+aPbFile.folder.id, entry, aPbFile.id);
  },
  deleteFile: function(aPbFile, aOnSuccess) {
    Plugsbee.connection.pubsub.retract(
      aPbFile.folder.host.id + '@plugsbee.com',
      'urn:plugsbee:folder:' + aPbFile.folder.id,
      aPbFile.id
    );
  },
  renameFile: function(aFile, aOnSuccess) {
    this.newFile(aFile, function() {
      if (aOnSuccess)
        aOnSuccess();
    });
  },
  purgeFolder: function(aPbFolder) {
    Plugsbee.connection.pubsub.purge(
      aPbFolder.host.id + '@plugsbee.com',
      'urn:plugsbee:folder:' + aPbFolder.id
    );
  },
  uploadFile: function(aPbFile, aFile, aOnProgress, aOnSuccess) {
    var fd = new FormData;
    fd.append(aPbFile.id + '/' + aPbFile.name, aFile);

    var xhr = new XMLHttpRequest();

    if (aOnProgress) {
      xhr.upload.addEventListener("progress",
        function(evt) {
          var progression = (evt.loaded/evt.total)*100;
          aOnProgress(aPbFile, progression);
        }, false
      );
    };

    if (aOnSuccess) {
      xhr.addEventListener("load",
        function(evt) {
          var answer = JSON.parse(evt.target.responseText);
          if (aOnSuccess)
            aOnSuccess(aPbFile, answer);
        }, false
      );
    }

    xhr.open('POST', gConfiguration.uploadService);
    xhr.send(fd);
    
    return xhr;
  },
};
