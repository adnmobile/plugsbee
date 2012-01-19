'use strict';

Widget.Panel = function() {
  this.elm = microjungle([
    ['div', {class: 'panel', hidden: 'hidden'},
      ['a', {class: 'thumbnail upload'},
        ['figure',
          ['div', {class: 'miniature'},
            ['div', {class: 'area'}, 
              ['div', {class: 'text'}, 'Drop files here to upload']
            ]
          ],
          ['figcaption', {'class': 'label'}, 'Upload files']
        ]
      ]
    ]
  ]);
  // No file upload on Safari mobile.
  if(navigator.userAgent.match('AppleWebKit') && navigator.userAgent.match('Mobile'))
    this.elm.querySelector('.upload').hidden = true;
};
Widget.Panel.prototype.__defineSetter__('jd', function(aId) {
	this._jid = aId;
	this.elm.setAttribute('data-jd', aId);
});
Widget.Panel.prototype.__defineGetter__('jid', function() {
	return this._jid;
});
Widget.Panel.prototype.__defineSetter__('hidden', function(aBool) {
	this._hidden = aBool;
  this.elm.hidden = aBool;
});
Widget.Panel.prototype.__defineGetter__('hidden', function() {
	return this._hidden;
});
Widget.Panel.prototype.append = function (aElm) {
  return this.elm.insertBefore(aElm,this.elm.firstChild);
}
