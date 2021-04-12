import Piece from "./Piece.js";
import Square from "./Square.js";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default class Board {
	constructor({ selector, size, network, statusCB, swapTurnsCB, flagCounterCB }) {
		this.size = size;
		this.network = network;
		this.statusCB = statusCB;
		this.swapTurnsCB = swapTurnsCB;
		this.flagCounterCB = flagCounterCB;

		this.element = document.querySelector(selector);
		this.element.classList.add("Board");
		this.element.style.width = this.size;
		this.element.style.height = this.size;

		this.squares = {}; //board positions to class objects
		this.squareElements = new Map(); //dom objects to class objects
		this.pieceElements = new Map(); //dom objects to class objects
		this.game = new Chess();

		this.perspective = "w";
		this.status = "";
		this.dragging = false;
		this.lastMousePos = [];
		this.draggedPiece;
		this.prevSquare;
		this.prevMove = {};

		this.gameOver = false;
		this.currFlags = 0;
		this.prevPositions = {};
		this.color = "";

		this.init();
	}

	mouseDown(event) {
		if (this.gameOver) {
			return;
		}
		let piece = document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Piece"))
		if (event.button === 0 && piece && this.game.turn() === this.pieceElements.get(piece).color && this.color === this.game.turn()) {
			event.preventDefault();
			this.dragging = true;
			this.prevSquare = this.squareElements.get(document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Square")));
			this.lastMousePos = [event.clientX, event.clientY];
			this.draggedPiece = piece;
			this.draggedPiece.style.position = "absolute";
			this.draggedPiece.style.zIndex = 1;
		}
	}

	mouseUp(event) {
		if (this.dragging) {
			event.preventDefault();
			this.dragging = false;
			this.lastMousePos = [];
			let newSquare = this.squareElements.get(document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Square")));
			if (newSquare !== undefined && this.prevSquare !== newSquare) {
				let move = this.game.move({
					from: this.prevSquare.position,
					to: newSquare.position,
					promotion: "q"
				});
				if (move !== null) {
					let fen = this.game.fen();
					this.game.undo();
					this.network.addOnMessage("move", (data) => {
						if (!data.success) {
							this.game.undo();
						}
						this.network.removeOnMessage("move");
					});
					this.network.send({
						action: "move", args: {
							move,
							fen
						}
					});
					this.move(move);
				}
			}

			this.draggedPiece.style.top = null;
			this.draggedPiece.style.left = null;
			this.draggedPiece.style.position = null;
			this.draggedPiece.style.zIndex = 0;
			this.draggedPiece = null;
			this.prevSquare = null;
		}
	}

	mouseMove(event) {
		if (this.dragging) {
			event.preventDefault();
			let prevMousePos = [this.lastMousePos[0] - event.clientX, this.lastMousePos[1] - event.clientY];
			this.lastMousePos = [event.clientX, event.clientY];

			this.draggedPiece.style.top = `${this.draggedPiece.offsetTop - prevMousePos[1]}px`;
			this.draggedPiece.style.left = `${this.draggedPiece.offsetLeft - prevMousePos[0]}px`;
		}
	}

	init() {
		for (let i = 0; i < 64; i++) {
			let rank = 8 - Math.floor(i / 8);
			let fileNum = i % 8;
			let file = files[fileNum];
			let bg = rank % 2 === fileNum % 2 ? "light" : "dark";
			let square = new Square({
				rank,
				file,
				bg,
				flagCB: (inc) => {
					if (this.currFlags + inc < 0 || this.currFlags + inc > this.mineCount) {
						return false;
					} else {
						this.currFlags += inc;
						this.flagCounterCB(this.mineCount - this.currFlags);
						return true;
					}
				}
			});
			square.element.onmouseup = (event) => {
				if (!this.gameOver && square.clickedOn && this.color === this.game.turn() && square.msStatus == "raised" && square.element === document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Square"))) {
					if (event.button === 0) {
						if (square.flag === null) {
							this.network.addOnMessage("sink", (data) => {
								if (data.success) {
									if (data.mine) {
										square.sink();
										this.skipTurn();
									} else {
										console.log(this.findAdjacentSquares(Object.keys(this.squares).indexOf(square.position)))
										data.squares.forEach((s) => {
											this.squares[s.position].sink(s.asset);
										});
									}
								}
								this.network.removeOnMessage("sink");
							});
							this.network.send({
								action: "sink",
								args: {
									square: square.position
								}
							});
							// if (this.mine !== null) {
							// 	this.skipTurn();
							// 	this.network.addOnMessage("move", (data) => {
							// 		if (!data.success) {
							// 			this.game.undo();
							// 		}
							// 		this.network.removeOnMessage("move");
							// 	});
							// 	this.network.send({
							// 		action: "move",
							// 		args: {
							// 			skip: true,
							// 			fen: this.game.fen()
							// 		}
							// 	});
							// }
						}
					} else if (event.button === 2) {
						if (square.flag !== null) {
							if (square.flagCB(-1)) {
								square.element.removeChild(square.flag);
								square.flag = null;
							}
						} else {
							if (square.flagCB(1)) {
								square.flag = document.createElement("img");
								square.flag.setAttribute("src", "assets/minesweeper/flag.svg");
								square.displayChild(square.flag);
								square.element.appendChild(square.flag);
							}
						}
					}
				}
				square.clickedOn = false;
			};
			this.element.appendChild(square.element);
			square.fixSize();
			this.squareElements.set(square.element, square);
			this.squares[`${file}${rank}`] = square;
		}

		this.squareSize = Object.values(this.squares)[0].size;

		// this.setBoard();
	}

	skipTurn() {
		let moveColor = "White";
		let notMoveColor = "Black";
		if (this.game.turn() === "b") {
			moveColor = "Black";
			notMoveColor = "White";
		}
		if (this.game.in_check()) {
			this.status = `Game over, ${moveColor} blew up while in check!`;
			this.disableClicks();
			this.gameOver = true;
			this.swapTurnsCB({ color: this.game.turn(), gameOver: this.gameOver });
		} else {
			this.status = `${moveColor} blew up! ${notMoveColor} to move.`;
			this.swapTurn();
		}
		this.statusCB(this.status);
	}

	swapTurn() {
		let tokens = this.game.fen().split(" ");
		tokens[1] = this.game.turn() === "b" ? "w" : "b";
		tokens[3] = "-";
		this.game.load(tokens.join(" "));
		this.swapTurnsCB({ color: this.game.turn() });
	}

	flag(color) {
		let moveColor = "White";
		if (color === "b") {
			moveColor = "Black";
		}
		this.status = `Game over, ${moveColor} flagged.`;
		this.disableClicks();
		this.gameOver = true;
		this.statusCB(this.status);
	}

	flipBoard() {
		for (let i = 1; i < this.element.childNodes.length; i++) {
			this.element.insertBefore(this.element.childNodes[i], this.element.firstChild);
		}
		this.perspective = this.perspective === "b" ? "w" : "b";
		this.setLabels();
	}

	// resetBoard() {
	// 	this.gameOver = false;
	// 	this.currFlags = 0;
	// 	this.flagCounterCB(this.mineCount);
	// 	this.prevPositions = {};
	// 	this.color = "";
	// 	this.game.reset();
	// 	this.swapTurnsCB({ restart: true });
	// 	Object.values(this.squares).forEach((square) => {
	// 		square.clear();
	// 	});
	// 	if (Object.keys(this.prevMove).length !== 0) {
	// 		this.squares[this.prevMove.from].element.classList.remove("highlighted");
	// 		this.squares[this.prevMove.to].element.classList.remove("highlighted");
	// 		this.prevMove = {};
	// 	}
	// 	this.setBoard();
	// }

	// setBoard() {
	// 	this.setLabels();
	// 	this.resetMS();
	// 	this.game.board().reverse().forEach((rank, ri) => {
	// 		rank.forEach((square, fi) => {
	// 			if (square !== null) {
	// 				let piece = new Piece({ color: square.color, type: square.type, size: this.squareSize });
	// 				this.squares[`${files[fi]}${ri + 1}`].addPiece(piece.element);
	// 				this.pieceElements.set(piece.element, piece);
	// 			}
	// 		});
	// 	});
	// 	this.status = "White to move.";
	// 	this.statusCB(this.status);
	// }

	setLabels() {
		if (this.perspective === "w") {
			Object.values(this.squares).forEach((s) => {
				let labelRank = s.position.charAt(0) === "a";
				let labelFile = s.position.charAt(1) === "1";
				s.setLabels(labelRank, labelFile);
			});
		} else {
			Object.values(this.squares).forEach((s) => {
				let labelRank = s.position.charAt(0) === "h";
				let labelFile = s.position.charAt(1) === "8";
				s.setLabels(labelRank, labelFile);
			});
		}
	}

	resetMS() {
		Object.values(this.squares).forEach((s) => {
			s.resetMS();
		});

		this.currFlags = 0;
		this.flagCounterCB(this.mineCount);

		// if (mineLocs.length === 0) {
		// 	while (mineLocs.length < this.mineCount / 2) {
		// 		let loc = Math.floor(Math.random() * Object.keys(this.squares).length / 2);
		// 		if (mineLocs.indexOf(loc) === -1) {
		// 			mineLocs.push(loc);
		// 		}
		// 	}
		// 	while (mineLocs.length < this.mineCount) {
		// 		let loc = Math.floor(Math.random() * (Object.keys(this.squares).length - Object.keys(this.squares).length / 2) + Object.keys(this.squares).length / 2);
		// 		if (mineLocs.indexOf(loc) === -1) {
		// 			mineLocs.push(loc);
		// 		}
		// 	}
		// } else {
		// 	this.mineCount = mineLocs.length;
		// }

		// Object.values(this.squares).forEach((s, index) => {
		// 	if (mineLocs.indexOf(index) !== -1) {
		// 		s.addMine();
		// 		this.findAdjacentSquares(index).forEach((ss) => {
		// 			ss.addAdjacentMine();
		// 		});
		// 	}
		// });
	}

	// disableClicks() {
	// 	Object.values(this.squares).forEach((s) => {
	// 		s.disableClicks();
	// 	});
	// }

	findAdjacentSquares(index) {
		let adj = [];
		[-9, -7, 7, 9].forEach((i) => {
			if (index + i >= 0 && index + i < 64 && Math.abs(Math.floor((index + i) / 8) - Math.floor(index / 8)) === 1 && Math.abs((index + i) % 8 - index % 8) === 1) { //row and column distance is 1
				adj.push(this.squares[`${files[(index + i) % 8]}${8 - Math.floor((index + i) / 8)}`]);
			}
		});
		[-8, 8].forEach((i) => {
			if (index + i >= 0 && index + i < 64 && Math.abs(Math.floor((index + i) / 8) - Math.floor(index / 8)) === 1 && Math.abs((index + i) % 8 - index % 8) === 0) { //row distance is 1, column distance is 0
				adj.push(this.squares[`${files[(index + i) % 8]}${8 - Math.floor((index + i) / 8)}`]);
			}
		});
		[-1, 1].forEach((i) => {
			if (index + i >= 0 && index + i < 64 && Math.abs(Math.floor((index + i) / 8) - Math.floor(index / 8)) === 0 && Math.abs((index + i) % 8 - index % 8) === 1) { //row distance is 0, column distance is 1
				adj.push(this.squares[`${files[(index + i) % 8]}${8 - Math.floor((index + i) / 8)}`]);
			}
		});
		return adj;
	}

	setFen(fen, mineCount, prevMove, gameOver) {
		this.game.load(fen);
		this.mineCount = mineCount;
		this.gameOver = gameOver;
		this.currFlags = 0;
		this.color = "";

		this.resetMS();
		this.game.board().reverse().forEach((rank, ri) => {
			rank.forEach((square, fi) => {
				if (square !== null) {
					let piece = new Piece({ color: square.color, type: square.type, size: this.squareSize });
					this.squares[`${files[fi]}${ri + 1}`].addPiece(piece.element);
					this.pieceElements.set(piece.element, piece);
				}
			});
		});
		if (Object.keys(prevMove).length !== 0) {
			this.squares[prevMove.from].element.classList.add("highlighted");
			this.squares[prevMove.to].element.classList.add("highlighted");
			this.prevMove = prevMove;
		}

		if (gameOver) {
			this.status = "Game has not started yet.";
		} else {
			if (this.game.turn() === "w") {
				this.status = "White to move.";
			} else {
				this.status = "Black to move.";
			}
		}
		this.gameOver = gameOver;
		this.statusCB(this.status);
	}

	startGame() {
		this.gameOver = false;
		if (this.game.turn() === "w") {
			this.status = "White to move.";
		} else {
			this.status = "Black to move.";
		}
		this.statusCB(this.status);
	}

	move(move) {
		this.game.move(move);
		let prevSquare = this.squares[move.from];
		let newSquare = this.squares[move.to];
		let draggedPiece = prevSquare.piece
		if (Object.keys(this.prevMove).length !== 0) {
			this.squares[this.prevMove.from].element.classList.remove("highlighted");
			this.squares[this.prevMove.to].element.classList.remove("highlighted");
		}
		prevSquare.element.classList.add("highlighted");
		newSquare.element.classList.add("highlighted");
		this.prevMove = move;
		if (move.promotion === "q") { //promotion
			let piece = this.pieceElements.get(draggedPiece);
			piece.element.setAttribute("src", `assets/chess/${piece.color}q.png`);
		}
		if (move.flags.includes("k")) { //kingside castle
			let rank = move.color === "b" ? "8" : "1";
			let rook = this.squares[`h${rank}`].getPiece();
			this.squares[`h${rank}`].removePiece();
			if (!this.squares[`f${rank}`].hasMine()) {
				this.squares[`f${rank}`].addPiece(rook);
			}
		}
		if (move.flags.includes("q")) { //queenside castle
			let rank = move.color === "b" ? "8" : "1";
			let rook = this.squares[`a${rank}`].getPiece();
			this.squares[`a${rank}`].removePiece();
			if (!this.squares[`d${rank}`].hasMine()) {
				this.squares[`d${rank}`].addPiece(rook);
			}
		}
		if (move.flags.includes("e")) { //en passant
			let rank = parseInt(move.to.charAt(1)) + (move.color === "b" ? 1 : -1);
			let file = move.to.charAt(0);
			this.squares[`${file}${rank}`].removePiece();
		}
		prevSquare.removePiece();
		if (newSquare.hasMine()) {
			this.game.remove(newSquare.position);
			let tokens = this.game.fen().split(" ");
			tokens[3] = "-";
			this.game.load(tokens.join(" "));
			newSquare.removePiece();
			if (move.piece === "k") {
				if (move.color === "b") {
					this.status = "Game over, Black's king blew up!";
				} else {
					this.status = "Game over, White's king blew up!";
				}
				this.disableClicks();
				this.gameOver = true;
			} else {
				this.swapTurn();
				if (this.game.in_check()) {
					if (move.color === "b") {
						this.status = "Game over, Black blew up a piece while in check!";
					} else {
						this.status = "Game over, White blew up a piece while in check!";
					}
					this.disableClicks();
					this.gameOver = true;
				} else {
					this.resetMS();
				}
				this.swapTurn();
			}
		} else {
			if ("captured" in move) {
				this.resetMS();
			}
			newSquare.addPiece(draggedPiece);
		}

		let fen = this.game.fen().split(" ");
		fen.splice(fen.length - 1, 1);
		fen.splice(fen.length - 1, 1);
		fen = fen.join(" ");
		if (fen in this.prevPositions) {
			this.prevPositions[fen] += 1;
		} else {
			this.prevPositions[fen] = 1;
		}

		if (!this.gameOver) {
			let moveColor = "White";
			if (this.game.turn() === "b") {
				moveColor = "Black";
			}
			if (this.game.in_checkmate()) {
				this.status = `Game over, ${moveColor} is in checkmate.`;
				this.disableClicks();
				this.gameOver = true;
			} else if (this.game.insufficient_material()) {
				this.status = "Game over, insufficient material.";
				this.disableClicks();
				this.gameOver = true;
			} else if (this.game.in_stalemate()) {
				this.status = "Game over, stalemate position.";
				this.disableClicks();
				this.gameOver = true;
			} else {
				this.status = `${moveColor} to move.`;
				if (this.game.in_check()) {
					this.status += ` ${moveColor} is in check.`;
				}

				Object.values(this.prevPositions).forEach((v) => {
					if (v >= 3) {
						this.status = "Game over, threefold repetition rule.";
						this.disableClicks();
						this.gameOver = true;
					}
				});
			}
		}
		this.swapTurnsCB({ color: this.game.turn(), gameOver: this.gameOver });
		this.statusCB(this.status);
	}
}
