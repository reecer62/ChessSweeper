import Network from "./components/Network.js";
import Board from "./components/Board.js";

const network = new Network({ ip: "localhost", port: "25568" }); //173.95.165.30
const board = new Board({ selector: "#board", size: "400px", network, statusCB: (text) => document.getElementById("status").innerHTML = text });

document.onmousedown = (event) => {
	board.mouseDown(event);
	return false;
}
document.onmouseup = (event) => {
	board.mouseUp(event);
}
document.onmousemove = (event) => {
	board.mouseMove(event);
}

document.getElementById("flipBoard").onclick = () => {
	document.getElementById("boardContainer").classList.toggle("flipped");
	board.flipBoard();
};
document.getElementById("resetBoard").onclick = () => {
	board.resetBoard();
};