import { CONFIG } from './config.js';
import { GameState } from './GameState.js';
import { GameRenderer } from './GameRenderer.js';
import { UIManager } from './UIManager.js';
import { Leaderboard } from './Leaderboard.js';

export class Game {
    constructor() {
        this.state = new GameState();
        this.leaderboard = new Leaderboard();
        this.uiManager = new UIManager(this.state);
        this.cheerSound = new Audio(CONFIG.ASSETS.CHEER_SOUND);
        this.setupP5();
    }

    setupP5() {
        const p5 = new p5((p) => {
            this.renderer = new GameRenderer(this.state, p);
            
            p.setup = () => {
                this.renderer.setup();
                this.state.reset();
                this.uiManager.updateStats();
            };
            
            p.draw = () => {
                this.renderer.draw();
                this.uiManager.updateTimer();
            };
            
            p.mousePressed = () => {
                if (!this.state.gameWon) {
                    const pole = this.renderer.getPoleAtPosition(p.mouseX);
                    if (pole !== -1 && p.mouseY < p.height - 40) {
                        if (this.state.poles[pole].length > 0) {
                            this.state.selectedPole = pole;
                            this.state.selectedDisk = this.state.poles[pole][this.state.poles[pole].length - 1];
                            this.state.startTimer();
                        }
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
        });
    }

    handleWin() {
        this.state.gameWon = true;
        this.state.stopTimer();
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
            document.getElementById('diskCount').value = this.state.diskCount.toString();
        }, 1000);
    }

    completeGame() {
        this.state.totalMoves += this.state.moves;
        
        if (this.leaderboard.isQualifyingScore(this.state.totalTime)) {
            this.showInitialsPrompt();
        } else {
            this.uiManager.showGameCompleteDialog();
        }
    }

    showInitialsPrompt() {
        const dialog = document.createElement('div');
        dialog.setAttribute('data-dialog-type', 'game-dialog');
        dialog.id = 'initialsDialog';
        
        dialog.innerHTML = `
            <h2>New High Score!</h2>
            <p>Enter your initials (3 characters):</p>
            <input type="text" maxlength="3" style="text-transform: uppercase">
            <button onclick="submitInitials()">Submit</button>
        `;
        
        document.body.appendChild(dialog);
        this.uiManager.enforceDialogStyling(dialog);
        
        const input = dialog.querySelector('input');
        input.focus();
        
        window.submitInitials = () => {
            const initials = input.value.trim().toUpperCase();
            if (initials.length === 3) {
                this.leaderboard.addScore(initials, this.state.totalTime, this.state.totalMoves);
                dialog.remove();
                this.uiManager.showGameCompleteDialog();
                this.leaderboard.updateDisplay();
            }
        };
    }

    resetGame() {
        this.state = new GameState();
        this.state.reset();
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