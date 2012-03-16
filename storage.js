'use strict';
(function() {
  var storage = {
    init: function() {
      var indexedDB =
        window.indexedDB ||
        window.webkitIndexedDB ||
        window.mozIndexedDB ||
        window.msIndexedDB;

      this.request = indexedDB.open("Test");
      console.log(this.request);
    }, 
    
  };
  
  
  storage.init();
}();
