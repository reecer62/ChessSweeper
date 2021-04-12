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

network.addOnMessage("setFen", (data) => {
	document.getElementById("claimWhite").disabled = data.whitePlayer;
	document.getElementById("claimBlack").disabled = data.blackPlayer;
	board.setFen(data.fen, data.mineLocs, !(data.whitePlayer && data.blackPlayer));
	document.getElementById("flagCounter").innerHTML = data.mineLocs.length;
});
network.addOnMessage("resetBoard", (data) => {
	board.setFen(data.fen, data.mineLocs, data.gameOver);
	document.getElementById("claimWhite").disabled = false;
	document.getElementById("claimBlack").disabled = false;
});
network.addOnMessage("whiteClaimed", () => {
	document.getElementById("claimWhite").disabled = true;
});
network.addOnMessage("blackClaimed", () => {
	document.getElementById("claimBlack").disabled = true;
});
network.addOnMessage("startGame", () => {
	board.startGame();
});
network.connect();

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
	let result = network.send({ action: "resetBoard" });
	if (!result) { //change this when autoreconnect is done
		board.resetBoard();
	}
};

document.getElementById("claimWhite").onclick = () => {
	network.addOnMessage("claimWhite", () => {
		board.color = "w";
		document.getElementById("claimWhite").disabled = true;
		document.getElementById("claimBlack").disabled = true;
		network.removeOnMessage("claimWhite");
	});
	network.send({ action: "claimWhite" });
};
document.getElementById("claimBlack").onclick = () => {
	network.addOnMessage("claimBlack", () => {
		board.color = "b";
		document.getElementById("claimWhite").disabled = true;
		document.getElementById("claimBlack").disabled = true;
		network.removeOnMessage("claimBlack");
	});
	network.send({ action: "claimBlack" });
};