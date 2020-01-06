import Tone from 'tone';

// SETS UP SYNTHESIZER FOR LOOP

export const makeSynth = () => {
    let envelope = {
        attack: 1.5,
        release: 4,
        sustain: 5,
        releaseCurve: 'linear'
    };
    let filterEnvelope = {
        baseFrequency: 400,
        octaves: 4,
        attack: 0,
        decay: 0,
        release: 4000
    };

    let tremolo = new Tone.Tremolo(20, 3);
    
    return new Tone.PolySynth({
        harmonicity: 2,
        resonance: 1600,
        volume: -19,
        voice0: {
            oscillator: { type: 'cosine' },
            envelope,
            filterEnvelope
        },
        voice1: {
            oscillator: { type: 'cosine' },
            envelope,
            filterEnvelope
        },
        voice2: {
            oscillator: { type: 'bounce' },
            envelope,
            filterEnvelope
        },


    }).connect(tremolo);
}