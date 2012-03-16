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
