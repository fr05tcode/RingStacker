import { CONFIG } from './config.js';

export class UIManager {
    constructor(gameState, handlers = {}) {
        this.gameState = gameState;
        this.handlers = handlers;
        this.dialogObserver = null;

        this.setupEventListeners();
        this.setupDialogStyleObserver();
    }

    setupEventListeners() {
        document.getElementById('resetButton').addEventListener('click', () => this.resetRound());
        document.getElementById('quitButton').addEventListener('click', () => this.quitGame());
        document.getElementById('diskCount').addEventListener('change', (e) => this.changeDiskCount(e.target.value));
    }

    updateStats() {
        document.getElementById('round').querySelector('span:last-child').textContent = this.gameState.roundNumber;
        document.getElementById('moves').querySelector('span:last-child').textContent = this.gameState.moves;
        document.getElementById('minMoves').setAttribute('data-value', this.gameState.calculateMinMoves());
    }

    updateTimer() {
        if (!this.gameState.gameStarted) return;

        const elapsed = this.gameState.getElapsedTime();
        this.setTimerDisplay(elapsed);
    }

    setTimerDisplay(ms) {
        document.querySelector('#timer .time-value').textContent = this.formatTime(ms);
    }

    showIllegalMoveWarning() {
        const warning = document.getElementById('illegalMoveWarning');
        warning.style.opacity = '1';

        if (this.gameState.warningTimeout) {
            clearTimeout(this.gameState.warningTimeout);
        }

        this.gameState.warningTimeout = setTimeout(() => {
            warning.style.opacity = '0';
        }, 1000);
    }

    resetRound() {
        if (typeof this.handlers.onResetRound === 'function') {
            this.handlers.onResetRound();
        }
    }

    quitGame() {
        if (typeof this.handlers.onQuitGame === 'function') {
            this.handlers.onQuitGame();
        }
    }

    changeDiskCount(value) {
        if (typeof this.handlers.onChangeDiskCount === 'function') {
            this.handlers.onChangeDiskCount(Number(value));
        }
    }

    enforceDialogStyling(dialog) {
        dialog.classList.add('game-dialog-styling');
    }

    setupDialogStyleObserver() {
        this.dialogObserver = new MutationObserver(() => {
            document.querySelectorAll('[data-dialog-type="game-dialog"]')
                .forEach(dialog => this.enforceDialogStyling(dialog));
        });

        this.dialogObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    showInitialsPrompt(onSubmit) {
        const existingDialog = document.getElementById('initialsDialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialog = document.createElement('div');
        dialog.setAttribute('data-dialog-type', 'game-dialog');
        dialog.id = 'initialsDialog';

        dialog.innerHTML = `
            <h2>New High Score!</h2>
            <p>Enter your initials (3 characters):</p>
            <input id="initialsInput" type="text" maxlength="3" style="text-transform: uppercase">
            <button id="submitInitialsButton" type="button">Submit</button>
        `;

        document.body.appendChild(dialog);
        this.enforceDialogStyling(dialog);

        const input = dialog.querySelector('#initialsInput');
        const submitButton = dialog.querySelector('#submitInitialsButton');

        const submitInitials = () => {
            const initials = input.value.trim().toUpperCase();
            if (initials.length === 3) {
                onSubmit(initials);
                dialog.remove();
            }
        };

        submitButton.addEventListener('click', submitInitials);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                submitInitials();
            }
        });

        input.focus();
    }

    showGameCompleteDialog() {
        const existingDialog = document.getElementById('gameCompleteDialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialog = document.createElement('div');
        dialog.setAttribute('data-dialog-type', 'game-dialog');
        dialog.id = 'gameCompleteDialog';

        const content = `
            <h2>Congratulations!</h2>
            <p>You've completed all ${CONFIG.GAME.MAX_ROUNDS} rounds!</p>
            <div class="stats">
                <p>Total Time: ${this.formatTime(this.gameState.totalTime)}</p>
                <p>Total Moves: ${this.gameState.totalMoves}</p>
            </div>
            <button id="playAgainButton" type="button">Play Again</button>
        `;

        dialog.innerHTML = content;
        document.body.appendChild(dialog);
        this.enforceDialogStyling(dialog);

        dialog.querySelector('#playAgainButton').addEventListener('click', () => {
            if (typeof this.handlers.onResetGame === 'function') {
                this.handlers.onResetGame();
            }
            dialog.remove();
        });
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(2);
        return `${minutes}:${seconds.padStart(5, '0')}`;
    }

    cleanup() {
        if (this.dialogObserver) {
            this.dialogObserver.disconnect();
            this.dialogObserver = null;
        }
    }
}
