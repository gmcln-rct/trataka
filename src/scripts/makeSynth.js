import Tone from 'tone';

// SETS UP SYNTHESIZER FOR LOOP

export const makeSynth = () => {
    let envelope = {
        attack: 10,
        release: 4,
        sustain: 5,
        releaseCurve: 'linear'
    };
    let filterEnvelope = {
        baseFrequency: 800,
        octaves: 4,
        attack: 0,
        decay: 0,
        release: 8000
    };

    let tremolo = new Tone.Tremolo(10, 3);
    
    return new Tone.PolySynth({
        harmonicity: 10,
        resonance: 1600,
        volume: -19,
        voice0: {
            oscillator: {   frequency: 400,
                            type: 'sine',
                            phase: 180 },

        },
        voice1: {
            oscillator: { type: 'cosine' },

        }
    }).connect(tremolo);
}