'use strict';

var Widget = {
  parser : new DOMParser(),
  parse: function(aStr) {
    return this.parser.parseFromString(aStr, "application/xhtml+xml").documentElement;
  }
};

var http = {
  request: function(aOptions, aOnSuccess, aOnError) {
    var xhr = new XMLHttpRequest();
    xhr.open(aOptions.method, aOptions.url, true);
    xhr.responseType = 'arraybuffer';
    
    for (var i in aOptions.headers)
      xhr.setRequestHeader(i, aOptions.headers[i]);

    xhr.onreadystatechange = function() {
      if (this.readyState === 4)
        if (this.status === 200) {


          if(aOnSuccess)
            aOnSuccess(this.response);
        }
        else {
          if(onError)
            onError();
      }
    };
    xhr.send();
  }
}

var base64 = {
  encode: window.atob,
  decode: window.btoa
};

var storage = {
  'set': function storage_set(aKey, aData) {
    localStorage.setItem(aKey, aData);
  },
  'get': function storage_get(aKey) {
    return localStorage.getItem(aKey);
  },
};

