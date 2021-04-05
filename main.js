import Network from "./components/Network.js";
import Board from "./components/Board.js";

const network = new Network({ ip: "173.95.165.30", port: "25568" });
const board = new Board({ selector: "#board", size: "400px", network, statusCB: (text) => document.getElementById("status").innerHTML = text });

let body = document.getElementById("body");
body.onmousedown = (event) => {
	board.mouseDown(event);
	return false;
}
body.onmouseup = (event) => {
	board.mouseUp(event);
}
body.onmousemove = (event) => {
	board.mouseMove(event);
}

document.getElementById("flipBoard").onclick = () => {
	document.getElementById("boardContainer").classList.toggle("flipped");
	board.flipBoard();
};
document.getElementById("resetBoard").onclick = () => {
	board.resetBoard();
};