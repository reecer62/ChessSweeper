export default class Square {
	element;

	constructor({ rank, file, bg, mineCB, noAdjacentMinesCB }) {
		this.rank = rank;
		this.file = file;
		this.bg = bg;
		this.mineCB = mineCB;
		this.noAdjacentMinesCB = noAdjacentMinesCB;

		this.piece = null;
		this.msStatus = "";
		this.flag = null;
		this.clickedOn = false;
		this.mine = null;
		this.canClick = true;
		this.adjacentMines = 0;
		this.mineCount = null;
		this.rankLabel = null;
		this.fileLabel = null;

		this.element = document.createElement("div");
		this.element.style.position = "relative";
		this.element.classList.add("Square");
		this.element.classList.add(this.bg);

		this.element.onmouseup = (event) => {
			if (this.canClick && this.clickedOn && this.msStatus == "raised" && this.element === document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Square"))) {
				if (event.button === 0) {
					if (this.flag !== null) {
						this.element.removeChild(this.flag);
						this.flag = null;
					}
					this.sink();
					if (this.mine !== null) {
						this.mineCB();
					}
				} else if (event.button === 2) {
					if (this.flag !== null) {
						this.element.removeChild(this.flag);
						this.flag = null;
					} else {
						this.flag = document.createElement("img");
						this.flag.setAttribute("src", "assets/minesweeper/flag.svg");
						this.displayChild(this.flag);
						this.element.appendChild(this.flag);
					}
				}
			}
			this.clickedOn = false;
		};

		this.element.onmousedown = (event) => {
			this.clickedOn = true;
		};

		this.element.onmousemove = (event) => {
			if (document.elementsFromPoint(event.clientX, event.clientY).find(e => e.classList.contains("Square")) !== this.element) {
				this.clickedOn = false;
			}
		}
	}

	addPiece(piece) {
		if (this.piece !== null) {
			this.element.removeChild(this.piece);
		}
		this.piece = piece;
		this.element.appendChild(piece);
		if (this.flag !== null) {
			this.displayChild(this.flag);
		}
		if (this.mineCount !== null) {
			this.displayChild(this.mineCount);
		}
	}

	removePiece() {
		if (this.piece !== null) {
			this.element.removeChild(this.piece);
			this.piece = null;
		}
		if (this.flag !== null) {
			this.displayChild(this.flag);
		}
		if (this.mineCount !== null) {
			this.displayChild(this.mineCount);
		}
		if (this.mine !== null) {
			this.displayChild(this.mine);
		}
	}

	hasPiece() {
		return this.piece !== null;
	}

	getPiece() {
		return this.piece;
	}

	removeFlag() {
		if (this.flag !== null) {
			this.element.removeChild(this.flag);
			this.flag = null;
		}
	}

	addMine() {
		this.mine = document.createElement("img");
		this.mine.setAttribute("src", "assets/minesweeper/mine.svg");
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
		return this.mine !== null;
	}

	addAdjacentMine() {
		this.adjacentMines++;
	}

	displayChild(child) {
		if (this.piece !== null) {
			child.style.position = "absolute";
			child.style.top = `${this.element.clientWidth * .05}px`;
			child.style.right = `${this.element.clientWidth * .05}px`;
			child.style.width = `${this.element.clientWidth * .3}px`;
			child.style.height = `${this.element.clientHeight * .3}px`;
			child.style.zIndex = 1;
		} else {
			child.style.position = null;
			child.style.top = null;
			child.style.right = null;
			child.style.width = `${this.element.clientWidth * .5}px`;
			child.style.height = `${this.element.clientHeight * .5}px`;
			child.style.zIndex = null;
		}
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
		this.rankLabel = null;
		this.fileLabel = null;
	}

	fixSize() {
		this.element.style.maxHeight = `${this.element.clientHeight}px`;
		this.element.style.maxWidth = `${this.element.clientWidth}px`;
		this.element.style.setProperty("--raisedSize", `${this.element.clientHeight / 10}px`);
		this.element.style.setProperty("--sunkenSize", `${this.element.clientHeight / 15}px`);
	}

	setLabels(labelRank, labelFile) {
		if (labelRank) {
			this.rankLabel = document.createElement("div");
			this.rankLabel.innerHTML = this.rank;
			this.rankLabel.style.position = "absolute";
			this.rankLabel.style.top = `${this.element.clientWidth * .025}px`;
			this.rankLabel.style.left = `${this.element.clientWidth * .025}px`;
			this.rankLabel.style.cursor = "default";
			this.element.appendChild(this.rankLabel);
		} else {
			if (this.rankLabel !== null) {
				this.element.removeChild(this.rankLabel);
			}
		}
		if (labelFile) {
			this.fileLabel = document.createElement("div");
			this.fileLabel.innerHTML = this.file;
			this.fileLabel.style.position = "absolute";
			this.fileLabel.style.bottom = `${this.element.clientWidth * .025}px`;
			this.fileLabel.style.right = `${this.element.clientWidth * .025}px`;
			this.fileLabel.style.cursor = "default";
			this.element.appendChild(this.fileLabel);
		} else {
			if (this.fileLabel !== null) {
				this.element.removeChild(this.fileLabel);
			}
		}
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
			this.displayChild(this.mine);
			this.element.appendChild(this.mine);
		} else if (this.adjacentMines !== 0) {
			this.mineCount = document.createElement("img");
			this.mineCount.setAttribute("src", `assets/minesweeper/${this.adjacentMines}.svg`);
			this.displayChild(this.mineCount);
			this.element.appendChild(this.mineCount);
		} else {
			this.noAdjacentMinesCB(this.position);
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

	getMSStatus() {
		return this.msStatus;
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