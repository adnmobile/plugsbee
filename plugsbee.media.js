'use strict';

Plugsbee.media = {
  getFileDataURI: function(aPbFile, aCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', aPbFile.fileURL, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (this.status !== 200)
       return;

      var uInt8Array = new Uint8Array(this.response);
      var binaryString = new Array(uInt8Array.length);
      for (var i = 0; i < uInt8Array.length; i++) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
      }

      var data = binaryString.join('');
      var dataURI = 'data:'+aPbFile.type+';base64,'+window.btoa(data);
      if (aCallback)
        aCallback(dataURI);
    };
    xhr.send();
  },
  getMiniatureCanvas: function(aPbFile, aCallback) {
    this.getFileDataURI(aPbFile, function(dataURI) {
      resizeImageDataURI(dataURI, 84, 84, function(canvas) {
        if (aCallback) {
          aCallback(canvas);
        }
      });
    });
  },
  getMiniature: function(aDOMFile, aCallback) {
    resizeImageCanvas(aDOMFile, 84, 84, function(canvas) {
      if (aCallback) {
        aCallback(canvas);
      }
    });
  },
};
function resize( imagewidth, imageheight, thumbwidth, thumbheight ) {
  var w = 0, h = 0, x = 0, y = 0,
    widthratio = imagewidth / thumbwidth,
    heightratio = imageheight / thumbheight,
    maxratio = Math.max( widthratio, heightratio );
  if ( maxratio > 1 ) {
    w = imagewidth / maxratio;
    h = imageheight / maxratio;
  } else {
    w = imagewidth;
    h = imageheight;
  }
  x = ( thumbwidth - w ) / 2;
  y = ( thumbheight - h ) / 2;
  return { w:w, h:h, x:x, y:y };
};


function resizeImage(aFile, aWidth, aHeight, aCallback) {
  var blobURL = window.URL.createObjectURL(aFile);
  var img = new Image();
  
  var crop = true;
  var background = "transparent";
  
  img.onload = function() {
      window.URL.revokeObjectURL(blobURL);
      
      
      var c = document.createElement( 'canvas' );
      var cx = c.getContext( '2d' );

      c.width = aWidth;
      c.height = aHeight;
      
      var dimensions = resize( img.width, img.height, aWidth, aHeight );
      if ( crop ) {
        c.width = dimensions.w;
        c.height = dimensions.h;
        dimensions.x = 0;
        dimensions.y = 0;
      }
      if ( background !== 'transparent' ) {
        cx.fillStyle = background;
        cx.fillRect ( 0, 0, thumbwidth, thumbheight );
      }
      cx.drawImage( 
        img, dimensions.x, dimensions.y, dimensions.w, dimensions.h 
      );
      //~ var img = new Image();
      //~ img.src = c.toDataURL('image/png');
      //~ document.body.appendChild(c);
      c.toBlob(function(blob) {
        if (aCallback) {
          aCallback(blob);
        }
      }, aFile.type);
  };
  img.src = blobURL;
};
function resizeImageCanvas(aFile, aWidth, aHeight, aCallback) {
  var blobURL = window.URL.createObjectURL(aFile);
  var img = new Image();
  
  var crop = true;
  var background = "transparent";
  
  img.onload = function() {
      window.URL.revokeObjectURL(blobURL);
      
      
      var c = document.createElement( 'canvas' );
      var cx = c.getContext( '2d' );

      c.width = aWidth;
      c.height = aHeight;
      
      var dimensions = resize( img.width, img.height, aWidth, aHeight );
      if ( crop ) {
        c.width = dimensions.w;
        c.height = dimensions.h;
        dimensions.x = 0;
        dimensions.y = 0;
      }
      if ( background !== 'transparent' ) {
        cx.fillStyle = background;
        cx.fillRect ( 0, 0, thumbwidth, thumbheight );
      }
      cx.drawImage( 
        img, dimensions.x, dimensions.y, dimensions.w, dimensions.h 
      );
      //~ var img = new Image();
      //~ img.src = c.toDataURL('image/png');
      //~ document.body.appendChild(c);
        if (aCallback) {
          aCallback(c);
        }
  };
  img.src = blobURL;
};
function resizeImageDataURI(aDataURI, aWidth, aHeight, aCallback) {
  var img = new Image();
  
  var crop = true;
  var background = "transparent";
  
  img.onload = function() {
    var c = document.createElement( 'canvas' );
    var cx = c.getContext( '2d' );

    c.width = aWidth;
    c.height = aHeight;
    
    var dimensions = resize( img.width, img.height, aWidth, aHeight );
    if ( crop ) {
      c.width = dimensions.w;
      c.height = dimensions.h;
      dimensions.x = 0;
      dimensions.y = 0;
    }
    if ( background !== 'transparent' ) {
      cx.fillStyle = background;
      cx.fillRect ( 0, 0, thumbwidth, thumbheight );
    }
    cx.drawImage( 
      img, dimensions.x, dimensions.y, dimensions.w, dimensions.h 
    );
    //~ var img = new Image();
    //~ img.src = c.toDataURL('image/png');
    //~ document.body.appendChild(c);
      if (aCallback) {
        aCallback(c);
      }
  };
  img.src = aDataURI;
};
