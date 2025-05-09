import { CONFIG } from './config.js';

export class Leaderboard {
    constructor() {
        this.scores = [];
        this.load();
    }

    load() {
        const savedData = localStorage.getItem(CONFIG.STORAGE_KEYS.LEADERBOARD);
        if (savedData) {
            this.scores = JSON.parse(savedData);
        } else {
            // Initialize with example entries
            this.scores = [
                { player: 'ACE', time: 180500, moves: 127 },
                { player: 'PRO', time: 240750, moves: 156 },
                { player: 'NEW', time: 360250, moves: 203 }
            ];
            this.save();
        }
    }

    save() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.LEADERBOARD, JSON.stringify(this.scores));
    }

    addScore(initials, time, moves) {
        const entry = {
            player: initials.toUpperCase(),
            time,
            moves
        };
        
        this.scores.push(entry);
        this.scores.sort((a, b) => a.time - b.time);
        
        if (this.scores.length > CONFIG.GAME.MAX_LEADERBOARD_ENTRIES) {
            this.scores = this.scores.slice(0, CONFIG.GAME.MAX_LEADERBOARD_ENTRIES);
        }
        
        this.save();
    }

    isQualifyingScore(time) {
        if (this.scores.length < CONFIG.GAME.MAX_LEADERBOARD_ENTRIES) {
            return true;
        }
        return time < this.scores[this.scores.length - 1].time;
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(2);
        return `${minutes}:${seconds.padStart(5, '0')}`;
    }

    updateDisplay() {
        const leaderboardElement = document.getElementById('leaderboard');
        const leaderboardData = document.getElementById('leaderboard-data');
        
        leaderboardData.innerHTML = '';
        
        if (this.scores.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 4;
            emptyCell.textContent = 'No records yet!';
            emptyCell.style.padding = '20px 0';
            emptyCell.style.color = CONFIG.COLORS.NEON[0];
            emptyRow.appendChild(emptyCell);
            leaderboardData.appendChild(emptyRow);
        } else {
            this.scores.forEach((entry, index) => {
                const row = document.createElement('tr');
                
                const cells = [
                    { content: index + 1 },
                    { content: entry.player },
                    { content: this.formatTime(entry.time) },
                    { content: entry.moves || '-' }
                ];

                cells.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell.content;
                    row.appendChild(td);
                });
                
                leaderboardData.appendChild(row);
            });
        }
        
        leaderboardElement.classList.remove('hidden');
    }

    hide() {
        document.getElementById('leaderboard').classList.add('hidden');
    }
} 