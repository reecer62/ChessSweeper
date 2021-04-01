export default class Network {
	constructor({ ip, port }) {
		console.log(1)
		this.ws = new WebSocket(`ws://${ip}:${port}`);

		this.ws.onopen = () => {
			console.log("aaaaaaaaaaaaaaaaannnddddddddddd... OPEN!")
		}
		this.setOnMessage((data) => {
			console.log(data)
		});
		this.send({ action: "test", content: { test: "test" } });
	}

	setOnMessage(fun) {
		this.ws.onmessage = (event) => {
			fun(JSON.parse(event.data));
		}
	}

	send({ action, content }, numTries = 10) {
		if (!numTries) {
			console.log("Network timed out!");
		} else if (this.ws.readyState === 0) {
			setTimeout(() => {
				this.send({ action, content }, numTries - 1);
			}, 1000);
		} else if (this.ws.readyState === 1) {
			this.ws.send(JSON.stringify({ action, ...content }));
		} else if (this.ws.readyState === 2 || this.ws.readyState === 3) {
			console.log("Network failed!");
		} else {
			console.log("Unknown network error occurred.");
		}
	}
}