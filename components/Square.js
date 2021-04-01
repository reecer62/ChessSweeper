export default class Square {
	element;

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
		} else {
			this.element.removeChild(this.piece);
			this.piece = piece;
			this.element.appendChild(piece);
		}
	}

	removePiece(piece) {
		if (this.piece !== null) {
			this.piece = null;
			this.element.removeChild(piece);
		}
	}

	clear() {
		this.piece = null;
		this.element.textContent = "";
	}

	fixSize() {
		this.element.style.maxHeight = `${this.element.clientHeight}px`;
		this.element.style.maxWidth = `${this.element.clientWidth}px`;
	}

	get size() {
		return this.element.clientHeight;
	}

	get element() {
		return this.element;
	}

	get position() {
		return `${this.file}${this.rank}`;
	}
}