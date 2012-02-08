var gConfiguration = {
	PubSubService : 'pubsub.plugsbee.com',
	uploadService : 'http://upload.plugsbee.com',
	theme: 'default',
  WebsocketService: 'ws://ws.plugsbee.com'
};
//Those implements and old non-compatible WebSocket version
if((platform.name === 'Safari') || (platform.name === 'Opera')) {
  gConfiguration.WebsocketService = "ws://plugsbee.com:5281";
}
