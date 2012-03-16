'use strict';

//window.URL
window.URL = window.webkitURL || window.URL;

//window.requestFileSystem
window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;

//window.BlobBuilder
window.BlobBuilder =
  window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

//window.storageInfo
window.storageInfo = window.storageInfo || window.webkitStorageInfo;

//
//Platform
//
var context = {
  platform: platform,
};
var app = {};

//
//Network
//
context.network = {
  _onLine: window.navigator.onLine
}
context.network.__defineGetter__("onLine", function() {
  if ((this._onLine === true) && (window.navigator.onLine == true))
    return true;
  else
    return false;
});
context.network.__defineSetter__("onLine", function(aBool) {
  if (aBool === this._onLine)
    return;

  this._onLine = aBool;
  
  if ((aBool == true)&&(app.ononline))
    app.ononline();
  else if ((aBool == false)&&(app.onoffline))
    app.onoffline();
});
window.addEventListener('offline', function() {
  if (app.ononline)
    app.ononline();
});
window.addEventListener('online', function(e) {
  if (app.onoffline)
    app.onoffline();
});

//
//FS
//
var fs = {
  getNative: function(aOnSuccess, aOnError) {
    if (this.fileSystem && aOnSuccess)
      return aOnSuccess(this.fileSystem);
    
    //~ window.webkitStorageInfo.requestQuota(window.PERMANENT, 10*1024*1024,
      //~ function(grantedBytes) {
        window.requestFileSystem(window.PERMANENT, 10*1024*1024, 
          //Success
          function(filesystem) {
            fs.fileSystem = filesystem;
            if (aOnSuccess)
              aOnSuccess(filesystem);
          },
          //Error
          function(error) {
            if (aOnError)
              aOnError(error);
          }
        );
      //~ },
      //~ //Error
      //~ function(error) {
        //~ console.log(error);
      //~ });
  },
  mkdir: function(aPath, aOnSuccess, aOnError) {
    this.getNative(
      //Success
      function(native) {
        native.root.getDirectory(aPath, {create: true},
          //Success
          function(dirEntry) {
            if (aOnSuccess)
              aOnSuccess(dirEntry);
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
        console.log(error);
      }
    );
  },
  getDir: function(aPath, aOnSuccess, aOnError) {
    this.getNative(
      //Success
      function(native) {
        native.root.getDirectory(aPath, {create: false},
          function(dirEntry) {
            aOnSuccess(dirEntry);
          },
          function(error) {
            aOnError(error);
          }
        )
      },
      //Error
      function(error) {
        console.log(error);
      }
    )
  },
};

//BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
//http
//
var http = {
  request: function(aOptions, aOnSuccess, aOnError) {
    var xhr = new XMLHttpRequest();
    xhr.open(aOptions.method, aOptions.url, true);
    
    
    
    if (((context.platform.Name === 'Chrome')&&(context.platform.version > 18)) ||
      (context.platform.Name === 'Firefox'))
      xhr.responseType = 'blob'
    else
      xhr.responseType = 'arraybuffer';
    
    
    for (var i in aOptions.headers)
      xhr.setRequestHeader(i, aOptions.headers[i]);

    xhr.onreadystatechange = function() {
      if (this.readyState === 4)
        if (this.status === 200) {
          var response;

          if (this.response instanceof Blob)
            response = this.response;
          else if (this.response instanceof ArrayBuffer) {
            var bb = new BlobBuilder();
            bb.append(this.response);

            response = bb.getBlob();
          }
          
          if(aOnSuccess)
            aOnSuccess(response);
        }
        else {
          if(aOnError)
            aOnError(this.status);
      }
    };
    xhr.send();
  },
  get: function(aOptions, aOnSuccess, aOnError) {
    if (typeof arguments[0] == 'string')
      aOptions = {method: 'get', url: arguments[0]};
    else if(typeof arguments[0] == 'object')
      aOptions.method = 'get';

    this.request(aOptions, aOnSuccess, aOnError);
  },
}

//
//Data
//
//https://github.com/blueimp/JavaScript-Canvas-to-Blob/blob/master/canvas-to-blob.js
if (!HTMLCanvasElement.prototype.toBlob) {
  HTMLCanvasElement.prototype.toBlob = function(aCallback, aType) {
    if (this.mozGetAsFile)
      return aCallback(this.mozGetAsFile('', aType));
    
    var dataURL = this.toDataURL(aType);
    aCallback(dataURItoBlob(dataURL));    
  }
};
function dataURItoBlob(dataURI) {
  var byteString,
      arrayBuffer,
      intArray,
      i,
      bb,
      mimeString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      // Convert base64 to raw binary data held in a string:
      byteString = atob(dataURI.split(',')[1]);
  } else {
      // Convert base64/URLEncoded data component to raw binary data:
      byteString = decodeURIComponent(dataURI.split(',')[1]);
  }
  // Write the bytes of the string to an ArrayBuffer:
  arrayBuffer = new ArrayBuffer(byteString.length);
  intArray = new Uint8Array(arrayBuffer);
  for (i = 0; i < byteString.length; i += 1) {
      intArray[i] = byteString.charCodeAt(i);
  }
  // Write the ArrayBuffer to a blob:
  bb = new BlobBuilder();
  bb.append(arrayBuffer);
  // Separate out the mime component:
  mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  return bb.getBlob(mimeString);
};

//~ function canvasToBlob (canvas, callback, options) {
  //~ options = options || {};
  //~ } else if (canvas.mozGetAsFile) {
    //~ var name = options.name;
    //~ callback(canvas.mozGetAsFile(
      //~ (blobTypes.test(options.type) && name) ||
          //~ ((name && name.replace(/\..+$/, '')) || 'blob') + '.png',
      //~ options.type
    //~ ));
    //~ return true;
  //~ }
  //~ else if (canvas.toDataURL && window.BlobBuilder && window.atob &&
                               //~ window.ArrayBuffer && window.Uint8Array) {
    //~ callback(dataURItoBlob(
      //~ canvas.toDataURL(options.type)
    //~ ));
    //~ return true;
  //~ }
  //~ return false;
//~ };
//~ function canvasToBlob (canvas, callback, options) {
  //~ options = options || {};
  //~ if (canvas.toBlob) {
    //~ canvas.toBlob(callback, options.type);
    //~ return true;
  //~ } else if (canvas.mozGetAsFile) {
    //~ var name = options.name;
    //~ callback(canvas.mozGetAsFile(
      //~ (blobTypes.test(options.type) && name) ||
          //~ ((name && name.replace(/\..+$/, '')) || 'blob') + '.png',
      //~ options.type
    //~ ));
    //~ return true;
  //~ }
  //~ else if (canvas.toDataURL && window.BlobBuilder && window.atob &&
                               //~ window.ArrayBuffer && window.Uint8Array) {
    //~ callback(dataURItoBlob(
      //~ canvas.toDataURL(options.type)
    //~ ));
    //~ return true;
  //~ }
  //~ return false;
//~ };

//
//Widgets
//
var Widget = {
  //~ parser : new DOMParser(),
  //~ parse: function(aStr) {
    //~ return this.parser.parseFromString(aStr, "application/xhtml+xml").documentElement;
  //~ }
};
