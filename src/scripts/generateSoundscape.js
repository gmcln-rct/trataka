import {makeSynth} from './makeSynth';

import Tone from 'tone';

let synthPart1, synthPart2;
let leftSynth, rightSynth, echo, delay, delayFade;

export let _isPlaying = false;
// let _isPlaying;

export const stopOrgan = () => {
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

export const generateSoundscape = (notesList) => {
    
    const EQUALIZER_CENTER_FREQUENCIES = [
        125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
        1600, 2000, 2500, 3150, 4000, 5000
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

    // Slow Transport bpw Down
    Tone.Transport.bpm.value = 100;

    // Create an array of notes to be played
    // const timing = ['+0:2', '+6:0', '+11:2','+15:0', '+5.0', '+19:4:2', '+19:3:0'];
    const timing = ['+11:2', '+15:0', '+5.0', '+19:4:2', '+19:3:0'];


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


// --------------------------------------------------------
    // VISUALIZER part of funciton
    // Currently just doing FFT


    // let fftNum = 4096;
    let fftNum = 2048;
    const fft = new Tone.Analyser("fft", fftNum);
    const waveform = new Tone.Analyser("waveform", 1024);

    leftSynth.fan(waveform, fft);
    rightSynth.fan(waveform, fft);

    let canvasWidth, canvasHeight;

    const fftCanvas = document.getElementById("viz-canvas");
    const fftContext = fftCanvas.getContext("2d");



    // drawing the FFT
    function drawFFT(values) {
        fftContext.clearRect(0, 0, canvasWidth, canvasHeight);
        let x, y, barWidth, val;

        let testLength = values.length;
        let testHalf = testLength / 2;
        let testRand;
        let testBase;

        for (let i = 0, len = values.length; i < len - 1; i++) {
            barWidth = canvasWidth / len / 20;
            x = barWidth * i;

            val = Math.abs(values[i] / 255) + 0.3;

            testRand = Math.floor(Math.random() * 50) + 100;
            testBase = (val * canvasHeight) * 0.6;

            if (i > testHalf) { 
                y = (testBase / 2) +  ((testBase * 0.4) * (1 - (i / testLength)));
            } else {
                y = (testBase/2) +   ((testBase * 0.4)  * (i / testLength));
            }
            
            fftContext.fillStyle = "rgba(255, 240, " + testRand + ", " + val + ")";
            // var grd = fftContext.createRadialGradient(75, 50, 5, 90, 60, 100);
            // grd.addColorStop(0, "red");
            // grd.addColorStop(1, "yellow");
            // fftContext.fillStyle = grd;

            // fftContext.fillStyle = "rgba(31, 178, 204, " + val + ")";
            fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
            // blur slows it down
            // fftContext.shadowBlur = 0.5;
            // fftContext.shadowColor = "#FFC619";
        }
    }

    //size the canvases
    function sizeCanvases() {
        canvasWidth = fftCanvas.offsetWidth;
        canvasHeight = fftCanvas.offsetHeight;
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
        } else {
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

// END GENERATE SOUNDSCAPE FUNCTION