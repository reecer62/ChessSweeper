import Board from "./components/Board.js";

const board = new Board({ selector: "#board", size: "400px" });
document.getElementById("flipBoard").onclick = () => board.flipBoard(board);