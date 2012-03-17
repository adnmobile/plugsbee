

gStorage.addFolder = function(aFolder) {
  var folder = {
    id: aFolder.id,
    host: aFolder.host,
    name: aFolder.name,
    files: {} 
  };
  fs.mkdir(folder.id, null,
    //Error
    function(error) {
      console.log(error);
    }
  );
  var folders = this.getFolders();
  folders[folder.id] = folder;
  localStorage.setItem('folders', JSON.stringify(folders));
};
gStorage.getBinaryFile = function(aPbFile, aOnSuccess, aOnError) {
  fs.getDir(aPbFile.folder.id,
    //Success
    function(aDirEntry) {
      aDirEntry.getFile(aPbFile.id, {create: false},
        //Success
        function(fileEntry) {
          fileEntry.file(function(file) {
            aOnSuccess(file);
          });
        },
        //Error
        function(error) {
          if (aOnError)
            aOnError(error);
        }
      );
    },
    //Error
    function(error) {
      console.log(error);
    }
  )
};
getBinaryMiniature = function(aPbFile, aOnSuccess, aOnError) {
  fs.getDir(aPbFile.folder.id,
    //Success
    function(aDirEntry) {
      aDirEntry.getFile('thumb_'+aPbFile.id, {create: false},
        //Success
        function(fileEntry) {
          fileEntry.file(function(file) {
            if (aOnSuccess)
              aOnSuccess(file);
          });
        },
        //Error
        function(error) {
          if (aOnError)
            aOnError(error);
        }
      );
    },
    //Error
    function(error) {
      if (aOnError)
        aOnError(error);
    }
  )
};
addBinaryFile = function(aPbFile, aOnSuccess, aOnError) {
  fs.getDir(aPbFile.folder.id,
    //Success
    function(dirEntry) {
      dirEntry.getFile(aPbFile.id, {create: true},
        //Success
        function(fileEntry) {
          fileEntry.createWriter(
            //Success
            function(fileWriter) {
              fileWriter.onwriteend = function(e) {
                if (aOnSuccess)
                  aOnSuccess();
              };
              //~ fileWriter.onwrite = function(e) {
                //~ console.log('Write.');
              //~ };
              //~ fileWriter.onerror = function(e) {
                //~ console.log('Write failed: ' + e.toString());
              //~ };

              fileWriter.write(aPbFile.file);
            },
            //Error
            function(error) {
              if (aOnError)
                aOnError(error);
            }
          )
        },
        //Error
        function(error) {
          if (aOnError)
            aOnError(error);
        }
      )
    }
  );
};
addBinaryMiniature = function(aPbFile, aOnSuccess, aOnError) {
  fs.getDir(aPbFile.folder.id,
    //Success
    function(dirEntry) {
      dirEntry.getFile('thumb_'+aPbFile.id, {create: true},
        //Success
        function(fileEntry) {
          fileEntry.createWriter(
            //Success
            function(fileWriter) {
              fileWriter.onwriteend = function(e) {
                if (aOnSuccess)
                  aOnSuccess();
              };
              //~ fileWriter.onwrite = function(e) {
                //~ console.log('Write.');
              //~ };
              //~ fileWriter.onerror = function(e) {
                //~ console.log('Write failed: ' + e.toString());
              //~ };

              fileWriter.write(aPbFile.miniature);
            },
            //Error
        function(error) {
          if (aOnError)
            aOnError(error);
        }
          )
        },
        //Error
        function(error) {
          if (aOnError)
            aOnError(error);
        }
      )
    }
  );
};

//fileURL property
Object.defineProperty(Plugsbee.File, 'fileURL', {
  configurable: true,
  enumerable:   true,
  set: function(aFileURL) {
    this._fileURL = aFileURL;
    
    var that = this;
    gStorage.getBinaryFile(this,
      //Success
      function(blob) {
        that.file = blob;
      },
      //Error
      function(error) {
        http.get(that._fileURL,
          //Success
          function(blob) {
            that.file = blob;
          },
          //Error
          function(error) {
            console.log(error);
          }
        );
      }
    );
  },
  get: function() {
    return this._fileURL;
  },
});

//file property
Object.defineProperty(Plugsbee.File, 'file', {
  configurable: true,
  enumerable:   true,
  set: function(aFile) {
    this._file = aFile;
    gStorage.addBinaryFile(this);

    if ((this.type !== 'image/jpeg') && (this.type !== 'image/png'))
      return;

    var that = this;
    gStorage.getBinaryMiniature(this,
      //Success
      function(blob) {
        that._miniature = blob;
        gInterface.setFileMiniature(that);
      },
      //Error
      function(error) {
        resizeImage(aFile, 84, 84, function(blob) {
          that.miniature = blob;
          gStorage.addBinaryMiniature(that);
        });
      }
    );
    //~ gInterface.setFileFile(this);
  },
  get: function() {
    return this._file;
  },
});

//Miniature property
Object.defineProperty(Plugsbee.File, 'miniature', {
  configurable: true,
  enumerable:   true,
  set: function(aMiniature) {
    this._miniature = aMiniature;
    gStorage.addBinaryMiniature(this);
    gInterface.setFileMiniature(this);
  },
  get: function() {
    return this._miniature;
  },
});