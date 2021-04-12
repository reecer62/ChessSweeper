export default class Network {
	constructor({ ip, port }) {
		this.ip = ip;
		this.port = port;

		this.reconnect = true;
		this.ws = null;
		// this.retry = 2000;
		this.onMessage = {};
	}

	connect() {
		this.reconnect = true;
		this.ws = new WebSocket(`ws://${this.ip}:${this.port}`);

		this.ws.onopen = () => {
			// this.retry = 2000;
			console.log("Aaaaaaaaaaaaaaaaannnddddddddddd... OPEN!");
		};

		// this.ws.onclose = () => {
		// 	console.log("Connection closed")
		// 	if (this.reconnect) {
		// 		console.log("Retrying connection in", this.retry / 1000, "seconds...");
		// 		window.setTimeout(() => {
		// 			this.retry = Math.min(this.retry * 2, 30000);
		// 			this.connect();
		// 		}, this.retry);
		// 	}
		// };

		this.ws.onmessage = (event) => {
			let data = JSON.parse(event.data);
			if (data.action in this.onMessage) {
				if ("args" in data) {
					if ("error" in data.args) {
						console.log(data.args.error);
					} else {
						this.onMessage[data.action](data.args);
					}
				} else {
					this.onMessage[data.action]();
				}
			} else {
				console.log(`NO HANDLER: ${JSON.stringify(data)}`);
			}
		};
	}

	disconnect() {
		this.reconnect = false;
		this.ws = null;
	}

	addOnMessage(action, fun) {
		this.onMessage[action] = fun;
	}

	removeOnMessage(action) {
		delete this.onMessage[action];
	}

	send(message, numTries = 10) {
		if (!numTries) {
			console.log("Network timed out!");
			return false;
		} else if (this.ws.readyState === 0) {
			setTimeout(() => {
				this.send(message, numTries - 1);
			}, 1000);
		} else if (this.ws.readyState === 1) {
			let success = this.ws.send(JSON.stringify(message));
			return success && true;
		} else if (this.ws.readyState === 2 || this.ws.readyState === 3) {
			console.log("Network failed!");
			return false;
		} else {
			console.log("Unknown network error occurred.");
			return false;
		}
	}
}