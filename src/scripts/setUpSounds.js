// CORRELATES TIDAL DATA TO SPECIFIC NOTES

export const setUpSounds = () => {
    let notesList = []

    // All available notes
    // let allNotes = ["A1", "A2", "A3", "A4", "b1", "b2", "b3", "b4", "b5", "C2", "C3", "C4", "C5", "D2", "D3", "D4", "E2", "E3", "E4", "F2", "F3", "F4", "G2", "G3", "G4"];

    let allNotes = ["A4", "B3", "B4", "C2", "C3", "C4", "C5", "D2", "D3", "D4", "E3", "E4",];
    let allNotesLength = allNotes.length;
    let noteListLength = 30;
    let noteRef, noteIdx, newNote;

    for (let i = 0; i < noteListLength; i++) {
        // Establish location of note in array
        noteRef = Math.random();
        
        // Create a number between 0 and 1, then multiply by length of notes array
        noteIdx = Math.floor(noteRef * allNotesLength);

        newNote = allNotes[noteIdx];
        notesList.push(newNote);

        if (i % 5 === 0) {
            notesList.push("D4");
        }
        if (i % 15 === 0) {
            notesList.push("G4");
        }


    }
    console.log(notesList);
    // noteList = allNotes;
    return notesList;
};

