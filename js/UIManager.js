import { CONFIG } from './config.js';

export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.setupEventListeners();
        this.borderWatcherInterval = null;
        this.setupBorderWatcher();
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
        const minutes = Math.floor(elapsed / 60000);
        const seconds = ((elapsed % 60000) / 1000).toFixed(2);
        document.querySelector('#timer .time-value').textContent = 
            `${minutes}:${seconds.padStart(5, '0')}`;
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

    setupBorderWatcher() {
        const checkAndRemoveBorders = () => {
            const activeDialogs = document.querySelectorAll('[data-dialog-type="game-dialog"]');
            const hasActiveDialog = activeDialogs.length > 0;
            
            document.querySelectorAll('*').forEach(el => {
                if (this.shouldSkipBorderRemoval(el)) return;
                
                const rect = el.getBoundingClientRect();
                const isAtEdge = this.isElementAtEdge(rect);
                
                if (isAtEdge) {
                    this.removeBorders(el);
                }
            });
            
            this.enforceCanvasBorder();
            
            if (hasActiveDialog) {
                activeDialogs.forEach(dialog => this.enforceDialogStyling(dialog));
            }
        };
        
        checkAndRemoveBorders();
        this.borderWatcherInterval = setInterval(checkAndRemoveBorders, 1000);
    }

    shouldSkipBorderRemoval(element) {
        const skipElements = ['canvas', 'button', '.game-button', '#nextRoundBtn', 
                            '#gameDialog', '#initialsDialog', '#gameCompleteDialog', '.leaderboard'];
        
        return skipElements.some(selector => {
            if (selector.startsWith('.')) {
                return element.classList.contains(selector.slice(1));
            } else if (selector.startsWith('#')) {
                return element.id === selector.slice(1);
            }
            return element.tagName.toLowerCase() === selector;
        });
    }

    isElementAtEdge(rect) {
        return (
            rect.left <= 5 || 
            rect.top <= 5 || 
            rect.right >= window.innerWidth - 5 || 
            rect.bottom >= window.innerHeight - 5
        );
    }

    removeBorders(element) {
        element.style.border = 'none';
        element.style.borderWidth = '0';
        element.style.boxShadow = 'none';
        element.style.outline = 'none';
    }

    enforceCanvasBorder() {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.style.border = '3px solid ' + CONFIG.COLORS.NEON[0];
            canvas.style.borderRadius = '12px';
            canvas.style.boxShadow = '0 0 30px ' + CONFIG.COLORS.NEON[2];
        }
    }

    enforceDialogStyling(dialog) {
        Object.assign(dialog.style, {
            border: `3px solid ${CONFIG.COLORS.NEON[0]} !important`,
            backgroundColor: 'rgba(35, 25, 66, 0.95) !important',
            boxShadow: `0 0 30px ${CONFIG.COLORS.NEON[2]} !important`,
            color: CONFIG.COLORS.NEON[0],
            borderRadius: '12px',
            position: 'absolute',
            zIndex: '2500',
            display: 'block',
            visibility: 'visible'
        });
    }

    setupDialogStyleObserver() {
        const observer = new MutationObserver(() => {
            document.querySelectorAll('[data-dialog-type="game-dialog"]')
                .forEach(dialog => this.enforceDialogStyling(dialog));
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    showGameCompleteDialog() {
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
            <button onclick="resetGame()">Play Again</button>
        `;
        
        dialog.innerHTML = content;
        document.body.appendChild(dialog);
        this.enforceDialogStyling(dialog);
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(2);
        return `${minutes}:${seconds.padStart(5, '0')}`;
    }

    cleanup() {
        if (this.borderWatcherInterval) {
            clearInterval(this.borderWatcherInterval);
        }
    }
} 