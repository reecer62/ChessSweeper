export default class Piece {
	element;
	type;
	color;

	constructor({ type, color, size }) {
		this.type = type;
		this.color = color;

		this.element = document.createElement("div");
		this.element.classList.add("Piece");
		if (color == "b") {
			this.element.classList.add("black");
		} else {
			this.element.classList.add("white");
		}
		this.element.style.width = `${size}px`;
		this.element.style.height = `${size}px`;

		this.piece = document.createElement("img");
		this.piece.setAttribute("src", `assets/chess/${color}${type}.png`);
		this.piece.style.width = `${size * .8}px`;
		this.piece.style.height = `${size * .8}px`;
		this.piece.style.zIndex = 0;
		this.element.appendChild(this.piece);
	}

	get element() {
		return this.element;
	}

	get type() {
		return this.type;
	}

	get color() {
		return this.color;
	}
}