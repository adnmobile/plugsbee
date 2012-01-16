var gConfiguration = {
	PubSubService : "pubsub.plugsbee.com",
	uploadService : 'http://upload.plugsbee.com',
	theme: 'default',
};
// If safari mobile
if(navigator.userAgent.match('AppleWebKit') && !navigator.userAgent.match('Chrome') && navigator.userAgent.match('Mobile'))
  gConfiguration.WebsocketService = "ws://plugsbee.com:5281";
// If safari desktop
else if(navigator.userAgent.match('AppleWebKit') && !navigator.userAgent.match('Chrome') && !navigator.userAgent.match('Mobile'))
  window.WEB_SOCKET_FORCE_FLASH = true;
else
  gConfiguration.WebsocketService = "ws://plugsbee.com:5280";

