export default class Square {
	element;

	constructor({ rank, file, bg, flagCB }) {
		this.rank = rank;
		this.file = file;
		this.bg = bg;
		this.flagCB = flagCB;

		this.piece = null;
		this.msStatus = "";
		this.flag = null;
		this.clickedOn = false;
		this.asset = null;
		this.rankLabel = null;
		this.fileLabel = null;

		this.element = document.createElement("div");
		this.element.style.position = "relative";
		this.element.classList.add("Square");
		this.element.classList.add(this.bg);

		this.element.onmousedown = () => {
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
	}

	removePiece() {
		if (this.piece !== null) {
			this.element.removeChild(this.piece);
			this.piece = null;
		}
		if (this.flag !== null) {
			this.displayChild(this.flag);
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
			if (this.flagCB(-1)) {
				this.element.removeChild(this.flag);
				this.flag = null;
			}
		}
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
		if (this.asset !== null) {
			this.element.removeChild(this.asset);
			this.asset = null;
		}
	}

	sink(asset) {
		this.element.classList.remove("raised");
		this.element.classList.add("sunken");
		this.msStatus = "sunken";
		if (asset) {
			this.asset = document.createElement("img");
			this.asset.setAttribute("src", `assets/minesweeper/${asset}.svg`);
			this.displayChild(this.asset);
			this.element.appendChild(this.asset);
		}
	}

	resetMS() {
		this.removeFlag();
		this.raise();
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