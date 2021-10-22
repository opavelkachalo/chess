import {ChessBoard} from "./ChessBoard.js";

const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

let board = new ChessBoard(cvs, ctx);
