import {makeSynth} from './makeSynth';

import Tone from 'tone';

let synthPart1, synthPart2;
let leftSynth, rightSynth, echo, delay, delayFade;

export let _isPlaying = false;
// let _isPlaying;


export const generateSoundscape = (notesList) => {
    
    // const EQUALIZER_CENTER_FREQUENCIES = [
    //     125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
    //     1600, 2000, 2500, 3150, 4000, 5000
    // ];

    const EQUALIZER_CENTER_FREQUENCIES = [
        125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600
    ];

    leftSynth = makeSynth();
    rightSynth = makeSynth();

    // let leftPanner = new Tone.Panner(-0.5);
    // let rightPanner = new Tone.Panner(0.5);
    let leftPanner = new Tone.Panner3D(-0.5,1,-2);
    let rightPanner = new Tone.Panner3D(0.5, 1, 2);

    let equalizer = EQUALIZER_CENTER_FREQUENCIES.map(frequency => {
        let filter = Tone.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency;
        filter.Q.value = 8.62;
        filter.gain.value = 4.71;   
        return filter;
    });

    echo = new Tone.FeedbackDelay('16n', 0.2);
    delay = Tone.context.createDelay(11.0);
    delayFade = Tone.context.createGain();

    delay.delayTime.value = 8.0;
    delayFade.gain.value = 0.42;

    leftSynth.connect(leftPanner);
    rightSynth.connect(rightPanner);

    leftPanner.connect(equalizer[0]);
    rightPanner.connect(equalizer[0]);

    equalizer.forEach((equalizerBand, index) => {
        if (index < equalizer.length - 1) {
            equalizerBand.connect(equalizer[index + 1]);
        } else {
            equalizerBand.connect(echo);
        }
    });

    echo.toMaster();
    echo.connect(delay);

    delay.connect(Tone.context.destination);
    delay.connect(delayFade);
    delayFade.connect(delay);

    // let omniOsc = new Tone.OmniOscillator(440, "pulse");
    // omniOsc.toMaster();
    

    // Slow Transport bpw Down
    Tone.Transport.bpm.value = 50;
    // Changed from 100


    // ------------------------ CREATE SEQUENCES ------------------------

    // Create an array of notes to be played
    // const timing = ['+0:2', '+6:0', '+11:2','+15:0', '+5.0', '+19:4:2', '+19:3:0'];
    const timing = ['+11:2', '+15:0', '+3:1', '+5:1', '+5:0','+4:1','+19:4:2', '+19:3:0'];


    function makeTiming() {
        let timeIndex;
        let indivTiming;
        timeIndex = Math.random() * timing.length;
        indivTiming = timing[timeIndex];
        return indivTiming;
    }
    
    // Use imported list from SetUpSounds
    const notes = notesList;
    
    let synthStart = false;
    // CREATE SEQUENCE 1
    const synthPart1 = new Tone.Sequence(
        function (time, note) {
            event.humanize = true;
            leftSynth.triggerAttackRelease(note, '10', makeTiming());
            synthStart = true;
        },
        notes,
        "2m"
    );


    // CREATE SEQUENCE 2
    const synthPart2 = new Tone.Sequence(

        function (time, note) {

            event.humanize = true;
            rightSynth.triggerAttackRelease(note, '15', makeTiming());
            synthStart = true;

        },
        notes,
        "4m"
    );


    synthPart1.humanize = true;
    synthPart2.humanize = true;

    synthPart1.start();
    synthPart2.start();

    // START AUDIO TRANSPORT
    Tone.Transport.start();

    _isPlaying = true;


    // ------------------------ VISUALIZER ------------------------

    // Currently just doing FFT

    // let fftNum = 4096;
    let fftNum = 2048;
    const fft = new Tone.Analyser("fft", fftNum);
    const waveform = new Tone.Analyser("waveform", 2048);

    leftSynth.fan(waveform, fft);
    rightSynth.fan(waveform, fft);

    let canvasWidth, canvasHeight;

    const fftCanvas = document.getElementById("viz-canvas");
    const fftContext = fftCanvas.getContext("2d");

    // drawing the FFT
    function drawFFT(values) {
        // Clear canvas

        // canvasWidth = document.body.getBoundingClientRect().width;
        // canvasHeight = document.body.getBoundingClientRect().height;
        fftContext.clearRect(0, 0, canvasWidth, canvasHeight);

        let x, y, barWidth, val;

        let testLength = values.length;
        let testHalf = testLength / 2;
        let flameColor, flameBase, flameOpac;
        fftContext.filter = 'blur(1px)';
        fftContext.filter = 'brightness(1.4)';
        // let numberOfFrame = 10;
        // fftContext.shadowBlur = 1;
        // fftContext.shadowColor = "rgba(255, 198, 25, 0.5";

        // fftContext.ellipse(100, 300, 50, 75, 0, 0, 2 * Math.PI);

        for (let i = 0, len = values.length; i < len - 1; i++) {
            // barWidth = canvasWidth / len / 25;
            barWidth = (canvasWidth / len ) * 0.05;

            x = barWidth * i;

            val = Math.abs(values[i] / 255);

            flameOpac = (val + 0.5) > 1? 1: (val + 0.5)
            flameColor = Math.floor(Math.random() * 70) + 70;
            flameBase = (val * canvasHeight) ;

            if (i > testHalf) { 
                y = (flameBase / 2) +  ((flameBase * 0.6) * (1 - (i / testLength)));
            } else {
                y = (flameBase/2) +   ((flameBase * 0.6)  * (i / testLength));
            }

            // fftContext.fillStyle = "rgba(255, 240, " + flameColor + ", " + flameOpac + ")";
            // fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);

            let grd = fftContext.createLinearGradient(x, canvasHeight, x, 300);
            grd.addColorStop(0, "rgba(255, 240, " + flameColor + ", " + flameOpac + ")");
            // grd.addColorStop(1, "red");
            grd.addColorStop(1, "rgba(255, 0, " + flameColor + ", 1)");
            fftContext.fillStyle = grd;
            fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
        }
    }

    //size the canvases
    function sizeCanvases() {
        if (!canvasWidth) {
            canvasWidth = document.body.getBoundingClientRect().width;
        }
        if (!canvasHeight) {

            canvasHeight = fftCanvas.offsetHeight;
        }

        fftContext.canvas.width = canvasWidth;
        fftContext.canvas.height = canvasHeight;
    }

    function loop() {
        requestAnimationFrame(loop);
        //get the fft data and draw it
        drawFFT(fft.getValue());
        // console.log(fft.getValue());
    }

    let synthInterval = setInterval(() => {
        if (synthStart) {
            sizeCanvases();
            loop();
            clearInterval(synthInterval);
        } 
    }, 5);

    Tone.BufferSource.prototype.start = function (time, offset, duration, gain) {
        // Prevent buffer playback if we have exceeded max # buffers playing
        // (or if there's no volume... what's the point?
        if (_playingBuffers.length >= MAX_BUFFERS || gain <= 0) return this;

        _playingBuffers.push(this);
        _numPlayedNotesThisInterval++;

        this.onended = function (buffer) {
            buffer.dispose();
            let index = _playingBuffers.indexOf(buffer);
            if (index > -1) {
                _playingBuffers.splice(index, 1);
            }
        };

        return bufferSourceStart.bind(this)(time, offset, duration, gain);
    };
    
};

// END GENERATE SOUNDSCAPE + VISUALIZER FUNCTION

// ------------------------ STOP SEQUENCE ------------------------

export const stopSoundscape = () => {
    if (_isPlaying) {
        console.log("trying to stop...")

        synthPart1 = new Tone.Sequence();
        synthPart2 = new Tone.Sequence();

        synthPart1.removeAll();
        synthPart1.stop();

        synthPart2.removeAll();
        synthPart2.stop();

        // Stop Transport
        Tone.Transport.stop();


        // Stop Synths
        console.log("disconnecting synths....")
        leftSynth.disconnect();
        rightSynth.disconnect();

        console.log("disconnecting effects....")
        echo.disconnect();
        delay.disconnect();
        delayFade.disconnect();

        // debugger
        console.log("transport state: " + Tone.Transport.state)
        if (Tone.Transport.state !== "started") {
            _isPlaying = false;
            console.log("Transport stopped")
        } else {
            console.log("Transport didn't stop");
        }

        console.log('disposing....')
        synthPart1.dispose();
        synthPart2.dispose();
        echo.dispose();
        console.log("disposed")
    }
};