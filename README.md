# RingStacker v4.9

A modern implementation of the classic Tower of Hanoi puzzle game with a synthwave aesthetic.

## Features

- 6 challenging rounds (3-8 rings)
- Time and move tracking
- Leaderboard system
- Synthwave visual style
- Smooth animations and transitions
- Sound effects and visual feedback

## Game Rules

1. Move all rings from the leftmost pole to the rightmost pole
2. Only one ring can be moved at a time
3. Only the top ring of each pole can be moved
4. A larger ring cannot be placed on top of a smaller ring
5. Complete all 6 rounds to win the game

## Project Structure

```
RingStacker_v4.9/
├── index.html           # Main HTML file
├── css/
│   └── styles.css      # All game styles
├── js/
│   ├── config.js       # Game configuration and constants
│   ├── Game.js         # Main game controller
│   ├── GameState.js    # Game state management
│   ├── GameRenderer.js # p5.js rendering logic
│   ├── UIManager.js    # UI and DOM manipulation
│   └── Leaderboard.js  # Leaderboard functionality
└── assets/
    └── cheer.mp3       # Sound effects
```

## Technical Details

- Built with vanilla JavaScript (ES6+)
- Uses p5.js for game rendering
- Modular architecture for better maintainability
- Responsive design
- Local storage for leaderboard persistence

## Minimum Moves Per Round

- Round 1 (3 rings): 7 moves
- Round 2 (4 rings): 15 moves
- Round 3 (5 rings): 31 moves
- Round 4 (6 rings): 63 moves
- Round 5 (7 rings): 127 moves
- Round 6 (8 rings): 255 moves

## Setup Instructions

1. Clone the repository
2. Ensure you have a modern web browser
3. Open index.html in your browser
4. No build process required!

## Development

The codebase follows a modular architecture:

- `Game.js`: Main game controller that coordinates all components
- `GameState.js`: Manages game state and logic
- `GameRenderer.js`: Handles all p5.js rendering
- `UIManager.js`: Manages UI updates and DOM manipulation
- `Leaderboard.js`: Handles leaderboard functionality
- `config.js`: Central configuration for game settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify! 