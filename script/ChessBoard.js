import {Queen, King, Pawn, Knight, Bishop, Rook, letters, numbers} from "./Pieces.js";

export class ChessBoard {

    constructor(canvas, context) {
        // code bellow increases canvas resolution
        canvas.width = 900;
        canvas.height = 900;

        // initializing fields for drawing on canvas
        this.cellWidth = canvas.width / 8;
        this.cellHeight = canvas.height / 8;
        this.canvas = canvas;
        this.context = context;

        this.reverseBoard = false;
        this.turn = "white";
        this.selectedPiece = null;

        // theme and colors
        this.theme = "staunty";
        this.darkColor = "rgba(118, 150, 86, 1)";  // 180, 140, 100 - brown board theme
        this.brightColor = "rgba(238, 238, 210, 1)";  // 243, 219, 180 - brown board theme

        // stores information about all cells of chessboard
        // key - coordinate of cell in chess notation, value - Piece or null
        this.board = {
            "a8": null,
            "b8": null,
            "c8": null,
            "d8": null,
            "e8": null,
            "f8": null,
            "g8": null,
            "h8": null,
            "a7": null,
            "b7": null,
            "c7": null,
            "d7": null,
            "e7": null,
            "f7": null,
            "g7": null,
            "h7": null,
            "a6": null,
            "b6": null,
            "c6": null,
            "d6": null,
            "e6": null,
            "f6": null,
            "g6": null,
            "h6": null,
            "a5": null,
            "b5": null,
            "c5": null,
            "d5": null,
            "e5": null,
            "f5": null,
            "g5": null,
            "h5": null,
            "a4": null,
            "b4": null,
            "c4": null,
            "d4": null,
            "e4": null,
            "f4": null,
            "g4": null,
            "h4": null,
            "a3": null,
            "b3": null,
            "c3": null,
            "d3": null,
            "e3": null,
            "f3": null,
            "g3": null,
            "h3": null,
            "a2": null,
            "b2": null,
            "c2": null,
            "d2": null,
            "e2": null,
            "f2": null,
            "g2": null,
            "h2": null,
            "a1": null,
            "b1": null,
            "c1": null,
            "d1": null,
            "e1": null,
            "f1": null,
            "g1": null,
            "h1": null
        };

        // pieces of board
        this.pieces = [
            new Rook("black", "a8", this.theme, this.board),
            new Knight("black", "b8", this.theme, this.board),
            new Bishop("black", "c8", this.theme, this.board),
            new Queen("black", "d8", this.theme, this.board),
            new King("black", "e8", this.theme, this.board),
            new Bishop("black", "f8", this.theme, this.board),
            new Knight("black", "g8", this.theme, this.board),
            new Rook("black", "h8", this.theme, this.board),
            new Pawn("black", "a7", this.theme, this.board),
            new Pawn("black", "b7", this.theme, this.board),
            new Pawn("black", "c7", this.theme, this.board),
            new Pawn("black", "d7", this.theme, this.board),
            new Pawn("black", "e7", this.theme, this.board),
            new Pawn("black", "f7", this.theme, this.board),
            new Pawn("black", "g7", this.theme, this.board),
            new Pawn("black", "h7", this.theme, this.board),
            new Pawn("white", "a2", this.theme, this.board),
            new Pawn("white", "b2", this.theme, this.board),
            new Pawn("white", "c2", this.theme, this.board),
            new Pawn("white", "d2", this.theme, this.board),
            new Pawn("white", "e2", this.theme, this.board),
            new Pawn("white", "f2", this.theme, this.board),
            new Pawn("white", "g2", this.theme, this.board),
            new Pawn("white", "h2", this.theme, this.board),
            new Rook("white", "a1", this.theme, this.board),
            new Knight("white", "b1", this.theme, this.board),
            new Bishop("white", "c1", this.theme, this.board),
            new Queen("white", "d1", this.theme, this.board),
            new King("white", "e1", this.theme, this.board),
            new Bishop("white", "f1", this.theme, this.board),
            new Knight("white", "g1", this.theme, this.board),
            new Rook("white", "h1", this.theme, this.board)
        ];

        // stores moves that were made
        this.moves = {};

        this.drawBoard();
        this.drawPieces();

        // event listener for clicking on board
        this.canvas.addEventListener("click", (event) => {
            let origin = this.canvas.getBoundingClientRect();
            // coordinates of canvas
            let x = event.clientX - origin.left;
            let y = event.clientY - origin.top;
            // coordinates in chess notation
            let position = this.coordToChessNot(x, y);
            let cell = this.board[position];

            // if piece was selected already
            if (this.selectedPiece !== null) {
                // if there a piece in selected cell
                if (cell !== null && cell.color === this.turn) {
                    // if this piece was already selected
                    if (cell === this.selectedPiece) {
                        // then unselect this piece
                        this.unselectPiece();
                    } else {
                        // unselect previous piece and select new piece
                        this.selectPiece(cell);
                    }
                } else {
                    // make move and unselect piece
                    let moves = this.selectedPiece.allMoves();
                    if (moves.includes(position)) {
                        this.moveTo(position);

                    } else {
                        // unselect piece
                        this.unselectPiece();
                    }
                }
            } else {
                // if there a piece in selected cell
                if (cell !== null && cell.color === this.turn) {
                    // select piece
                    this.selectPiece(cell);
                }
            }
        });
    }

    // draws chess board
    drawBoard() {
        for (let i = 0; i < 8; i++)
            for (let j = 0; j < 8; j++) {
                let color = (i + j) % 2 === 0 ? this.brightColor : this.darkColor;
                this.drawRectangle(j * this.cellWidth, i * this.cellHeight, this.cellWidth, this.cellHeight, color);
            }
    }

    // draws chess pieces
    drawPieces() {
        for (let piece of this.pieces) {
            let x = this.chessNotToCoord(piece.position)[0];
            let y = this.chessNotToCoord(piece.position)[1];

            piece.image.onload = () => {
                this.context.drawImage(piece.image, x, y, this.cellWidth, this.cellHeight);
            }

            if (piece.image.complete) {
                this.context.drawImage(piece.image, x, y, this.cellWidth, this.cellHeight);
            }
        }
    }

    // updates current state of chess board graphically
    update() {
        this.drawBoard();
        this.drawPieces();
    }

    // selects piece
    selectPiece(piece) {
        if (this.selectedPiece !== null) {
            this.selectedPiece.selected = false;
            this.selectedPiece = piece;
            this.update()
        } else {
            piece.selected = true;
            this.selectedPiece = piece;
        }

        this.highlight(piece);
    }

    // highlights all possible moves of piece
    highlight(piece) {
        let moves = piece.allMoves();
        let pieceCoord = this.chessNotToCoord(piece.position);

        // highlight selected piece
        this.drawRectangle(pieceCoord[0], pieceCoord[1], this.cellWidth, this.cellHeight, "rgba(0, 0, 0, 0.25)");
        this.context.drawImage(piece.image, pieceCoord[0], pieceCoord[1], this.cellWidth, this.cellHeight);

        // highlight all possible moves
        for (let move of moves) {
            let x = this.chessNotToCoord(move)[0] + this.cellWidth / 2;
            let y = this.chessNotToCoord(move)[1] + this.cellHeight / 2;
            this.drawCircle(x, y, this.cellWidth / 8.5, "rgba(0, 0, 0, 0.25)");
        }
    }

    // unselects already selected piece
    unselectPiece() {
        this.selectedPiece.selected = false;
        this.selectedPiece = null;
        this.update();
    }

    // moves piece to given cell
    moveTo(position) {
        // capture piece
        if (this.board[position] != null) {
            this.pieces.splice(this.pieces.indexOf(this.board[position]), 1);
        }


        // if (this.selectedPiece instanceof Pawn) {
        //
        // } else
            this.selectedPiece.move(position);

        this.writeMove();

        this.unselectPiece();
        this.turn = this.turn === "white" ? "black" : "white";
    }

    writeMove(piece, start_pos, end_pos) {

    }

    // transforms chess notation to canvas coordinates
    chessNotToCoord(chessNot) {
        let x, y;
        let letter = chessNot[0];
        let number = chessNot[1];
        if (this.reverseBoard) {
            x = (7 - letters.indexOf(letter)) * this.cellWidth;
            y = numbers.indexOf(number) * this.cellHeight;
        } else {
            x = letters.indexOf(letter) * this.cellWidth;
            y = (7 - numbers.indexOf(number)) * this.cellHeight;
        }

        return [x, y];
    }

    // transforms canvas coordinates to chess notation
    coordToChessNot(x, y) {
        let letter, number;
        x = Math.floor(x / this.cellWidth);
        y = Math.floor(y / this.cellHeight);
        if (this.reverseBoard) {
            letter = letters[7 - x];
            number = numbers[y];
        } else {
            letter = letters[x];
            number = numbers[7 - y];
        }

        return letter + number;
    }

    // draws a rectangle
    drawRectangle(x, y, width, height, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }

    // draws a circle
    drawCircle(x, y, radius, color) {
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = color;
        this.context.fill();
    }
}
