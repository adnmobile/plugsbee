var gConfiguration = {
	PubSubService : "pubsub.plugsbee.com",
	uploadService : 'http://upload.plugsbee.com',
	theme: 'default',
};
// Safari implements an old WebSocket protocol version
if(navigator.userAgent.match('AppleWebKit') && !navigator.userAgent.match('Chrome'))
  gConfiguration.WebsocketService = "ws://plugsbee.com:5281";
else
  gConfiguration.WebsocketService = "ws://plugsbee.com:5280";
