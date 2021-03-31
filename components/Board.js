import Square from "./Square.js"

const files = ["a", "b", "c", "d", "e", "f", "g", "h"]

export default class Board {
	constructor({ selector, size }) {
		this.size = size;
		this.squares = [];
		this.element = document.querySelector(selector);
		this.element.classList.add("Board");

		this.init();
	}

	init() {
		this.element.style.width = this.size;
		this.element.style.height = this.size;

		this.squares = Array.from({ length: 64 }, (_, index) => {
			const rank = 8 - Math.floor(index / 8);
			const fileNum = index % 8;
			const file = files[fileNum];
			const bg = rank % 2 === fileNum % 2 ? "white" : "gray"
			const square = new Square({ rank, file, bg });
			this.element.appendChild(square.element);
			return square;
		});
	}
}