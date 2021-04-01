import Board from "./components/Board.js";

const board = new Board({ selector: "#board", size: "400px" });
document.getElementById("flipBoard").onclick = () => {
	document.getElementById("boardContainer").classList.toggle("flipped");
	board.flipBoard();
};