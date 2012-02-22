var Router = {
  route: function(aNode) {
    //~ console.log('routing: '+aNode[0]);
    //~ if(aNode[1])
      //~ console.log('routing: '+aNode[1]);
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
			//~ case 'upgrade':
				//~ this.showSection('upgrade');
				//~ break;
			//~ case 'Trash':
				//~ gUserInterface.showTrash();

        //~ var file = gUserInterface.getFileFromName(Plugsbee.trash, unescape(aNode[1]));
        //~ if (file)
          //~ gUserInterface.showFile(file);
        //~ else
          //~ gUserInterface.showFolder(Plugsbee.trash);
        
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

window.addEventListener("popstate",
	function(e) {
    if(!Plugsbee.connection.socket)
      return;
    var node = [];
    if (location.protocol === 'file:') {
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
      if (split[2])
        node.push(split[2]);
    } 
    Router.route(node);
	}, false
);
