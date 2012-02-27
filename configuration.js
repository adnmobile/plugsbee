var gConfiguration = {
  name: 'Plugsbee',
	theme: 'default',
	PubSubService : 'PEP',
	uploadService : 'http://upload.plugsbee.com',
  WebsocketService: 'ws://ws.plugsbee.com',
  registration: false,
};
//Those implements and old non-compatible WebSocket version
if((platform.name === 'Safari') || (platform.name === 'Opera')) {
  gConfiguration.WebsocketService = "ws://plugsbee.com:5281";
}
