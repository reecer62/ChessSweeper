export default class Square {
	element;

	constructor({ rank, file, bg }) {
		this.rank = rank;
		this.file = file;
		this.piece = null;
		this.msStatus = "";
		this.flag = null;
		this.clickedOn = false;

		this.element = document.createElement("div");
		this.element.classList.add("Square");
		this.element.classList.add(bg);
		this.element.style.background = bg == "light" ? "#d7ccba" : "#bda193";

		this.element.onmouseup = (event) => {
			if (this.clickedOn && this.msStatus == "raised" && this.piece === null) {
				if (event.button == 0) {
					if (this.flag) {
						this.element.removeChild(this.flag);
						this.flag = null;
					}
					this.sink();
				} else if (event.button == 2) {
					if (this.flag) {
						this.element.removeChild(this.flag);
						this.flag = null;
					} else {
						this.flag = document.createElement("img");
						this.flag.setAttribute("src", "assets/flag.png");
						this.flag.style.width = `${this.element.clientWidth}px`;
						this.flag.style.height = `${this.element.clientHeight}px`;
						this.element.appendChild(this.flag);
					}
				}
			}
			this.clickedOn = false;
		};

		this.element.onmousedown = (event) => {
			this.clickedOn = true;
		};
	}

	addPiece(piece) {
		if (this.piece !== null) {
			this.element.removeChild(this.piece);
		}
		this.piece = piece;
		this.element.appendChild(piece);
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
		this.element.style.setProperty("--raisedSize", `${this.element.clientHeight / 10}px`);
		this.element.style.setProperty("--sunkenSize", `${this.element.clientHeight / 20}px`);
	}

	raise() {
		this.element.classList.remove("sunken");
		this.element.classList.add("raised");
		this.msStatus = "raised";
	}

	sink() {
		this.element.classList.remove("raised");
		this.element.classList.add("sunken");
		this.msStatus = "sunken";
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