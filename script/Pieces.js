export const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const numbers = ["1", "2", "3", "4", "5", "6", "7", "8"];

class Piece {
    constructor(color, position, theme, board, letter) {
        this.color = color;
        this.position = position;
        this.theme = theme;
        this.board = board;
        this.board[this.position] = this;
        this.letter = letter;
        this.image = new Image();
        this.image.src = "./img/" + this.theme + "/" + this.color[0] + this.letter + ".png";
        this.selected = false;
        this.firstMove = true;
        this.moves = [];
    }

    // checks if there is a piece on current cell and adds cell coordinates to moves array
    checkCell(letter, number, moves) {
            if (this.board[letter + String(number)] !== null) {
                if (this.board[letter + String(number)].color !== this.color)
                    moves.push(letter + String(number));
                return false;
            }
            moves.push(letter + String(number));
            return true;
        }

    // finds all diagonal moves for current position
    diagonalMoves() {
        let moves = [];
        let start_x = this.position[0];
        let start_y = Number(this.position[1]);

        // right up
        let i = 1;
        while (start_x.charCodeAt(0) + i <= letters[7].charCodeAt(0) && start_y + i <= 8) {
            if (!this.checkCell(String.fromCharCode(start_x.charCodeAt(0) + i), start_y + i, moves))
                break;
            i++;
        }

        // right down
        i = 1;
        while (start_x.charCodeAt(0) + i <= letters[7].charCodeAt(0) && start_y - i >= 1) {
            if (!this.checkCell(String.fromCharCode(start_x.charCodeAt(0) + i), start_y - i, moves))
                break;
            i++;
        }

        // left down
        i = 1;
        while (start_x.charCodeAt(0) - i >= letters[0].charCodeAt(0) && start_y - i >= 1) {
            if (!this.checkCell(String.fromCharCode(start_x.charCodeAt(0) - i), start_y - i, moves))
                break;
            i++;
        }

        // left up
        i = 1;
        while (start_x.charCodeAt(0) - i >= letters[0].charCodeAt(0) && start_y + i <= 8) {
            if (!this.checkCell(String.fromCharCode(start_x.charCodeAt(0) - i), start_y + i, moves))
                break;
            i++;
        }

        return moves;
    }

    // finds all horizontal and vertical moves for current position
    horizontalAndVerticalMoves() {
        let moves = [];
        let start_x = this.position[0];
        let start_y = Number(this.position[1]);

        // up vertical direction
        for (let i = start_y + 1; i <= 8; i++) {
            if (!this.checkCell(start_x, i, moves))
                break;
        }

        // down vertical direction
        for (let i = start_y - 1; i >= 1; i--) {
            if (!this.checkCell(start_x, i, moves))
                break;
        }

        // right horizontal direction
        for (let i = start_x.charCodeAt(0) + 1; i <= letters[7].charCodeAt(0); i++) {
            if (!this.checkCell(String.fromCharCode(i), start_y, moves))
                break;
        }

        // left horizontal direction
        for (let i = start_x.charCodeAt(0) - 1; i >= letters[0].charCodeAt(0); i--) {
            if (!this.checkCell(String.fromCharCode(i), start_y, moves))
                break;
        }

        return moves;
    }

    // finds moves in unusual directions. used for Knight's and King's moves
    findDirections(directions) {
        let moves = [];
        let start_x = this.position[0];
        let start_y = Number(this.position[1]);

        for (let d of directions) {
            let letter = start_x.charCodeAt(0) + d[0];
            let number = start_y + d[1];
            if (letters[0].charCodeAt(0) <= letter && letter <= letters[7].charCodeAt(0) && 1 <= number && number <= 8)
                this.checkCell(String.fromCharCode(letter), number, moves);
        }

        return moves;
    }

    // method which helps to implement special moves as castling or en passant
    move(position) {
        this.board[this.position] = null;
        this.position = position;
        this.board[position] = this;
        this.firstMove = false;
    }
}

export class Rook extends Piece {
    constructor(color, position, theme, board) {
        super(color, position, theme, board, "R");
    }

    // horizontal and vertical moves
    allMoves() {
        this.moves = this.horizontalAndVerticalMoves();
        return this.moves;
    }
}

export class Bishop extends Piece {
    constructor(color, position, theme, board) {
        super(color, position, theme, board, "B");
    }

    // diagonal moving
    allMoves() {
        this.moves = this.diagonalMoves();
        return this.moves;
    }
}

export class Knight extends Piece {
    constructor(color, position, theme, board) {
        super(color, position, theme, board, "N");
    }

    // Knight moves 2 cell horizontally or vertically and 1 cell diagonally
    allMoves() {
        this.moves = this.findDirections([[-2, 1], [-2, -1], [2, 1], [2, -1], [1, -2], [1, 2], [-1, -2], [-1, 2]]);
        return this.moves;
    }
}

export class Queen extends Piece {
    constructor(color, position, theme, board) {
        super(color, position, theme, board, "Q");
    }

    // Queen moves horizontally, vertically and diagonally
    allMoves() {
        this.moves = [...this.horizontalAndVerticalMoves(), ...this.diagonalMoves()];
        return this.moves;
    }
}

export class King extends Piece {
    constructor(color, position, theme, board) {
        super(color, position, theme, board, "K");
        this.check = false;
        this.castled = false;
    }

    // King moves in all directions for 1 cell
    allMoves() {
        this.moves = this.findDirections([[0, -1], [0, 1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
        for (let i = this.moves.length - 1; i >= 0; i--) {
            let letter = this.moves[i][0];
            let number = Number(this.moves[i][1]);
            if (isCellAttacked(letter, number, this.board, this.color)) {
                this.moves.splice(i, 1);
            }
        }

        // castling conditions
        if (this.color === "white" && !this.castled) {
            // short white castling
            if (this.firstMove && this.board["h1"].firstMove && this.board["f1"] == null && this.board["g1"] == null &&
                !isCellAttacked("f", 1, this.board, "white") && !isCellAttacked("g", 1, this.board, "white") &&
                !isCellAttacked("e", 1, this.board, "white"))
            {
                this.moves.push("g1");
            }

            // long white castling
            if (this.firstMove && this.board["a1"].firstMove && this.board["b1"] == null && this.board["c1"] == null &&
                this.board["d1"] == null && !isCellAttacked("c", 1, this.board, "white") &&
                !isCellAttacked("d", 1, this.board, "white") &&
                !isCellAttacked("e", 1, this.board, "white"))
            {
                this.moves.push("c1");
            }

        } else if (this.color === "black" && !this.castled) {
            // short black castling
            if (this.firstMove && this.board["h8"].firstMove && this.board["f8"] == null && this.board["g8"] == null &&
                !isCellAttacked("f", 8, this.board, "black") && !isCellAttacked("g", 8, this.board, "black") &&
                !isCellAttacked("e", 8, this.board, "black"))
            {
                this.moves.push("g8");
            }

            // long black castling
            if (this.firstMove && this.board["a8"].firstMove && this.board["b8"] == null && this.board["c8"] == null &&
                this.board["d8"] == null && !isCellAttacked("c", 8, this.board, "black") &&
                !isCellAttacked("d", 8, this.board, "black") &&
                !isCellAttacked("e", 8, this.board, "black"))
            {
                this.moves.push("c8");
            }
        }

        return this.moves;
    }

    move(position) {
        if (this.color === "white" && position === "g1" && this.firstMove) {
            this.board[this.position] = null;
            this.position = position;
            this.board[position] = this;
            let rook = this.board["h1"];
            rook.position = "f1";
            this.board["h1"] = null;
            this.board["f1"] = rook;
            rook.firstMove = false;
            this.firstMove = false;
            this.castled = true;
        }
        else if (this.color === "white" && position === "c1" && this.firstMove) {
            this.board[this.position] = null;
            this.position = position;
            this.board[position] = this;
            let rook = this.board["a1"];
            rook.position = "d1";
            this.board["a1"] = null;
            this.board["d1"] = rook;
            rook.firstMove = false;
            this.firstMove = false;
            this.castled = true;
        }
        else if (this.color === "black" && position === "g8" && this.firstMove) {
            this.board[this.position] = null;
            this.position = position;
            this.board[position] = this;
            let rook = this.board["h8"];
            rook.position = "f8";
            this.board["h8"] = null;
            this.board["f8"] = rook;
            rook.firstMove = false;
            this.firstMove = false;
            this.castled = true;
        }
        else if (this.color === "black" && position === "c8" && this.firstMove) {
            this.board[this.position] = null;
            this.position = position;
            this.board[position] = this;
            let rook = this.board["a8"];
            rook.position = "d8";
            this.board["a8"] = null;
            this.board["d8"] = rook;
            rook.firstMove = false;
            this.firstMove = false;
            this.castled = true;
        }
        else
            super.move(position);
    }
}

export class Pawn extends Piece {
    constructor(color, position, theme, board) {
        super(color, position, theme, board, "P");
        this.letter = "P";
        this.enPassant = false;
    }

    // Pawn moves forward for 1 or 2 cells, can eat piece diagonally for 1 cell
    allMoves() {
        this.moves = [];
        let start_x = this.position[0];
        let start_y = Number(this.position[1]);

        if (this.color === "white") {
            if (start_y + 1 <= 8 && this.board[start_x + String(start_y + 1)] == null)
                this.moves.push(start_x + String(start_y + 1));
            if (this.firstMove && this.board[start_x + String(start_y + 1)] == null &&
                this.board[start_x + String(start_y + 2)] == null)
                this.moves.push(start_x + String(start_y + 2));
            for (let d of this.findDirections([[1, 1], [-1, 1]])) {
                if (this.board[d] != null && this.board[d].color !== this.color)
                    this.moves.push(d);
            }
        } else {
            if (start_y - 1 >= 1 && this.board[start_x + String(start_y - 1)] == null)
                this.moves.push(start_x + String(start_y - 1));
            if (this.firstMove && this.board[start_x + String(start_y - 1)] == null &&
                this.board[start_x + String(start_y - 2)] == null)
                this.moves.push(start_x + String(start_y - 2));
            for (let d of this.findDirections([[1, -1], [-1, -1]])) {
                if (this.board[d] != null && this.board[d].color !== this.color)
                    this.moves.push(d);
            }
        }

        // en passant conditions


        return this.moves;
    }
}

function isCellAttacked(letter, number, board, color) {
    // HORIZONTAL DIRECTIONS
    // right horizontal direction
    for (let i = letter.charCodeAt(0) + 1; i <= letters[7].charCodeAt(0); i++) {
        let cell = board[String.fromCharCode(i) + String(number)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Rook || cell instanceof Queen ||
                (cell instanceof King && i - letter.charCodeAt(0) === 1)))
                return true;
            break;
        }
    }

    // left horizontal direction
    for (let i = letter.charCodeAt(0) - 1; i >= letters[0].charCodeAt(0); i--) {
        let cell = board[String.fromCharCode(i) + String(number)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Rook || cell instanceof Queen ||
                (cell instanceof King && letter.charCodeAt(0) - i === 1)))
                return true;
            break;
        }
    }

    // VERTICAL DIRECTIONS
    // vertical up direction
    for (let i = number + 1; i <= 8; i++) {
        let cell = board[letter + String(i)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Rook || cell instanceof Queen ||
                (cell instanceof King && i - number === 1)))
                return true;
            break;
        }
    }

    // vertical down direction
    for (let i = number - 1; i >= 1; i--) {
        let cell = board[letter + String(i)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Rook || cell instanceof Queen ||
                (cell instanceof King && number - i === 1)))
                return true;
            break;
        }
    }

    // DIAGONAL DIRECTIONS
    // right up direction
    let i = 1;
    while (letter.charCodeAt(0) + i <= letters[7].charCodeAt(0) && number + i <= 8) {
        let cell = board[String.fromCharCode(letter.charCodeAt(0) + i) + String(number + i)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Bishop || cell instanceof Queen ||
                ((cell instanceof King || (cell instanceof Pawn && cell.color === "black")) && i === 1))) {
                return true;
            }
            break;
        }
        i++;
    }

    // right down direction
    i = 1;
    while (letter.charCodeAt(0) + i <= letters[7].charCodeAt(0) && number - i >= 1) {
        let cell = board[String.fromCharCode(letter.charCodeAt(0) + i) + String(number - i)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Bishop || cell instanceof Queen ||
                ((cell instanceof King || (cell instanceof Pawn && cell.color === "white")) && i === 1))) {
                return true;
            }
            break;
        }
        i++;
    }

    // left down direction
    i = 1;
    while (letter.charCodeAt(0) - i >= letters[0].charCodeAt(0) && number - i >= 1) {
        let cell = board[String.fromCharCode(letter.charCodeAt(0) - i) + String(number - i)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Bishop || cell instanceof Queen ||
                ((cell instanceof King || (cell instanceof Pawn && cell.color === "white")) && i === 1))) {
                return true;
            }
            break;
        }
        i++;
    }

    // left up direction
    i = 1;
    while (letter.charCodeAt(0) - i >= letters[0].charCodeAt(0) && number + i <= 8) {
        let cell = board[String.fromCharCode(letter.charCodeAt(0) - i) + String(number + i)];
        if (cell != null) {
            if (cell.color !== color && (cell instanceof Bishop || cell instanceof Queen ||
                ((cell instanceof King || (cell instanceof Pawn && cell.color === "black")) && i === 1))) {
                return true;
            }
            break;
        }
        i++;
    }

    // check for Knights
    for (let d of [[-2, 1], [-2, -1], [2, 1], [2, -1], [1, -2], [1, 2], [-1, -2], [-1, 2]]) {
        let x = letter.charCodeAt(0) + d[0];
        let y = number + d[1];
        if (x < letters[0].charCodeAt(0) || x > letters[7].charCodeAt(0) || y < 1 || y > 8)
            continue;
        let cell = board[String.fromCharCode(x) + String(y)];
        if (cell != null) {
            if (cell.color !== color && cell instanceof Knight)
                return true;
        }
    }

    return false;
}

// TODO: en passant
// TODO: pawn promotion
// TODO: check, checkmate
// TODO: xray
// TODO: array of pieces that can be moved

