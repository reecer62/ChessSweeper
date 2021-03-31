export default class Square {
	constructor({ rank, file, bg }) {
		this.rank = rank;
		this.file = file;
		this.element = document.createElement("div");
		this.element.classList.add("Square");
		this.element.style.background = bg;
		this.piece = null;
	}

	addPiece(piece) {
		if (this.piece === null) {
			this.piece = piece;
			this.element.appendChild(piece);
		}
	}

	removePiece(piece) {
		this.piece = null;
		this.element.removeChild(piece);
	}

	get size() {
		return this.element.clientHeight;
	}
}