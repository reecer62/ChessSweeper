export default class Network {
	constructor({ ip, port }) {
		console.log(1)
		this.ws = new WebSocket(`ws://${ip}:${port}`);
		this.ws.onopen = (event) => {
			console.log(2)
			this.ws.send("test");
		};
		this.ws.onmessage = (event) => {
			console.log(event.data)
		}
	}
}