(function() {
  // Document title
  document.title = gConfiguration.name;

  // Theme
  gConfiguration.themeFolder = 'themes/'+gConfiguration.theme+'/';
  yepnope(gConfiguration.themeFolder+'style.css');
  
  // Favicon
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="icon" type="image/png" sizes="16x16" href="'+gConfiguration.themeFolder+'icons/16x16.png"/>' 
  );
  // iOS stuff
  if (platform.os.match('iOS')) {
    //
    // Icons //FIXME: This should works for Android
    //
    document.head.insertAdjacentHTML('beforeend',
      '<link rel="apple-touch-icon" href="'+gConfiguration.themeFolder+'icons/57x57.png"/>' +
      '<link rel="apple-touch-icon" sizes="72x72" href="'+gConfiguration.themeFolder+'icons/72x72.png"/>' +
      '<link rel="apple-touch-icon" sizes="114x114" href="'+gConfiguration.themeFolder+'icons/114x114.png"/>'
    );
    
    //
    // Add to homescreen //FIXME: This should works for Android
    //
    yepnope('lib/add-to-homescreen/src/add2home.js');
    yepnope('lib/add-to-homescreen/style/add2home.css');
    
    //
    // iOS web-app
    //
    document.head.insertAdjacentHTML('beforeend',
      '<meta name="apple-mobile-web-app-capable" content="yes"/>' + 
      '<meta name="apple-mobile-web-app-status-bar-style" content="black"/>'
    );
    
    // FIXME add startup image -- 1004*768 for ipad and 320 x 460 for ipod portrait for both
    /*document.head.insertAdjacentHTML('beforeend',
      '<link rel="apple-touch-startup-image" href="/startup.png">'
    );*/
  }
  //Those implements and old non-compatible WebSocket version
  if((platform.name === 'Safari') || (platform.name === 'Opera')) {
    gConfiguration.WebsocketService = "ws://plugsbee.com:5281";
  }
})();
