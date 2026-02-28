import { CONFIG } from './config.js';
import { GameState } from './GameState.js';
import { GameRenderer } from './GameRenderer.js';
import { UIManager } from './UIManager.js';
import { Leaderboard } from './Leaderboard.js';

export class Game {
    constructor() {
        this.state = new GameState();
        this.gameCompleted = false;
        this.leaderboard = new Leaderboard();
        this.uiManager = new UIManager(this.state, {
            onResetRound: () => this.resetRound(),
            onQuitGame: () => this.quitGame(),
            onChangeDiskCount: (diskCount) => this.changeDiskCount(diskCount),
            onUndoMove: () => this.undoMove(),
            onResetGame: () => this.resetGame()
        });
        this.cheerSound = new Audio(CONFIG.ASSETS.CHEER_SOUND);
        this.setupP5();
    }

    setupP5() {
        this.p5Instance = new p5((p) => {
            this.renderer = new GameRenderer(this.state, p);

            p.setup = () => {
                this.renderer.setup();
                this.state.reset();
                this.uiManager.updateStats();
                this.leaderboard.updateDisplay();
            };

            p.draw = () => {
                this.renderer.draw();
                this.uiManager.updateTimer();
            };

            p.mousePressed = () => {
                if (!this.state.gameWon) {
                    const pole = this.renderer.getPoleAtPosition(p.mouseX);
                    if (pole !== -1 && p.mouseY < p.height - 40 && this.state.poles[pole].length > 0) {
                        this.state.selectedPole = pole;
                        this.state.selectedDisk = this.state.poles[pole][this.state.poles[pole].length - 1];
                        this.state.startTimer();
                    }
                }
            };

            p.mouseReleased = () => {
                if (this.state.selectedDisk !== null) {
                    const targetPole = this.renderer.getPoleAtPosition(p.mouseX);
                    if (targetPole !== -1) {
                        if (this.state.moveDisk(this.state.selectedPole, targetPole)) {
                            this.uiManager.updateStats();
                            if (this.state.checkWin()) {
                                this.handleWin();
                            }
                        } else {
                            this.uiManager.showIllegalMoveWarning();
                        }
                    }
                    this.state.selectedDisk = null;
                    this.state.selectedPole = null;
                }
            };

            p.keyPressed = () => {
                const keyToPole = { '1': 0, '2': 1, '3': 2 };
                if (!(p.key in keyToPole) || this.state.gameWon || this.gameCompleted) {
                    return;
                }

                const pole = keyToPole[p.key];
                if (this.state.selectedPole === null) {
                    if (this.state.poles[pole].length > 0) {
                        this.state.selectedPole = pole;
                        this.state.selectedDisk = this.state.poles[pole][this.state.poles[pole].length - 1];
                        this.state.startTimer();
                    }
                    return;
                }

                if (this.state.moveDisk(this.state.selectedPole, pole)) {
                    this.uiManager.updateStats();
                    if (this.state.checkWin()) {
                        this.handleWin();
                    }
                } else {
                    this.uiManager.showIllegalMoveWarning();
                }

                this.state.selectedPole = null;
                this.state.selectedDisk = null;
            };
        });
    }

    handleWin() {
        this.state.gameWon = true;
        this.state.totalTime += this.state.stopTimer();
        this.cheerSound.play();

        if (this.state.roundNumber < CONFIG.GAME.MAX_ROUNDS) {
            this.startNextRound();
        } else {
            this.completeGame();
        }
    }

    startNextRound() {
        this.state.totalMoves += this.state.moves;
        this.state.roundNumber++;
        this.state.diskCount++;

        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            this.state.reset();
            this.uiManager.updateStats();
            this.uiManager.setTimerDisplay(0);
            document.getElementById('diskCount').value = this.state.diskCount.toString();
        }, 1000);
    }

    completeGame() {
        if (this.gameCompleted) {
            return;
        }

        this.gameCompleted = true;
        this.state.totalMoves += this.state.moves;

        if (this.leaderboard.isQualifyingScore(this.state.totalTime, this.state.totalMoves)) {
            this.showInitialsPrompt();
        } else {
            this.uiManager.showGameCompleteDialog();
        }
    }

    showInitialsPrompt() {
        this.uiManager.showInitialsPrompt((initials) => {
            this.leaderboard.addScore(initials, this.state.totalTime, this.state.totalMoves);
            this.uiManager.showGameCompleteDialog();
            this.leaderboard.updateDisplay();
        });
    }

    resetRound() {
        this.state.reset();
        this.uiManager.updateStats();
        this.uiManager.setTimerDisplay(0);
    }

    changeDiskCount(diskCount) {
        if (Number.isNaN(diskCount) || diskCount < 3 || diskCount > 8) {
            return;
        }

        this.state.roundNumber = diskCount - 2;
        this.state.diskCount = diskCount;
        this.state.reset();
        this.uiManager.updateStats();
        this.uiManager.setTimerDisplay(0);
    }

    undoMove() {
        if (this.state.gameWon || this.gameCompleted) {
            return;
        }

        const undone = this.state.undoMove();
        if (undone) {
            this.uiManager.updateStats();
        }
    }

    quitGame() {
        this.resetGame();
    }

    resetGame() {
        this.gameCompleted = false;
        this.state.diskCount = 3;
        this.state.roundNumber = 1;
        this.state.totalMoves = 0;
        this.state.totalTime = 0;
        this.state.reset();

        document.getElementById('diskCount').value = '3';
        this.uiManager.setTimerDisplay(0);

        this.uiManager.updateStats();
        this.leaderboard.updateDisplay();
    }

    cleanup() {
        this.renderer.cleanup();
        this.uiManager.cleanup();
    }
}

// Initialize game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
