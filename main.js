import Network from "./components/Network.js";
import Board from "./components/Board.js";
import Timer from "./components/Timer.js";

const network = new Network({
	ip: "localhost",
	port: "25568"
}); //173.95.165.30
let mineCount = 12;
document.getElementById("flagCounter").innerHTML = mineCount;
const board = new Board({
	selector: "#board",
	size: "400px",
	network,
	mineCount,
	statusCB: (text) => document.getElementById("status").innerHTML = text,
	swapTurnsCB: swapTimer,
	flagCounterCB: (text) => document.getElementById("flagCounter").innerHTML = text
});

const whiteTimer = new Timer({
	selector: "#whiteTimer",
	duration: 300,
	increment: 5,
	flagCB: () => board.flag("w")
});
const blackTimer = new Timer({
	selector: "#blackTimer",
	duration: 300,
	increment: 5,
	flagCB: () => board.flag("b")
});
function swapTimer({ color, gameOver = false, restart = false }) {
	if (gameOver) {
		whiteTimer.stop(false);
		blackTimer.stop(false);
	} else if (restart) {
		whiteTimer.restart();
		blackTimer.restart();
	} else if (color === "w") {
		blackTimer.stop();
		whiteTimer.start();
	} else {
		whiteTimer.stop();
		blackTimer.start();
	}
}

document.onmousedown = (event) => {
	board.mouseDown(event);
	return false;
};
document.onmouseup = (event) => {
	board.mouseUp(event);
};
document.onmousemove = (event) => {
	board.mouseMove(event);
};

document.getElementById("flipBoard").onclick = () => {
	document.getElementById("container").classList.toggle("flipped");
	board.flipBoard();
};
document.getElementById("resetBoard").onclick = () => {
	board.resetBoard();
};