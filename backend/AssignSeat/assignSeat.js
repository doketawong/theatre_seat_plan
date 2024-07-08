function assignSeats(seatingPlan, participants, row = 0, col = 0) {
    // Base case: if there are no more participants, return the seating plan
    if (participants.length === 0) {
        return seatingPlan;
    }

    // If we've run out of seats, throw an error
    if (row >= seatingPlan.length || col >= seatingPlan[0].length) {
        throw new Error('Not enough seats for all participants');
    }

    // Assign the first participant to the current seat
    seatingPlan[row][col] = participants[0];

    // Move to the next seat
    let nextRow = row;
    let nextCol = col + 1;
    if (nextCol >= seatingPlan[0].length) {
        nextRow++;
        nextCol = 0;
    }

    // Recursively assign the rest of the participants
    return assignSeats(seatingPlan, participants.slice(1), nextRow, nextCol);
}