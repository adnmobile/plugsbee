var gConfiguration = {
	WebsocketService : "ws://plugsbee.com:5280",
	PubSubService : "pubsub.plugsbee.com",
	uploadService : 'http://upload.plugsbee.com',
	plugsbeeInstance : 'http://dev.plugsbee.com',
	theme: 'default',
	mailerService: 'mailer.plugsbee.com',
	
	notificationSubject : function(aSenderName, aFolderName) {
		return aSenderName +' shared the folder "'+aFolderName+'" with you.';
	},
	notificationMessage : function(aReceiverName) {
		return 'Hello '+aReceiverName+', '+'you can access it via '+this.plugsbeeInstance;
	},
	notificationIM : function(aFolderName) {
		return 'Hello, I shared the folder "'+aFolderName+'" with you on '+this.plugsbeeInstance; 
	}
};

