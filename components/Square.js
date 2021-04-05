export default class Square {
	element;

	constructor({ rank, file, bg, mineCB }) {
		this.rank = rank;
		this.file = file;
		this.mineCB = mineCB;

		this.piece = null;
		this.msStatus = "";
		this.flag = null;
		this.clickedOn = false;
		this.mine = null;
		this.canClick = true;
		this.adjacentMines = 0;
		this.mineCount = null;

		this.element = document.createElement("div");
		this.element.classList.add("Square");
		this.element.classList.add(bg);
		this.element.style.background = bg == "light" ? "#d7ccba" : "#bda193";

		this.element.onmouseup = (event) => {
			if (this.canClick && this.clickedOn && this.msStatus == "raised" && this.piece === null) {
				if (event.button == 0) {
					if (this.flag !== null) {
						this.element.removeChild(this.flag);
						this.flag = null;
					}
					this.sink();
					if (this.mine !== null) {
						this.mineCB();
					}
				} else if (event.button == 2) {
					if (this.flag !== null) {
						this.element.removeChild(this.flag);
						this.flag = null;
					} else {
						this.flag = document.createElement("img");
						this.flag.setAttribute("src", "assets/minesweeper/flag.png");
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
		if (this.flag !== null) {
			this.element.removeChild(this.flag);
		}
		this.piece = piece;
		this.element.appendChild(piece);
	}

	removePiece() {
		if (this.piece !== null) {
			this.element.removeChild(this.piece);
			this.piece = null;
		}
	}

	removeFlag() {
		if (this.flag !== null) {
			this.element.removeChild(this.flag);
			this.flag = null;
		}
	}

	addMine() {
		this.mine = document.createElement("img");
		this.mine.setAttribute("src", "assets/minesweeper/mine.png");
		this.mine.style.width = `${this.element.clientWidth}px`;
		this.mine.style.height = `${this.element.clientHeight}px`;
	}

	removeMine() {
		if (this.mine !== null) {
			if (this.msStatus == "sunken") {
				this.element.removeChild(this.mine);
			}
			this.mine = null;
		}
	}

	hasMine() {
		return (this.mine !== null);
	}

	addAdjacentMine() {
		this.adjacentMines++;
	}

	clear() {
		this.element.textContent = "";
		this.piece = null;
		this.msStatus = "";
		this.flag = null;
		this.clickedOn = false;
		this.mine = null;
		this.canClick = true;
		this.adjacentMines = 0;
		this.mineCount = null;
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
		if (this.mineCount !== null) {
			this.element.removeChild(this.mineCount);
			this.mineCount = null;
		}
	}

	sink() {
		this.element.classList.remove("raised");
		this.element.classList.add("sunken");
		this.msStatus = "sunken";
		if (this.mine !== null) {
			this.element.appendChild(this.mine);
		} else if (this.adjacentMines !== 0) {
			this.mineCount = document.createTextNode(this.adjacentMines);
			this.element.appendChild(this.mineCount);
		}
	}
	
	resetMS() {
		this.removeMine();
		this.removeFlag();
		this.raise();
		this.adjacentMines = 0;
	}

	disableClicks() {
		this.canClick = false;
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