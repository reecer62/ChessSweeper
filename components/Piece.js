export default class Piece {
	element;
	type;
	color;

	constructor({ type, color, size }) {
		this.type = type;
		this.color = color;

		this.element = document.createElement("img");
		this.element.setAttribute("src", `assets/${color}${type}.png`);
		this.element.classList.add("Piece");
		if (color == "b") {
			this.element.classList.add("black");
		} else {
			this.element.classList.add("white");
		}
		this.element.style.width = size;
		this.element.style.height = size;
		this.element.style.zIndex = 0;
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