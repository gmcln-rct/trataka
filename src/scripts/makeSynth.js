import Tone from 'tone';

// SETS UP SYNTHESIZER FOR LOOP

export const makeSynth = () => {

    let vibrato = new Tone.Vibrato(10, 10);
    
    return new Tone.PolySynth({
        harmonicity: 10,
        resonance: 1600,
        volume: -19,
        voice0: {
            oscillator: {   frequency: 55,
                            type: 'sine',
                            phase: 180 },

        },
        voice1: {
            oscillator: {
                frequency: 110,
                type: 'cosine' },

        },
        voice1: {
            oscillator: {
                frequency: 440,
                type: 'cosine'
            },

        }
    }).connect(vibrato);
}