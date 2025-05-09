// Game Configuration
export const CONFIG = {
    GAME: {
        POLE_COUNT: 3,
        POLE_WIDTH: 20,
        DISK_HEIGHT: 30,
        BASE_WIDTH: 500,
        POLE_HEIGHT: 270,
        MAX_ROUNDS: 6,
        MAX_LEADERBOARD_ENTRIES: 5
    },
    
    COLORS: {
        NEON: [
            '#00fff7', // cyan
            '#ff2fd6', // magenta
            '#9d00ff', // purple
            '#00ff85', // green
            '#ff6b00', // orange
            '#00b3ff', // blue
            '#ff007f', // pink
            '#ffe600'  // yellow
        ],
        POLE: '#4a4a6a',
        BACKGROUND: '#1a1a2e'
    },
    
    STORAGE_KEYS: {
        LEADERBOARD: 'ringstacker_leaderboard'
    },
    
    ASSETS: {
        CHEER_SOUND: 'assets/cheer.mp3'
    }
}; 