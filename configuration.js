var gConfiguration = {
	PubSubService : "pubsub.plugsbee.com",
	uploadService : 'http://upload.plugsbee.com',
	theme: 'default',
};
  
//If safari
if(navigator.userAgent.match('AppleWebKit') && !navigator.userAgent.match('Chrome')) {
  gConfiguration.WebsocketService = "ws://plugsbee.com:5281";
}
//Else
else
  gConfiguration.WebsocketService = "ws://ws.plugsbee.com";

