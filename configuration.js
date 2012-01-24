var gConfiguration = {
	PubSubService : "pubsub.plugsbee.com",
	uploadService : 'http://upload.plugsbee.com',
	theme: 'default',
};
//~ // If safari mobile
//~ if(navigator.userAgent.match('AppleWebKit') && !navigator.userAgent.match('Chrome') && navigator.userAgent.match('Mobile'))
  //~ gConfiguration.WebsocketService = "ws://oldws.plugsbee.com";
//~ // If safari desktop
//~ else if(navigator.userAgent.match('AppleWebKit') && !navigator.userAgent.match('Chrome') && !navigator.userAgent.match('Mobile'))
  //~ window.WEB_SOCKET_FORCE_FLASH = true;
  
//If safari
if(navigator.userAgent.match('AppleWebKit') && !navigator.userAgent.match('Chrome'))
  gConfiguration.WebsocketService = "ws://oldws.plugsbee.com";
//Else
else
  gConfiguration.WebsocketService = "ws://ws.plugsbee.com";

