import Network from "./components/Network.js";
import Board from "./components/Board.js";
import Timer from "./components/Timer.js";

const network = new Network({
	ip: "localhost",
	port: "25568"
}); //173.95.165.30
const board = new Board({
	selector: "#board",
	size: "400px",
	network,
	statusCB: (text) => document.getElementById("status").innerHTML = text,
	swapTurnsCB: swapTimer,
	flagCounterCB: (text) => document.getElementById("flagCounter").innerHTML = text
});

network.addOnMessage("setFen", (data) => {
	document.getElementById("claimWhite").disabled = data.whitePlayer;
	if (data.whitePlayer) {
		document.getElementById("youAreWhite").innerHTML = "White is claimed.";
	} else {
		document.getElementById("youAreWhite").innerHTML = "White is not claimed.";
	}
	document.getElementById("claimBlack").disabled = data.blackPlayer;
	if (data.blackPlayer) {
		document.getElementById("youAreBlack").innerHTML = "Black is claimed.";
	} else {
		document.getElementById("youAreBlack").innerHTML = "Black is not claimed.";
	}
	board.setFen(data.fen, data.mineCount, data.prevMove, !(data.whitePlayer && data.blackPlayer));
	document.getElementById("flagCounter").innerHTML = data.mineCount;
});
network.addOnMessage("resetBoard", (data) => {
	board.setFen(data.fen, data.mineCount, data.prevMove, !(data.whitePlayer && data.blackPlayer));
	document.getElementById("claimWhite").disabled = false;
	document.getElementById("claimBlack").disabled = false;
	document.getElementById("youAreWhite").innerHTML = "White is not claimed.";
	document.getElementById("youAreBlack").innerHTML = "Black is not claimed.";
});
network.addOnMessage("whiteClaimed", (data) => {
	document.getElementById("claimWhite").disabled = data.taken;
	if (data.taken) {
		document.getElementById("youAreWhite").innerHTML = "White is claimed.";
	} else {
		document.getElementById("youAreWhite").innerHTML = "White is not claimed.";
	}
});
network.addOnMessage("blackClaimed", (data) => {
	document.getElementById("claimBlack").disabled = data.taken;
	if (data.taken) {
		document.getElementById("youAreBlack").innerHTML = "Black is claimed.";
	} else {
		document.getElementById("youAreBlack").innerHTML = "Black is not claimed.";
	}
});
network.addOnMessage("startGame", () => {
	board.startGame();
});
network.addOnMessage("moveAll", (data) => {
	if (data) {
		board.move(data);
	} else {
		board.skipTurn();
	}
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
	network.send({ action: "resetBoard" });
};

document.getElementById("claimWhite").onclick = () => {
	network.addOnMessage("claimWhite", () => {
		board.color = "w";
		document.getElementById("claimWhite").disabled = true;
		document.getElementById("claimBlack").disabled = true;
		document.getElementById("youAreWhite").innerHTML = "You are White.";
		network.removeOnMessage("claimWhite");
	});
	network.send({ action: "claimWhite" });
};
document.getElementById("claimBlack").onclick = () => {
	network.addOnMessage("claimBlack", () => {
		board.color = "b";
		document.getElementById("claimWhite").disabled = true;
		document.getElementById("claimBlack").disabled = true;
		document.getElementById("youAreBlack").innerHTML = "You are Black."
		network.removeOnMessage("claimBlack");
	});
	network.send({ action: "claimBlack" });
};