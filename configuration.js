var gConfiguration = {
	PubSubService : 'pubsub.plugsbee.com',
	uploadService : 'http://upload.plugsbee.com',
	theme: 'default',
  WebsocketService: 'ws://ws.plugsbee.com'
};
//Safari implements and old non-compatible WebSocket version
if(bowser.safari || bowser.ipad || bowser.iphone || bowser.opera) {
  gConfiguration.WebsocketService = "ws://plugsbee.com:5281";
}
