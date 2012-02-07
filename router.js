var Router = {
  route: function(aNode) {
    switch (aNode[0]) {
			//~ case 'settings':
				//~ this.showPanel("settings");
				//~ this.setActive('li#settings-tab');
				//~ break;
			//~ case 'help':
				//~ this.showPanel("help");
				//~ this.setActive('li#help-tab');
				//~ break;
			//~ case 'addcontact':
				//~ this.showPanel("addcontact");
				//~ this.setActive('a#addcontact-tab');
				//~ break;
			//~ case 'console':
				//~ this.showPanel('console');
				//~ this.setActive('li#console-tab');
				//~ break;
			//~ case 'upgrade':
				//~ this.showSection('upgrade');
				//~ break;
			//~ case '':
				//~ this.showFolders();
				//~ break;
			default:
        var folder = gUserInterface.getFolderFromName(unescape(aNode[0]));

        if (!folder) {
          gUserInterface.showFolders();
          return;
        }
        
        var file = gUserInterface.getFileFromName(folder, unescape(aNode[1]));
        if (file)
          gUserInterface.showFile(file);
        else
          gUserInterface.showFolder(folder);
    }
  }
}
var popped = ('state' in window.history), initialURL = location.href;
window.addEventListener("popstate",
	function(e) {
    var initialPop = !popped && location.href == initialURL
    popped = true
    if ( initialPop ) return

    var node = [];
    if(location.protocol === 'file:') {
      var hash = location.hash.split('#')[1];
      if(hash) {
        var split = hash.split('/');
        if(split)
          node = split;
        else
          node.push(hash);
      }
    }
    else {
      var split = location.pathname.split('/');
      node.push(split[1]);
      if(split[2])
        node.push(split[2]);
    } 
    Router.route(node);
	}, false
);
