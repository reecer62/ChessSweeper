export default class Network {
	constructor({ ip, port }) {
		this.ws = new WebSocket(`ws://${ip}:${port}`);
		this.onMessage = {};

		this.ws.onopen = () => {
			console.log("Aaaaaaaaaaaaaaaaannnddddddddddd... OPEN!")
		};
		this.ws.onmessage = (event) => {
			let data = JSON.parse(event.data);
			if (data["action"] in this.onMessage) {
				if ("args" in data) {
					this.onMessage[data["action"]](data["args"]);
				} else {
					this.onMessage[data["action"]]();
				}
			} else {
				console.log(`NO HANDLER: ${JSON.stringify(data)}`);
			}
		};

		this.addOnMessage("echoAll", (data) => {
			console.log(`ECHO: ${JSON.stringify(data)}`);
		});
		this.send({
			action: "echoAll",
			args: {
				test: "test"
			}
		});
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
		} else if (this.ws.readyState === 0) {
			setTimeout(() => {
				this.send(message, numTries - 1);
			}, 1000);
		} else if (this.ws.readyState === 1) {
			this.ws.send(JSON.stringify(message));
		} else if (this.ws.readyState === 2 || this.ws.readyState === 3) {
			console.log("Network failed!");
		} else {
			console.log("Unknown network error occurred.");
		}
	}
}