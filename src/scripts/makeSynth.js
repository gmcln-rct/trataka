import Tone from 'tone';

// SETS UP SYNTHESIZER FOR LOOP

export const makeSynth = () => {
    let envelope = {
        attack: 3,
        release: 4,
        sustain: 5,
        releaseCurve: 'linear'
    };

    let envelope1 = {
        attack: 3,
        release: 4,
        sustain: 10,
        releaseCurve: 'linear'
    };
    let filterEnvelope = {
        baseFrequency: 200,
        octaves: 2,
        attack: 0,
        decay: 0,
        release: 2000
    };

    let tremolo = new Tone.Tremolo(20, 3);
    
    return new Tone.PolySynth({
        harmonicity: 10,
        resonance: 800,
        volume: -12,
        voice0: {
            oscillator: { type: 'sine' },
            envelope1,
            filterEnvelope
        },
        voice1: {
            oscillator: { type: 'fatsawtooth' },
            envelope,
            filterEnvelope
        },
        voice2: {
            oscillator: { type: 'sine' },
            envelope,
            filterEnvelope
        },


    }).connect(tremolo);
}