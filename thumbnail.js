//window.BlobBuilder
if (!window.BlobBuilder)
  window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder;

//HTMLCanvasElement.toBlob
if (!HTMLCanvasElement.prototype.toBlob) {
  HTMLCanvasElement.prototype.toBlob = function(aCallback, aType) {
    if (this.mozGetAsFile)
      return aCallback(this.mozGetAsFile('', aType));
    
    var dataURL = this.toDataURL(aType);
    aCallback(window.dataURI2Blob(dataURL));    
  }
};

//window.dataURI2Blob
window.dataURI2Blob = function(dataURI) {
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
      //~ c.toBlob(function(blob) {
        if (aCallback) {
          aCallback(c);
        }
      //~ }, aFile.type);
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
