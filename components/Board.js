import Piece from "./Piece.js";
import Square from "./Square.js"

const files = ["a", "b", "c", "d", "e", "f", "g", "h"]

export default class Board {
	constructor({ selector, size }) {
		this.size = size;
		this.squares = {};
		this.squareElements = new Map();
		this.element = document.querySelector(selector);
		this.element.classList.add("Board");
		this.chess = new Chess();

		this.init();

		this.dragging = false;
		this.lastMousePos = [];
		this.draggedPiece;
		this.prevSquare;
		this.element.onmousedown = (event) => {
			event.preventDefault();
			this.dragging = true;
			this.prevSquare = this.squareElements.get(document.elementsFromPoint(event.clientX, event.clientY).find(e => Array.prototype.slice.call(e.classList).includes("Square")));
			this.lastMousePos = [event.clientX, event.clientY];
			this.draggedPiece = event.target;
			this.draggedPiece.style.position = "absolute";
			this.draggedPiece.style.zIndex = 1;
		}
		this.element.onmouseup = (event) => {
			event.preventDefault();
			this.dragging = false;
			this.lastMousePos = [];
			this.prevSquare.removePiece(this.draggedPiece);
			const newSquare = this.squareElements.get(document.elementsFromPoint(event.clientX, event.clientY).find(e => Array.prototype.slice.call(e.classList).includes("Square")));
			newSquare.addPiece(this.draggedPiece);
			this.draggedPiece.style.position = null;
			this.draggedPiece.style.zIndex = 0;
			this.draggedPiece = null;
			this.prevSquare = null;
		};
		this.element.onmousemove = (event) => {
			if (this.dragging) {
				event.preventDefault();
				let prevMousePos = [this.lastMousePos[0] - event.clientX, this.lastMousePos[1] - event.clientY];
				this.lastMousePos = [event.clientX, event.clientY];

				this.draggedPiece.style.top = `${this.draggedPiece.offsetTop - prevMousePos[1]}px`;
				this.draggedPiece.style.left = `${this.draggedPiece.offsetLeft - prevMousePos[0]}px`;
			}
		};
	}

	init() {
		this.element.style.width = this.size;
		this.element.style.height = this.size;

		for (let i = 0; i < 64; i++) {
			const rank = 8 - Math.floor(i / 8);
			const fileNum = i % 8;
			const file = files[fileNum];
			const bg = rank % 2 === fileNum % 2 ? "white" : "gray"
			const square = new Square({ rank, file, bg });
			this.element.appendChild(square.element);
			this.squareElements.set(square.element, square);
			this.squares[`${file}${rank}`] = square;
		}

		let squareSize = Object.values(this.squares)[0].size;

		this.chess.board().forEach((rank, ri) => {
			rank.forEach((square, fi) => {
				if (!(square === null)) {
					const piece = new Piece({ type: `${square.color}${square.type}`, size: `${squareSize}px` });
					this.squares[`${files[fi]}${ri + 1}`].addPiece(piece.element);
				}
			});
		});
	}
}