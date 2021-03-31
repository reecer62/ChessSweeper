export default class Piece {
	element;

	constructor({ type, size }) {
		this.type = type;
		this.element = document.createElement("img");
		this.element.setAttribute("src", `assets/${type}.png`);
		this.element.classList.add("Piece");
		this.element.style.width = size;
		this.element.style.height = size;
		this.element.style.zIndex = 0;
	}

	get element() {
		return this.element;
	}
}