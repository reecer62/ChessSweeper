export default class Square {
	constructor({ rank, file, bg }) {
		this.rank = rank;
		this.file = file;
		this.element = document.createElement("div");
		this.element.classList.add("Square");
		this.element.style.background = bg;
	}
}