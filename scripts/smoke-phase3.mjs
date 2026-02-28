import { GameState } from '../js/GameState.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function run() {
    const state = new GameState();
    state.reset();

    assert(state.poles.length === 3, 'expected 3 poles');
    assert(state.poles[0].length === 3, 'expected 3 disks on first pole after reset');
    assert(state.calculateMinMoves() === 7, 'expected min moves for 3 disks to be 7');

    // legal opening move (disk 1 from pole 0 to pole 2)
    assert(state.moveDisk(0, 2) === true, 'expected first move to be legal');
    assert(state.moves === 1, 'expected move counter increment');

    // illegal move (disk 2 onto disk 1)
    assert(state.moveDisk(0, 2) === false, 'expected illegal move to fail');
    assert(state.moves === 1, 'expected move counter not to increment on illegal move');

    // undo behavior
    assert(state.undoMove() === true, 'expected undo to succeed after a valid move');
    assert(state.moves === 0, 'expected move counter decrement on undo');
    assert(state.poles[0][state.poles[0].length - 1] == 1, 'expected disk to return to source pole');
    assert(state.undoMove() === false, 'expected undo to fail when no history remains');

    // timer behavior
    state.startTimer();
    state.startTime = Date.now() - 1200;
    const elapsed = state.stopTimer();
    assert(elapsed >= 1100, 'expected elapsed time >= 1100ms');

    console.log('Phase 3 smoke checks passed.');
}

run();
