'use strict';

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

//
//stack
//
var SWStack = Object.create(SW);
//selectedChild property
Object.defineProperty(SWStack, 'selectedChild', {
  configurable: true,
  enumerable:   true,
  set: function(aName) {
    var children = this.rootElement.children;
    for (var i = 0; i < children.length; i++) {
      if ( children[i].getAttribute('data-name') === aName) {
         children[i].classList.add('visible');
         children[i].classList.remove('hidden');
       }
      else {
         children[i].classList.remove('visible');
         children[i].classList.add('hidden');
      }
    }
  }
});
