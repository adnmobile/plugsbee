Plugsbee.connection.on('message', function(data) {

  if(data.firstChild.tagName !== 'event')
    return;
  
  //Folder deletion  
  if(data.firstChild.firstChild.tagName === 'delete')
    return;

  //Items retract
  if((data.firstChild.firstChild.tagName === 'items') && (data.firstChild.firstChild.firstChild.tagName === 'retract'))
    return;
    
  
  var service = data.getAttribute('from');
  var nodeid = data.querySelector('items').getAttribute('node');
  var folderjid = service+"/"+nodeid;
  
  var elm = data.querySelector('item');
  var itemid = elm.getAttribute('id');
  var filejid = folderjid+"/"+itemid;
  
  var folder = Plugsbee.folders[folderjid]
  
  //Return if the folder doesn't exist or if the file already exist
  if(!folder || folder.files[filejid])
    return;
  
  var item = {
    id: itemid,
    name: elm.querySelector('title').textContent,
    src: elm.querySelector('content').getAttribute('src'),
    type: elm.querySelector('content').getAttribute('type'),
  }
  var miniature = elm.querySelector('link');
  if(miniature)
    item.miniature = miniature.getAttribute('href');

  var file = Object.create(Plugsbee.File);
  file.jid = folder.jid+'/'+item.id
  file.name = item.name;
  file.type = item.type;
  file.src = item.src;
  if(!item.miniature)
    file.miniature = "themes/"+gConfiguration.theme+'/file.png';
  else
    file.miniature = item.miniature;
  file.id = item.id;
  file.folder = folder;


  var thumbnail = new Widget.Thumbnail();
  thumbnail.elm = folder.panel.append(thumbnail.elm);
  thumbnail.id = file.jid;
  thumbnail.label = file.name;
  thumbnail.miniature = file.miniature;
  thumbnail.href = file.folder.name+'/'+file.name;
  thumbnail.elm.classList.add('file');
  thumbnail.elm.addEventListener('click', function(evt) {
    if(window.location.protocol !== 'file:')
      history.pushState(null, null, this.href);
    gUserInterface.showFile(file);
    evt.preventDefault();
  });
  
  file.thumbnail = thumbnail;
  
  folder.files[file.jid] = file;
});
