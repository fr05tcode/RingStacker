import { CONFIG } from './config.js';

export class GameRenderer {
    constructor(gameState, p5Instance) {
        this.gameState = gameState;
        this.p5 = p5Instance;
        this.canvas = null;
    }

    setup() {
        this.canvas = this.p5.createCanvas(CONFIG.GAME.BASE_WIDTH, CONFIG.GAME.POLE_HEIGHT + 100);
        this.canvas.parent('game');
    }

    draw() {
        this.p5.background(CONFIG.COLORS.BACKGROUND);
        this.drawBase();
        this.drawPoles();
        this.drawDisks();
        if (this.gameState.selectedDisk !== null) {
            this.drawSelectedDisk();
        }
    }

    drawBase() {
        this.p5.stroke(CONFIG.COLORS.NEON[0]);
        this.p5.strokeWeight(2);
        this.p5.fill(CONFIG.COLORS.POLE);
        this.p5.rect(50, this.p5.height - 40, CONFIG.GAME.BASE_WIDTH - 100, 20);
    }

    drawPoles() {
        const poleSpacing = (CONFIG.GAME.BASE_WIDTH - 100) / (CONFIG.GAME.POLE_COUNT - 1);
        
        for (let i = 0; i < CONFIG.GAME.POLE_COUNT; i++) {
            const x = 50 + i * poleSpacing;
            this.p5.stroke(CONFIG.COLORS.NEON[0]);
            this.p5.strokeWeight(2);
            this.p5.fill(CONFIG.COLORS.POLE);
            this.p5.rect(x - CONFIG.GAME.POLE_WIDTH/2, 
                        this.p5.height - 40 - CONFIG.GAME.POLE_HEIGHT,
                        CONFIG.GAME.POLE_WIDTH, 
                        CONFIG.GAME.POLE_HEIGHT);
        }
    }

    drawDisks() {
        const poleSpacing = (CONFIG.GAME.BASE_WIDTH - 100) / (CONFIG.GAME.POLE_COUNT - 1);
        
        for (let i = 0; i < CONFIG.GAME.POLE_COUNT; i++) {
            const x = 50 + i * poleSpacing;
            const pole = this.gameState.poles[i];
            
            for (let j = 0; j < pole.length; j++) {
                if (i === this.gameState.selectedPole && j === pole.length - 1 && this.gameState.selectedDisk !== null) {
                    continue;
                }
                this.drawDisk(x, this.p5.height - 40 - (j + 1) * CONFIG.GAME.DISK_HEIGHT, pole[j]);
            }
        }
    }

    drawSelectedDisk() {
        if (this.gameState.selectedDisk === null) return;
        
        const disk = this.gameState.poles[this.gameState.selectedPole][this.gameState.poles[this.gameState.selectedPole].length - 1];
        const x = this.p5.mouseX;
        const y = this.p5.mouseY;
        this.drawDisk(x, y, disk);
    }

    drawDisk(x, y, size) {
        const width = size * 40;
        this.p5.stroke(CONFIG.COLORS.NEON[0]);
        this.p5.strokeWeight(2);
        this.p5.fill(CONFIG.COLORS.NEON[size - 1]);
        this.p5.rect(x - width/2, y, width, CONFIG.GAME.DISK_HEIGHT);
    }

    getPoleAtPosition(x) {
        const poleSpacing = (CONFIG.GAME.BASE_WIDTH - 100) / (CONFIG.GAME.POLE_COUNT - 1);
        
        for (let i = 0; i < CONFIG.GAME.POLE_COUNT; i++) {
            const poleX = 50 + i * poleSpacing;
            if (Math.abs(x - poleX) < 50) {
                return i;
            }
        }
        return -1;
    }

    cleanup() {
        if (this.canvas) {
            this.canvas.remove();
        }
    }
} 