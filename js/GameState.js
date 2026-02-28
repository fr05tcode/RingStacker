import { CONFIG } from './config.js';

export class GameState {
    constructor() {
        this.poles = [];
        this.selectedDisk = null;
        this.selectedPole = null;
        this.diskCount = 3;
        this.moves = 0;
        this.startTime = null;
        this.gameStarted = false;
        this.timerInterval = null;
        this.gameWon = false;
        this.warningTimeout = null;
        this.totalMoves = 0;
        this.totalTime = 0;
        this.lastUpdateTime = null;
        this.roundNumber = 1;
        this.hasSeenInstructions = false;
        this.moveHistory = [];
    }

    reset() {
        this.poles = [];
        this.selectedDisk = null;
        this.selectedPole = null;
        this.moves = 0;
        this.startTime = null;
        this.gameStarted = false;
        this.gameWon = false;
        this.lastUpdateTime = null;
        this.moveHistory = [];
        this.initializePoles();
    }

    initializePoles() {
        this.poles = Array(CONFIG.GAME.POLE_COUNT).fill().map(() => []);
        for (let i = this.diskCount; i > 0; i--) {
            this.poles[0].push(i);
        }
    }

    isValidMove(fromPole, toPole) {
        if (fromPole === toPole) return false;
        if (this.poles[fromPole].length === 0) return false;
        if (this.poles[toPole].length === 0) return true;

        const movingDisk = this.poles[fromPole][this.poles[fromPole].length - 1];
        const topDisk = this.poles[toPole][this.poles[toPole].length - 1];
        return movingDisk < topDisk;
    }

    moveDisk(fromPole, toPole) {
        if (this.isValidMove(fromPole, toPole)) {
            const disk = this.poles[fromPole].pop();
            this.poles[toPole].push(disk);
            this.moves++;
            this.moveHistory.push({ fromPole, toPole, disk });
            return true;
        }
        return false;
    }


    undoMove() {
        if (this.moveHistory.length === 0) return false;

        const lastMove = this.moveHistory.pop();
        const disk = this.poles[lastMove.toPole].pop();

        if (disk !== lastMove.disk) {
            if (disk !== undefined) {
                this.poles[lastMove.toPole].push(disk);
            }
            this.moveHistory.push(lastMove);
            return false;
        }

        this.poles[lastMove.fromPole].push(disk);
        this.moves = Math.max(0, this.moves - 1);
        return true;
    }

    checkWin() {
        return this.poles[CONFIG.GAME.POLE_COUNT - 1].length === this.diskCount &&
               this.poles[CONFIG.GAME.POLE_COUNT - 1].every((disk, index, array) =>
                   index === 0 || disk > array[index - 1]);
    }

    calculateMinMoves() {
        return Math.pow(2, this.diskCount) - 1;
    }

    getElapsedTime() {
        if (!this.startTime) return 0;
        return Date.now() - this.startTime;
    }

    startTimer() {
        if (!this.gameStarted) {
            this.startTime = Date.now();
            this.gameStarted = true;
        }
    }

    stopTimer() {
        this.gameStarted = false;
        return this.getElapsedTime();
    }
}
