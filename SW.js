'use strict';
//~ var attributeValueList = Object.create(null);
  //~ 
//~ 
//~ attributeValueList.prototype.add = function(aValue) {
  //~ console.log('toto');
//~ };

var SW = {
  rootElement: null,
  //~ class: Object.create(attributeValueList),
  appendTo: function(aNode) {
    this.rootElement = aNode.appendChild(this.rootElement);
  }
};

//id property
Object.defineProperty(SW, 'id', {
  configurable: true,
  enumerable:   true,
  set: function(aId) {
    this.rootElement.id = aId;
  },
  get: function() {
    return this.rootElement.id;
  },
});
//class property
//~ Object.defineProperty(SW, 'class', {
  //~ configurable: true,
  //~ enumerable:   true,
  //~ set: function(aId) {
    //~ this.rootElement.id = aId;
  //~ },
  //~ get: function() {
    //~ return this.rootElement.id;
  //~ },
//~ });
//hidden property
Object.defineProperty(SW, 'hidden', {
  configurable: true,
  enumerable:   true,
  set: function(aBool) {
    this.rootElement.hidden = aBool;
  },
  get: function() {
    return this.rootElement.hidden;
  },
});



	//~ showPanel: function(aPanel) {
    //~ var deck = document.getElementById('deck');
    //~ deck.hidden = false;
		//~ 
    //~ var panels = document.querySelectorAll('.panel');
		//~ for (var i in panels) {
			//~ panels[i].hidden = true;
		//~ }
    //~ if(typeof aPanel === "string")
      //~ document.getElementById(aPanel).hidden = false;
    //~ else
      //~ aPanel.hidden = false;
	//~ },
	//~ showSection: function(name) {
		//~ var sections = document.querySelectorAll('section');
		//~ for (var i in sections) {
      //~ sections[i].hidden = true;
		//~ }
		//~ document.getElementById(name).hidden = false;
	//~ },
  
  
  
//
//deck
//
var SWDeck = Object.create(SW);
SWDeck.rootElement = (function() {
  return document.createElement('div');
})();
//selectedPanel property
Object.defineProperty(SW, 'selectedPanel', {
  configurable: true,
  enumerable:   true,
  set: function(aPanel) {
    var panels = this.rootElement.querySelectorAll('.panel');
    for (var i = 0; i < panels.length; i++) {
      if(panels[i].getAttribute('data-name') === aPanel)
        panels[i].hidden = false;
      else
        panels[i].hidden = true;
    }
  },
  get: function() {
    return this.rootElement.hidden;
  },
});

//
//thumbnail
//
var SWThumbnail = Object.create(SW);
SWThumbnail.rootElement = (function() {
  var elm = document.createElement('div');
  elm.innerHTML = 
    "<li class='thumbnail'>"+
      "<a>"+
        "<figure>"+
          "<img class='miniature'/>"+
          "<figcaption class='label'/>"+
        "</figure>"+
      "</a>"+
    "</li>";
  return elm.firstChild;
})();
//miniature property
Object.defineProperty(SW, 'miniature', {
  configurable: true,
  enumerable:   true,
  set: function(aMiniature) {
    this.rootElement.querySelector('.miniature').src = aMiniature;
  },
  get: function() {
    return this.rootElement.querySelector('.miniature').src;
  },
});
//label property
Object.defineProperty(SW, 'label', {
  configurable: true,
  enumerable:   true,
  set: function(aLabel) {
    this.rootElement.querySelector('.label').textContent = aLabel;
  },
  get: function() {
    return this.rootElement.querySelector('.label').textContent;
  },
});
//link property
Object.defineProperty(SW, 'link', {
  configurable: true,
  enumerable:   true,
  set: function(aLink) {
    this.rootElement.getElementsByTagName('a')[0].href = link;
  },
  get: function() {
    return this.rootElement.getElementsByTagName('a')[0].href;
  },
});

window.addEventListener('load', function() {
  //~ var thumbnail = Object.create(SWThumbnail);
  //~ thumbnail.appendTo(document.body);
  //~ thumbnail.id = 'toto';
  //~ thumbnail.label = 'pikachu';
  //~ thumbnail.miniature = 'http://i286.photobucket.com/albums/ll109/blargh0123/pokemon/hhj.jpg';
  //~ console.log(thumbnail.id);
  //~ console.log(thumbnail);
});
