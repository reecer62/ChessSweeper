import Piece from "./Piece.js";
import Square from "./Square.js";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default class Board {
	constructor({ selector, size, network, statusCB }) {
		this.size = size;
		this.network = network;
		this.statusCB = statusCB;
		this.squares = {}; //board positions to class objects
		this.squareElements = new Map(); //dom objects to class objects
		this.pieceElements = new Map(); //dom objects to class objects
		this.game = new Chess();
		this.status = "";
		this.dragging = false;
		this.lastMousePos = [];
		this.draggedPiece;
		this.prevSquare;
		this.gameOver = false;

		this.element = document.querySelector(selector);
		this.element.classList.add("Board");
		this.element.style.width = this.size;
		this.element.style.height = this.size;

		this.init();
	}

	init() {
		for (let i = 0; i < 64; i++) {
			const rank = 8 - Math.floor(i / 8);
			const fileNum = i % 8;
			const file = files[fileNum];
			const bg = rank % 2 === fileNum % 2 ? "light" : "dark";
			const square = new Square({
				rank,
				file,
				bg,
				mineCB: () => {
					let moveColor = "White";
					let notMoveColor = "Black";
					if (this.game.turn() === "b") {
						moveColor = "Black";
						notMoveColor = "White";
					}
					this.status = `${moveColor} blew up! ${notMoveColor} to move.`;
					this.swapTurn();
					this.statusCB(this.status);
					this.setMSBoard();
				},
				noAdjacentMinesCB: (position) => {
					let index = files.indexOf(position.charAt(0)) + (-1 * position.charAt(1) + 8) * 8;
					this.findAdjacentSquares(index).forEach((s) => {
						if (!s.hasMine() && !s.hasPiece() && s.getMSStatus() === "raised") {
							s.sink();
						}
					});
				}
			});
			this.element.appendChild(square.element);
			square.fixSize();
			this.squareElements.set(square.element, square);
			this.squares[`${file}${rank}`] = square;
		}

		this.squareSize = Object.values(this.squares)[0].size;

		this.setBoard();
	}

	mouseDown(event) {
		if (this.game.game_over() || this.gameOver) {
			return;
		}
		if (event.target.classList.contains("Piece") && this.game.turn() === this.pieceElements.get(event.target).color) {
			event.preventDefault();
			this.dragging = true;
			this.prevSquare = this.squareElements.get(document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Square")));
			this.lastMousePos = [event.clientX, event.clientY];
			this.draggedPiece = event.target;
			this.draggedPiece.style.position = "absolute";
			this.draggedPiece.style.zIndex = 1;
		}
	}

	mouseUp(event) {
		if (this.dragging) {
			event.preventDefault();
			this.dragging = false;
			this.lastMousePos = [];
			const newSquare = this.squareElements.get(document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Square")));
			if (newSquare !== undefined) {
				const move = this.game.move({
					from: this.prevSquare.position,
					to: newSquare.position,
					promotion: "q"
				});
				if (move !== null) {
					if (move.promotion === "q") {
						const piece = this.pieceElements.get(this.draggedPiece);
						piece.element.setAttribute("src", `assets/chess/${piece.color}q.png`);
					}
					this.prevSquare.removePiece();
					if (newSquare.hasMine()) {
						if (move.piece === "k") {
							if (move.color === "b") {
								this.status = "Game over, Black's king blew up!";
							} else {
								this.status = "Game over, White's king blew up!";
							}
							this.gameOver = true;
						}
						this.game.remove(newSquare.position);
						newSquare.removePiece();
					} else {
						newSquare.addPiece(this.draggedPiece);
					}

					if (!this.gameOver) {
						let moveColor = "White";
						if (this.game.turn() === "b") {
							moveColor = "Black";
						}
						if (this.game.in_checkmate()) {
							this.status = `Game over, ${moveColor} is in checkmate.`
							this.disableClicks();
						} else if (this.game.insufficient_material()) {
							this.status = "Game over, insufficient material.";
							this.disableClicks();
						} else if (this.game.in_stalemate()) {
							this.status = "Game over, stalemate position.";
							this.disableClicks();
							// } else if (this.game.in_threefold_repetition()) {
							// 	this.status = "Game over, threefold repetition rule.";
							// 	this.disableClicks();
						} else {
							this.status = `${moveColor} to move.`;
							if (this.game.in_check()) {
								this.status += ` ${moveColor} is in check.`;
							}
							this.setMSBoard();
						}
					}
					this.statusCB(this.status);
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
			const prevMousePos = [this.lastMousePos[0] - event.clientX, this.lastMousePos[1] - event.clientY];
			this.lastMousePos = [event.clientX, event.clientY];

			this.draggedPiece.style.top = `${this.draggedPiece.offsetTop - prevMousePos[1]}px`;
			this.draggedPiece.style.left = `${this.draggedPiece.offsetLeft - prevMousePos[0]}px`;
		}
	}

	swapTurn() {
		let tokens = this.game.fen().split(" ");
		tokens[1] = this.game.turn() === "b" ? "w" : "b";
		this.game.load(tokens.join(" "));
	}

	flipBoard() {
		for (var i = 1; i < this.element.childNodes.length; i++) {
			this.element.insertBefore(this.element.childNodes[i], this.element.firstChild);
		}
	}

	resetBoard() {
		this.gameOver = false;
		this.game.reset();
		Object.values(this.squares).forEach((square) => {
			square.clear();
		});
		this.setBoard();
	}

	setBoard() {
		this.setMSBoard();
		this.game.board().reverse().forEach((rank, ri) => {
			rank.forEach((square, fi) => {
				if (square !== null) {
					const piece = new Piece({ color: square.color, type: square.type, size: `${this.squareSize}px` });
					this.squares[`${files[fi]}${ri + 1}`].addPiece(piece.element);
					this.pieceElements.set(piece.element, piece);
				}
			});
		});
		this.status = "White to move.";
		this.statusCB(this.status);
	}

	setMSBoard() {
		let mineLocs = [];
		while (mineLocs.length < 8) {
			let loc = Math.floor(Math.random() * Object.keys(this.squares).length);
			if (mineLocs.indexOf(loc) === -1) {
				mineLocs.push(loc);
			}
		}

		Object.values(this.squares).forEach((s) => {
			s.resetMS();
		});
		Object.values(this.squares).forEach((s, index) => {
			if (mineLocs.indexOf(index) !== -1) {
				s.addMine();
				this.findAdjacentSquares(index).forEach((ss) => {
					ss.addAdjacentMine();
				});
			}
		});
	}

	disableClicks() {
		Object.values(this.squares).forEach((s) => {
			s.disableClicks();
		});
	}

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
}