// Game constants
const POLE_COUNT = 3;
const POLE_WIDTH = 20;
const DISK_HEIGHT = 30;
const BASE_WIDTH = 500; // Increased from 300 to 500 for more space
const POLE_HEIGHT = 270; // Fixed height for 7 rings + 1 level above (reduced from 300)
const MAX_ROUNDS = 6;    // Maximum number of rounds (increased to 6)

// Sound effect
const cheerSound = new Audio('cheer.mp3');

// Neon synthwave color palette for disks
const NEON_COLORS = [
    '#00fff7', // cyan
    '#ff2fd6', // magenta
    '#9d00ff', // purple (was yellow)
    '#00ff85', // green
    '#ff6b00', // orange (was pink)
    '#00b3ff', // blue
    '#ff007f', // pink (was orange)
    '#ffe600'  // yellow (was purple)
];

// Synthwave colors for poles and base
const POLE_COLOR = '#4a4a6a'; // Changed from bright magenta to a more subtle purple-gray
const BG_COLOR = '#1a1a2e';

// Game state
let poles = [];
let selectedDisk = null;
let selectedPole = null;
let diskCount = 3;
let moves = 0;
let startTime = null;
let gameStarted = false;
let timerInterval = null;
let gameWon = false;
let warningTimeout = null;
let totalMoves = 0;
let totalTime = 0;
let lastUpdateTime = null;
let roundNumber = 1;  // Track the current round

function setup() {
    let canvas = createCanvas(800, 400);
    canvas.parent('game');
    // Add initial glow effect
    canvas.style.boxShadow = '0 0 10px #ff2fd6';
    initializeGame();
    setupButtons(); // Add button setup here
}

function calculateMinMoves() {
    return Math.pow(2, diskCount) - 1;
}

function initializeGame() {
    // Reset game state
    for (let i = 0; i < 3; i++) {
        poles[i] = [];
    }
    for (let i = diskCount; i > 0; i--) {
        poles[0].push(i);
    }
    moves = 0;
    gameStarted = false;
    gameWon = false;
    
    // Calculate minimum moves
    let minMoves = Math.pow(2, diskCount) - 1;
    document.getElementById('minMoves').setAttribute('data-value', minMoves);
    
    // Update round display
    document.querySelector('#round span:last-child').textContent = roundNumber;
    
    // Reset timer if it was previously set
    // Only clear the interval, don't reset startTime
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Reset move counter
    document.querySelector('#moves span:last-child').textContent = '0';
    
    // Initialize time display without starting the timer
    // Only reset the timer display if we're starting from scratch
    if (startTime === null) {
        document.querySelector('#timer .time-value').textContent = '0:00.00';
        totalTime = 0;
    }
    
    // Hide buttons until first move
    let resetButton = document.getElementById('resetButton');
    let quitButton = document.getElementById('quitButton');
    if (resetButton && quitButton) {
        resetButton.style.opacity = '0';
        quitButton.style.opacity = '0';
        resetButton.style.display = 'block';
        quitButton.style.display = 'block';
        resetButton.style.pointerEvents = 'auto';
        quitButton.style.pointerEvents = 'auto';
    }
    
    // Set up button functionality
    setupButtons();
    
    // Don't start the timer until first move
    // Timer will be started in mouseReleased function
}

function updateStats() {
    document.querySelector('#moves span:last-child').textContent = moves;
    document.getElementById('minMoves').setAttribute('data-value', calculateMinMoves());
    if (startTime) {
        let elapsed = Date.now() - startTime;
        let milliseconds = elapsed % 1000;
        let totalSeconds = Math.floor(elapsed / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let smoothDecimals = (milliseconds / 1000).toFixed(2).substring(2);
        document.querySelector('#timer .time-value').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}.${smoothDecimals}`;
    } else {
        document.querySelector('#timer .time-value').textContent = '0:00.00';
    }
}

function checkWin() {
    // Check if all disks are on the last pole
    if (poles[POLE_COUNT - 1].length === diskCount) {
        // Verify the disks are in correct order
        for (let i = 0; i < diskCount; i++) {
            if (poles[POLE_COUNT - 1][i] !== diskCount - i) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function celebrateWin() {
    if (gameWon) return;
    gameWon = true;
    
    // Stop the timer when the round is completed
    // It will be restarted on the first move of the next round
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Play cheer sound
    cheerSound.currentTime = 0;
    cheerSound.play().catch(err => console.log('Sound playback failed:', err));

    // Add winning class to trigger animation
    let canvas = document.querySelector('canvas');
    canvas.classList.add('won');
    
    // Fade out the game buttons over 0.5 seconds (reduced from 1s)
    document.getElementById('resetButton').style.transition = 'opacity 0.5s ease';
    document.getElementById('quitButton').style.transition = 'opacity 0.5s ease';
    document.getElementById('resetButton').style.opacity = '0';
    document.getElementById('quitButton').style.opacity = '0';
    
    // Disable pointer events for buttons during the fadeout
    document.getElementById('resetButton').style.pointerEvents = 'none';
    document.getElementById('quitButton').style.pointerEvents = 'none';

    // Single burst confetti celebration
    const defaults = { 
        startVelocity: 100,
        spread: 360, 
        ticks: 120,
        zIndex: 0,
        gravity: 4
    };

    // Left spray - straight up
    confetti({
        ...defaults,
        particleCount: 1500,
        origin: { x: 0.02, y: 0.95 },
        angle: 90,
        spread: 90,
        colors: NEON_COLORS
    });

    // Right spray - straight up
    confetti({
        ...defaults,
        particleCount: 1500,
        origin: { x: 0.98, y: 0.95 },
        angle: 90,
        spread: 90,
        colors: NEON_COLORS
    });

    // Center spray - straight up
    confetti({
        ...defaults,
        particleCount: 1500,
        origin: { x: 0.5, y: 0.95 },
        angle: 90,
        spread: 90,
        colors: NEON_COLORS
    });
    
    // Show next round button if not at final round
    if (roundNumber < MAX_ROUNDS) {
        // Add delay before showing next round button (2 seconds after completion)
        setTimeout(() => {
            let nextRoundBtn = document.createElement('button');
            nextRoundBtn.id = 'nextRoundBtn';
            nextRoundBtn.innerText = 'NEXT ROUND';
            nextRoundBtn.style.position = 'absolute';
            nextRoundBtn.style.top = '50%';
            nextRoundBtn.style.left = '50%';
            nextRoundBtn.style.transform = 'translate(-50%, -50%)';
            nextRoundBtn.style.padding = '15px 30px';
            nextRoundBtn.style.fontSize = '24px';
            nextRoundBtn.style.borderRadius = '12px';
            nextRoundBtn.style.border = '2px solid #00fff7';
            nextRoundBtn.style.background = 'rgba(35, 25, 66, 0.9)';
            nextRoundBtn.style.color = '#00fff7';
            nextRoundBtn.style.boxShadow = '0 0 15px #9d00ff';
            nextRoundBtn.style.fontFamily = 'Orbitron, Arial, sans-serif';
            nextRoundBtn.style.cursor = 'pointer';
            nextRoundBtn.style.textShadow = 'none';
            nextRoundBtn.style.zIndex = '1000';
            nextRoundBtn.style.opacity = '0';
            nextRoundBtn.style.transition = 'opacity 1s ease'; // Reduced from 1.5s
            nextRoundBtn.onclick = startNextRound;
            
            document.getElementById('game').appendChild(nextRoundBtn);
            
            // Trigger fade-in after a small delay to ensure the transition applies
            setTimeout(() => {
                nextRoundBtn.style.opacity = '1';
            }, 50);
        }, 2000);
    } else {
        // Final round complete - show styled dialog box instead of alert
        setTimeout(() => {
            // Update total moves
            totalMoves += moves;
            
            // Create styled in-game dialog
            const gameDialog = document.createElement('div');
            gameDialog.id = 'gameDialog';
            gameDialog.style.position = 'absolute';
            gameDialog.style.top = '50%';
            gameDialog.style.left = '50%';
            gameDialog.style.transform = 'translate(-50%, -50%)';
            gameDialog.style.padding = '30px';
            gameDialog.style.borderRadius = '12px';
            gameDialog.style.border = '2px solid #00fff7';
            gameDialog.style.background = 'rgba(35, 25, 66, 0.95)';
            gameDialog.style.color = '#00fff7';
            gameDialog.style.fontFamily = 'Orbitron, Arial, sans-serif';
            gameDialog.style.boxShadow = '0 0 20px #9d00ff';
            gameDialog.style.zIndex = '1000';
            gameDialog.style.textAlign = 'center';
            gameDialog.style.minWidth = '320px';
            gameDialog.style.opacity = '0';
            gameDialog.style.transition = 'opacity 1s ease';
            
            // Create dialog content
            const title = document.createElement('h2');
            title.textContent = 'CONGRATULATIONS!';
            title.style.color = '#ff2fd6';
            title.style.textShadow = 'none'; // Remove glow effect to match quit dialog
            title.style.marginTop = '0';
            title.style.fontSize = '28px'; // Match the font size with quit dialog
            
            const subtitle = document.createElement('p');
            subtitle.textContent = `You've completed all ${MAX_ROUNDS} rounds!`;
            subtitle.style.color = '#00fff7';
            subtitle.style.fontSize = '18px';
            subtitle.style.margin = '10px 0 20px 0';
            
            const statsContainer = document.createElement('div');
            statsContainer.style.margin = '20px 0';
            statsContainer.style.textAlign = 'left';
            
            const createStatRow = (label, value) => {
                const row = document.createElement('div');
                row.style.margin = '12px 0';
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                
                const labelSpan = document.createElement('span');
                labelSpan.textContent = label;
                labelSpan.style.color = '#ff2fd6';
                
                const valueSpan = document.createElement('span');
                valueSpan.textContent = value;
                valueSpan.style.color = '#00fff7';
                valueSpan.style.textShadow = 'none';
                
                row.appendChild(labelSpan);
                row.appendChild(valueSpan);
                return row;
            };
            
            statsContainer.appendChild(createStatRow('Total Moves:', totalMoves));
            statsContainer.appendChild(createStatRow('Total Time:', formatTime(totalTime)));
            
            // Create restart button
            const restartButton = document.createElement('button');
            restartButton.textContent = 'NEW GAME';
            restartButton.style.padding = '12px 25px';
            restartButton.style.borderRadius = '12px';
            restartButton.style.border = '2px solid #00fff7';
            restartButton.style.background = 'rgba(35, 25, 66, 0.9)';
            restartButton.style.color = '#00fff7';
            restartButton.style.fontSize = '18px';
            restartButton.style.fontFamily = 'Orbitron, Arial, sans-serif';
            restartButton.style.cursor = 'pointer';
            restartButton.style.boxShadow = '0 0 10px #9d00ff';
            restartButton.style.textShadow = 'none';
            restartButton.style.marginTop = '15px';
            restartButton.style.outline = 'none';
            
            // Add hover effect
            restartButton.onmouseover = function() {
                this.style.background = 'rgba(55, 40, 90, 0.9)';
                this.style.boxShadow = '0 0 15px #00fff7';
            };
            restartButton.onmouseout = function() {
                this.style.background = 'rgba(35, 25, 66, 0.9)';
                this.style.boxShadow = '0 0 10px #9d00ff';
            };
            
            restartButton.onclick = function() {
                // Fade out the dialog
                gameDialog.style.transition = 'opacity 1s ease';
                gameDialog.style.opacity = '0';
                
                // Wait for the fade out to complete before removing the dialog
                setTimeout(() => {
                    // Remove the dialog
                    document.getElementById('game').removeChild(gameDialog);
                    
                    // Reset the game for a fresh start
                    roundNumber = 1;
                    diskCount = 3;
                    totalMoves = 0;
                    totalTime = 0;
                    startTime = null;
                    lastUpdateTime = null;
                    gameStarted = false;
                    
                    // Reset display
                    document.querySelector('#round span:last-child').textContent = '1';
                    document.querySelector('#moves span:last-child').textContent = '0';
                    document.querySelector('#timer .time-value').textContent = '0:00.00';
                    document.getElementById('diskCount').value = '3';
                    document.getElementById('minMoves').setAttribute('data-value', '7');
                    
                    // Keep buttons hidden until first move
                    let resetButton = document.getElementById('resetButton');
                    let quitButton = document.getElementById('quitButton');
                    resetButton.style.opacity = '0';
                    quitButton.style.opacity = '0';
                    resetButton.style.pointerEvents = 'auto';
                    quitButton.style.pointerEvents = 'auto';
                    resetButton.style.display = 'block';
                    quitButton.style.display = 'block';
                    
                    // Ensure buttons have proper fade transitions
                    resetButton.style.transition = 'opacity 1s ease';
                    quitButton.style.transition = 'opacity 1s ease';
                    
                    // Initialize a new game
                    initializeGame();
                }, 1000);
            };
            
            // Assemble dialog
            gameDialog.appendChild(title);
            gameDialog.appendChild(subtitle);
            gameDialog.appendChild(statsContainer);
            gameDialog.appendChild(restartButton);
            
            // Add to document
            document.getElementById('game').appendChild(gameDialog);
            
            // Trigger fade-in after a small delay
            setTimeout(() => {
                gameDialog.style.opacity = '1';
            }, 50);
        }, 2000);
    }
}

function startNextRound() {
    // Update game state for next round
    totalMoves += moves;
    roundNumber++;
    
    // Remove the next round button
    let nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
        nextRoundBtn.remove();
    }
    
    // Progress by increasing disk count (3 to 8 rings across 6 rounds)
    // Round 1: 3 rings
    // Round 2: 4 rings
    // Round 3: 5 rings
    // Round 4: 6 rings
    // Round 5: 7 rings
    // Round 6: 8 rings
    diskCount = 2 + roundNumber; // This formula ensures proper progression
    
    // Reset canvas and get ready for next round
    let canvas = document.querySelector('canvas');
    canvas.classList.remove('won');
    
    // Reset game state for next round but preserve time
    for (let i = 0; i < 3; i++) {
        poles[i] = [];
    }
    for (let i = diskCount; i > 0; i--) {
        poles[0].push(i);
    }
    moves = 0;
    gameStarted = false;  // Reset gameStarted flag so timer starts on first move
    gameWon = false;
    
    // Calculate minimum moves
    let minMoves = Math.pow(2, diskCount) - 1;
    document.getElementById('minMoves').setAttribute('data-value', minMoves);
    
    // Update round display
    document.querySelector('#round span:last-child').textContent = roundNumber;
    
    // Reset move counter
    document.querySelector('#moves span:last-child').textContent = '0';
    
    // Hide buttons until first move
    let resetButton = document.getElementById('resetButton');
    let quitButton = document.getElementById('quitButton');
    resetButton.style.opacity = '0';
    quitButton.style.opacity = '0';
    resetButton.style.pointerEvents = 'auto'; // Re-enable pointer events
    quitButton.style.pointerEvents = 'auto'; // Re-enable pointer events
    
    // Ensure buttons are set up
    setupButtons();
    
    // DO NOT start the timer here - it will start on first move of the new round
}

function showIllegalMoveWarning() {
    const warning = document.getElementById('illegalMoveWarning');
    warning.style.opacity = '1';
    
    // Clear any existing timeout
    if (warningTimeout) {
        clearTimeout(warningTimeout);
    }
    
    // Hide the warning after 1 second
    warningTimeout = setTimeout(() => {
        warning.style.opacity = '0';
    }, 1000);
}

function draw() {
    background(BG_COLOR);
    noStroke();
    
    // Update timer if game is in progress
    if (gameStarted && !gameWon) {
        updateStats();
    }
    
    // Center the game
    const centerX = width/2;
    const totalWidth = BASE_WIDTH; // Use BASE_WIDTH for total game width
    const poleSpacing = totalWidth/2; // Space between poles
    const leftmostX = centerX - totalWidth/2; // Starting X position
    translate(leftmostX, 50); // Translate to left edge of game area
    
    // Draw poles
    for (let i = 0; i < POLE_COUNT; i++) {
        let x = i * poleSpacing; // Position each pole
        drawingContext.fillStyle = POLE_COLOR;
        fill(POLE_COLOR);
        drawingContext.shadowBlur = 3;
        drawingContext.shadowColor = POLE_COLOR;
        rect(x - POLE_WIDTH/2, 0, POLE_WIDTH, POLE_HEIGHT, 10);
        drawingContext.shadowBlur = 0;
        
        // Draw disks
        for (let j = 0; j < poles[i].length; j++) {
            let diskIndex = poles[i][j] - 1;
            let diskWidth = 48 * Math.pow(1.25, diskIndex);
            let y = POLE_HEIGHT - (j + 1) * DISK_HEIGHT;
            let neonColor = NEON_COLORS[diskIndex % NEON_COLORS.length];
            
            // Create gradient for disk
            let gradient = drawingContext.createRadialGradient(
                x, y + DISK_HEIGHT/2, 0,
                x, y + DISK_HEIGHT/2, diskWidth/2
            );
            
            // Convert hex to RGB for gradient manipulation
            let r = parseInt(neonColor.slice(1,3), 16);
            let g = parseInt(neonColor.slice(3,5), 16);
            let b = parseInt(neonColor.slice(5,7), 16);
            
            // Add gradient color stops
            gradient.addColorStop(0, `rgb(${r + 40}, ${g + 40}, ${b + 40})`); // Lighter center
            gradient.addColorStop(0.7, neonColor); // Original color
            gradient.addColorStop(1, `rgb(${Math.max(0, r - 75)}, ${Math.max(0, g - 75)}, ${Math.max(0, b - 75)})`); // Darker edge
            
            // Apply gradient
            drawingContext.fillStyle = gradient;
            stroke('#2a2a3a');
            strokeWeight(1.0);
            rect(x - diskWidth/2, y, diskWidth, DISK_HEIGHT, 11);
            noStroke();
        }
    }
    
    // Draw selected disk if any
    if (selectedDisk) {
        let x = mouseX - leftmostX;
        let y = mouseY - 50;
        let diskIndex = selectedDisk - 1;
        let diskWidth = 48 * Math.pow(1.25, diskIndex);
        let neonColor = NEON_COLORS[diskIndex % NEON_COLORS.length];
        
        // Create gradient for selected disk
        let gradient = drawingContext.createRadialGradient(
            x, y + DISK_HEIGHT/2, 0,
            x, y + DISK_HEIGHT/2, diskWidth/2
        );
        
        // Convert hex to RGB for gradient manipulation
        let r = parseInt(neonColor.slice(1,3), 16);
        let g = parseInt(neonColor.slice(3,5), 16);
        let b = parseInt(neonColor.slice(5,7), 16);
        
        // Add gradient color stops
        gradient.addColorStop(0, `rgb(${r + 40}, ${g + 40}, ${b + 40})`); // Lighter center
        gradient.addColorStop(0.7, neonColor); // Original color
        gradient.addColorStop(1, `rgb(${Math.max(0, r - 75)}, ${Math.max(0, g - 75)}, ${Math.max(0, b - 75)})`); // Darker edge
        
        // Apply gradient
        drawingContext.fillStyle = gradient;
        stroke('#2a2a3a');
        strokeWeight(1.0);
        rect(x - diskWidth/2, y - DISK_HEIGHT/2, diskWidth, DISK_HEIGHT, 11);
        noStroke();
    }

    // Check for win condition
    if (!gameWon && checkWin()) {
        celebrateWin();
    }
}

function mousePressed() {
    if (gameWon) return; // Prevent moves after winning
    
    const centerX = width/2;
    const totalWidth = BASE_WIDTH;
    const poleSpacing = totalWidth/2;
    const leftmostX = centerX - totalWidth/2;
    
    for (let i = 0; i < POLE_COUNT; i++) {
        if (poles[i].length > 0) {
            let x = i * poleSpacing + leftmostX;
            let topDisk = poles[i][poles[i].length - 1];
            let diskWidth = 48 * Math.pow(1.25, topDisk - 1); // Increased from 44 to 48 (another 10% increase)
            let y = POLE_HEIGHT - poles[i].length * DISK_HEIGHT + 50;
            
            if (mouseX > x - diskWidth/2 && mouseX < x + diskWidth/2 &&
                mouseY > y && mouseY < y + DISK_HEIGHT) {
                selectedDisk = poles[i].pop();
                selectedPole = i;
                break;
            }
        }
    }
}

function mouseReleased() {
    if (selectedDisk) {
        const centerX = width/2;
        const totalWidth = BASE_WIDTH;
        const poleSpacing = totalWidth/2;
        const leftmostX = centerX - totalWidth/2;
        
        let closestPole = 0;
        let minDist = Infinity;
        
        for (let i = 0; i < POLE_COUNT; i++) {
            let x = i * poleSpacing + leftmostX;
            let dist = abs(mouseX - x);
            if (dist < minDist) {
                minDist = dist;
                closestPole = i;
            }
        }
        
        if (poles[closestPole].length === 0 || 
            selectedDisk < poles[closestPole][poles[closestPole].length - 1]) {
            poles[closestPole].push(selectedDisk);
            moves++;
            
            // Start timer on first move of each round
            if (!gameStarted) {
                gameStarted = true;
                
                // Only initialize startTime if it hasn't been set (first round)
                if (startTime === null) {
                    startTime = Date.now();
                }
                
                // Initialize lastUpdateTime for proper time calculation
                lastUpdateTime = Date.now();
                
                // Start the timer interval for this round
                timerInterval = setInterval(updateTimer, 10);
                
                // Set up buttons to initially be hidden
                let resetButton = document.getElementById('resetButton');
                let quitButton = document.getElementById('quitButton');
                
                // Add transition for smooth fade-in over 1 second (reduced from 1.5s)
                resetButton.style.transition = 'opacity 1s ease';
                quitButton.style.transition = 'opacity 1s ease';
                
                // Make sure the buttons are visible to receive mouse events
                resetButton.style.display = 'block';
                quitButton.style.display = 'block';
                
                // Trigger the fade-in
                resetButton.style.opacity = '1';
                quitButton.style.opacity = '1';
            }
            
            updateStats();
        } else {
            poles[selectedPole].push(selectedDisk);
            showIllegalMoveWarning();
        }
        
        selectedDisk = null;
        selectedPole = null;
    }
}

function changeDiskCount(count) {
    // Convert the count to an integer
    count = parseInt(count);
    
    // Update both the diskCount and the round number
    diskCount = count;
    roundNumber = count - 2; // Since round formula was diskCount = 2 + roundNumber
    
    // Reset startTime when changing disk count to ensure timer doesn't start automatically
    startTime = null;
    totalTime = 0;
    moves = 0;
    totalMoves = 0;
    
    // Reset game state
    initializeGame();
    
    // Update the round display explicitly
    document.querySelector('#round span:last-child').textContent = roundNumber;
}

function quitGame() {
    // Immediately reset gameStarted flag to prevent timer updates
    gameStarted = false;
    
    // Stop the timer when quitting the game
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Make sure the lastUpdateTime is null to prevent timer from continuing
    lastUpdateTime = null;
    // Set startTime to null to prevent any further elapsed time calculations
    startTime = null;
    
    // Update total moves
    totalMoves += moves;
    let timeStr = formatTime(totalTime);
    
    // Fade out the game buttons immediately
    let resetButton = document.getElementById('resetButton');
    let quitButton = document.getElementById('quitButton');
    resetButton.style.transition = 'opacity 0.5s ease';
    quitButton.style.transition = 'opacity 0.5s ease';
    resetButton.style.opacity = '0';
    quitButton.style.opacity = '0';
    resetButton.style.pointerEvents = 'none';
    quitButton.style.pointerEvents = 'none';
    
    // Create styled in-game dialog instead of alert
    const gameDialog = document.createElement('div');
    gameDialog.id = 'gameDialog';
    gameDialog.style.position = 'absolute'; // Change from fixed to absolute for game frame positioning
    gameDialog.style.top = '50%';
    gameDialog.style.left = '50%';
    gameDialog.style.transform = 'translate(-50%, -50%)';
    gameDialog.style.padding = '30px';
    gameDialog.style.borderRadius = '12px';
    gameDialog.style.border = '2px solid #00fff7';
    gameDialog.style.background = 'rgba(35, 25, 66, 0.95)';
    gameDialog.style.color = '#00fff7';
    gameDialog.style.fontFamily = 'Orbitron, Arial, sans-serif';
    gameDialog.style.boxShadow = '0 0 20px #9d00ff';
    gameDialog.style.zIndex = '1000';
    gameDialog.style.textAlign = 'center';
    gameDialog.style.minWidth = '320px';
    gameDialog.style.opacity = '0';
    gameDialog.style.transition = 'opacity 1s ease';
    
    // Create dialog content with game summary
    const title = document.createElement('h2');
    title.textContent = 'Better luck next time!';
    title.style.color = '#ff2fd6';
    title.style.textShadow = 'none'; // Remove glow effect
    title.style.marginTop = '0';
    title.style.fontSize = '28px'; // Make text larger
    
    const statsContainer = document.createElement('div');
    statsContainer.style.margin = '20px 0';
    statsContainer.style.textAlign = 'left';
    
    const createStatRow = (label, value) => {
        const row = document.createElement('div');
        row.style.margin = '12px 0';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        labelSpan.style.color = '#ff2fd6';
        
        const valueSpan = document.createElement('span');
        valueSpan.textContent = value;
        valueSpan.style.color = '#00fff7';
        valueSpan.style.textShadow = 'none'; // Remove text shadow
        
        row.appendChild(labelSpan);
        row.appendChild(valueSpan);
        return row;
    };
    
    statsContainer.appendChild(createStatRow('Total Rounds:', roundNumber));
    statsContainer.appendChild(createStatRow('Total Moves:', totalMoves));
    statsContainer.appendChild(createStatRow('Total Time:', timeStr));
    
    // Create restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'NEW GAME';
    restartButton.style.padding = '12px 25px';
    restartButton.style.borderRadius = '12px';
    restartButton.style.border = '2px solid #00fff7';
    restartButton.style.background = 'rgba(35, 25, 66, 0.9)';
    restartButton.style.color = '#00fff7';
    restartButton.style.fontSize = '18px';
    restartButton.style.fontFamily = 'Orbitron, Arial, sans-serif';
    restartButton.style.cursor = 'pointer';
    restartButton.style.boxShadow = '0 0 10px #9d00ff';
    restartButton.style.textShadow = 'none';
    restartButton.style.marginTop = '15px';
    restartButton.style.outline = 'none';
    
    // Add hover effect
    restartButton.onmouseover = function() {
        this.style.background = 'rgba(55, 40, 90, 0.9)';
        this.style.boxShadow = '0 0 15px #00fff7';
    };
    restartButton.onmouseout = function() {
        this.style.background = 'rgba(35, 25, 66, 0.9)';
        this.style.boxShadow = '0 0 10px #9d00ff';
    };
    
    restartButton.onclick = function() {
        // Fade out the dialog over 1 second (changed from 0.5s to 1s)
        gameDialog.style.transition = 'opacity 1s ease';
        gameDialog.style.opacity = '0';
        
        // Wait for the fade out to complete before removing the dialog
        setTimeout(() => {
            // Remove the dialog
            document.getElementById('game').removeChild(gameDialog);
            
            // Reset game state completely
            poles = [];
            diskCount = 3;
            moves = 0;
            totalMoves = 0;
            
            // Make sure timer is completely reset
            startTime = null;
            totalTime = 0;
            lastUpdateTime = null;
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Reset timer display explicitly
            document.querySelector('#timer .time-value').textContent = '0:00.00';
            
            gameStarted = false;
            roundNumber = 1;
            
            // Reset display
            document.querySelector('#moves span:last-child').textContent = '0';
            document.querySelector('#round span:last-child').textContent = '1';
            document.getElementById('diskCount').value = '3';
            document.getElementById('minMoves').setAttribute('data-value', '7');
            
            // Keep reset and quit buttons hidden until first move
            let resetButton = document.getElementById('resetButton');
            let quitButton = document.getElementById('quitButton');
            
            // Make sure the buttons are hidden but can receive clicks when needed
            resetButton.style.opacity = '0';
            quitButton.style.opacity = '0';
            resetButton.style.pointerEvents = 'auto';
            quitButton.style.pointerEvents = 'auto';
            resetButton.style.display = 'block';
            quitButton.style.display = 'block';
            
            // Ensure button fade-in effect is set properly for when the player makes first move
            resetButton.style.transition = 'opacity 1s ease';
            quitButton.style.transition = 'opacity 1s ease';
            
            // Redraw the canvas
            initializeGame();
        }, 1000); // Match the new transition duration of 1 second
    };
    
    // Assemble dialog
    gameDialog.appendChild(title);
    gameDialog.appendChild(statsContainer);
    gameDialog.appendChild(restartButton);
    
    // Add to document - add to game container instead of body for proper positioning
    document.getElementById('game').appendChild(gameDialog);
    
    // Trigger fade-in after a small delay
    setTimeout(() => {
        gameDialog.style.opacity = '1';
    }, 50);
}

function formatTime(ms) {
    let milliseconds = ms % 1000;
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let smoothDecimals = (milliseconds / 1000).toFixed(2).substring(2);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${smoothDecimals}`;
}

function updateTimer() {
    // Only update if game is still active and lastUpdateTime is valid
    if (gameStarted && lastUpdateTime && !gameWon) {
        let currentTime = Date.now();
        let elapsedTime = currentTime - startTime;
        
        // Add to the total time (which persists across rounds)
        totalTime += currentTime - lastUpdateTime;
        lastUpdateTime = currentTime;
        
        // Format and display the total time
        let timeStr = formatTime(totalTime);
        document.querySelector('#timer .time-value').textContent = timeStr;
    }
}

// Add a resetRound function that preserves timer
function resetRound() {
    // Keep the timer running but reset other game state
    // Don't reset startTime and totalTime to preserve timer
    
    // Reset disk arrangement
    for (let i = 0; i < 3; i++) {
        poles[i] = [];
    }
    for (let i = diskCount; i > 0; i--) {
        poles[0].push(i);
    }
    
    // Reset moves for this round only
    moves = 0;
    document.querySelector('#moves span:last-child').textContent = '0';
    
    // Don't reset gameStarted if timer is already running
    if (!gameStarted && startTime !== null) {
        gameStarted = true;
        
        // Restart timer interval if needed
        if (!timerInterval) {
            lastUpdateTime = Date.now();
            timerInterval = setInterval(updateTimer, 10);
        }
    }
    
    // Reset win state if needed
    gameWon = false;
    
    // Remove winning animation if present
    let canvas = document.querySelector('canvas');
    canvas.classList.remove('won');
    
    // Remove next round button if present
    let nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
        nextRoundBtn.remove();
    }
    
    // Make sure buttons are visible if game had already started
    if (gameStarted) {
        let resetButton = document.getElementById('resetButton');
        let quitButton = document.getElementById('quitButton');
        
        resetButton.style.opacity = '1';
        quitButton.style.opacity = '1';
        resetButton.style.pointerEvents = 'auto';
        quitButton.style.pointerEvents = 'auto';
    }
}

// Modify setupButtons to be more robust
function setupButtons() {
    const resetButton = document.getElementById('resetButton');
    const quitButton = document.getElementById('quitButton');
    
    if (resetButton) {
        // Clear any existing click handlers and add new one
        resetButton.onclick = null;
        resetButton.onclick = function(event) {
            event.preventDefault(); // Prevent any default behavior
            resetRound();
        };
    }
    
    if (quitButton) {
        // Clear any existing click handlers and add new one
        quitButton.onclick = null;
        quitButton.onclick = function(event) {
            event.preventDefault(); // Prevent any default behavior
            quitGame();
        };
    }
}

// Also call setupButtons in the window load event
window.addEventListener('load', function() {
    // Connect the reset button to our new resetRound function
    const resetButton = document.getElementById('resetButton');
    const quitButton = document.getElementById('quitButton');
    
    // Apply styles to existing buttons
    if (resetButton) {
        // Apply styles without event listeners (we'll use onclick instead)
        resetButton.style.borderRadius = '12px';
        resetButton.style.border = '2px solid #00fff7';
        resetButton.style.background = 'rgba(35, 25, 66, 0.9)';
        resetButton.style.color = '#00fff7';
        resetButton.style.fontFamily = 'Orbitron, Arial, sans-serif';
        resetButton.style.padding = '8px 16px';
        resetButton.style.fontSize = '16px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.boxShadow = '0 0 10px #9d00ff';
        resetButton.style.textShadow = 'none'; // Remove text shadow
        resetButton.style.outline = 'none'; // Remove outline
    }
    
    if (quitButton) {
        // Apply styles without event listeners (we'll use onclick instead)
        quitButton.style.borderRadius = '12px';
        quitButton.style.border = '2px solid #ff2fd6'; // Changed to magenta
        quitButton.style.background = 'rgba(35, 25, 66, 0.9)';
        quitButton.style.color = '#ff2fd6'; // Changed to magenta
        quitButton.style.fontFamily = 'Orbitron, Arial, sans-serif';
        quitButton.style.padding = '8px 16px';
        quitButton.style.fontSize = '16px';
        quitButton.style.cursor = 'pointer';
        quitButton.style.boxShadow = '0 0 10px #9d00ff';
        quitButton.style.textShadow = 'none'; // Remove text shadow
        quitButton.style.outline = 'none'; // Remove outline
    }
    
    // Set up the button functionality
    setupButtons();
}); 