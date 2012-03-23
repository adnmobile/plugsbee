'use strict';

Plugsbee.remote = {
  getFolders: function(aOnSuccess) {
    Plugsbee.connection.disco.items(Plugsbee.connection.jid.bare, function(stanza) {
      var pbFolders = {};
      stanza.items.forEach(function(item) {
        if (!item.node.match('urn:plugsbee:folder:'))
          return;
          
        
        var pbFolder = Plugsbee.createFolder();
        pbFolder.id = item.node.split('urn:plugsbee:folder:')[1];
        pbFolder.host = item.jid;
        pbFolder.name = item.name;
        pbFolder.files = {};

        pbFolders[pbFolder.id] = pbFolder;
      });
      if (aOnSuccess)
        aOnSuccess(pbFolders);
    });
  },
  getFiles: function(aPbFolder, aOnSuccess) {
    Plugsbee.connection.pubsub.items(aPbFolder.host, 'urn:plugsbee:folder:' + aPbFolder.id, function(stanza) {
      var pbFiles = {};
      stanza.items.forEach(function(item) {

        var pbFile = Plugsbee.createFile();
        pbFile.id = item.id;
        pbFile.type = item.type;
        pbFile.fileURL = item.src;
        pbFile.name = item.name;
        pbFile.folderId = aPbFolder.id;
    
        pbFiles[pbFile.id] = pbFile;
      });
      if (aOnSuccess)
        aOnSuccess(pbFiles);
    });
  },
  newFolder: function(aFolder, onSuccess) {
    if(!aFolder.id)
      aFolder.id = Math.random().toString().split('.')[1];
    if(!aFolder.host)
      aFolder.host = gConfiguration.PubSubService;
      
    var fields = [
      "<field var='pubsub#title'><value>"+aFolder.name+"</value></field>",
      "<field var='pubsub#access_model'><value>whitelist</value></field>",
      "<field var='pubsub#persist_items'><value>1</value></field>"
    ];
    
    
    Plugsbee.connection.pubsub.create(aFolder.host, 'urn:plugsbee:folder:'+aFolder.id, fields, function() {
      if(onSuccess)
        onSuccess(aFolder);
    });
  },
  deleteFolder: function(aFolder) {
    Plugsbee.connection.pubsub['delete'](aFolder.host, 'urn:plugsbee:folder:'+aFolder.id);
  },
  renameFolder: function(aFolder) {
    var fields = [
      "<field var='pubsub#title'><value>"+aFolder.name+"</value></field>"
    ];

    Plugsbee.connection.pubsub.configure(gConfiguration.PubSubService, 'urn:plugsbee:folder:'+aFolder.id, fields);
  },
  newFile: function(aPbFile, aOnSuccess) {
    //~ if(aFile.miniature)
      //~ var entry = "<entry xmlns='http://www.w3.org/2005/Atom'><title>" + aPbFile.name + "</title><content src='"+aFile.src+"' type='"+aFile.type+"'/><link rel='preview' type='image/png' href='" + aPbFile.miniature+"'/></entry>";
      //~ var entry = "<entry xmlns='http://www.w3.org/2005/Atom'><title>" + aPbFile.name + "</title><content src='"+aPbFile.fileURL+"' type='"+aPbFile.type+"'/></entry>";
    //~ else
    var entry = "<entry xmlns='http://www.w3.org/2005/Atom'><title>"+aPbFile.name+"</title><content src='"+aPbFile.fileURL+"' type='"+aPbFile.type+"'/></entry>";

    Plugsbee.connection.pubsub.publish(aPbFile.folder.host, 'urn:plugsbee:folder:'+aPbFile.folder.id, entry, aPbFile.id);
  },
  deleteFile: function(aPbFile, aOnSuccess) {
    Plugsbee.connection.pubsub.retract(aPbFile.folder.host, 'urn:plugsbee:folder:'+aPbFile.folder.id, aPbFile.id);
  },
  renameFile: function(aFile, aOnSuccess) {
    this.newFile(aFile, function() {
      if (aOnSuccess)
        aOnSuccess();
    });
  },
  purgeFolder: function(aPbFolder) {
    Plugsbee.connection.pubsub.purge(aPbFolder.host, 'urn:plugsbee:folder:'+aPbFolder.id);
  }
}; 


//~ Plugsbee.remote = {
  //~ getFolders: function(aOnSuccess) {
    //~ Plugsbee.connection.disco.items(Plugsbee.connection.jid.bare, function(stanza) {
      //~ var pbFolders = {};
      //~ stanza.items.forEach(function(item) {
        //~ if (!item.node.match('urn:plugsbee:folder:'))
          //~ return;
          //~ 
        //~ 
        //~ var pbFolder = Plugsbee.createFolder();
        //~ pbFolder.id = item.node.split('urn:plugsbee:folder:')[1];
        //~ pbFolder.host = item.jid;
        //~ pbFolder.name = item.name;
        //~ pbFolder.files = {};
//~ 
        //~ pbFolders[pbFolder.id] = pbFolder;
      //~ });
      //~ if (aOnSuccess)
        //~ aOnSuccess(pbFolders);
    //~ });
  //~ },
  //~ getFiles: function(aPbFolder, aOnSuccess) {
    //~ Plugsbee.connection.pubsub.items(aPbFolder.host, 'urn:plugsbee:folder:' + aPbFolder.id, function(stanza) {
      //~ var pbFiles = {};
      //~ stanza.items.forEach(function(item) {
//~ 
        //~ var pbFile = Object.create(Plugsbee.File);
        //~ pbFile.id = item.id;
        //~ pbFile.type = item.type;
        //~ pbFile.fileURL = item.src;
        //~ pbFile.name = item.name;
        //~ pbFile.folderId = aPbFolder.id;
        //~ 
        //~ pbFiles[pbFile.id] = pbFile;
      //~ });
      //~ if (aOnSuccess)
        //~ aOnSuccess(pbFiles);
    //~ });
  //~ },
//~ };
//~ 
