import {makeSynth} from './makeSynth';

import Tone from 'tone';

let synthPart1, synthPart2;
let leftSynth, rightSynth, echo, delay, delayFade;

export let _isPlaying = false;
// let _isPlaying;

export const muteOrgan = () => {
    Tone.Master.mute();
}

// STOPPING ORGAN

export const stopOrgan = () => {
    if (_isPlaying) {
        console.log("trying to stop...")

        synthPart1 = new Tone.Sequence();
 
        synthPart1.removeAll();
        synthPart1.stop();

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

        echo.dispose();

        Tone.Master.dispose();
        console.log("disposed")
    }
};

// STOP ORGAN END

export const generateOrgan = (notesList) => {
    
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
        filter.Q.value = 4.31;
        filter.gain.value = 4.71;
        return filter;
    });

    echo = new Tone.FeedbackDelay('16n', 0.04);
    //routing synth through the reverb
    equalizer.forEach((equalizerBand, index) => {
        if (index < equalizer.length - 1) {
            equalizerBand.connect(equalizer[index + 1]);
        } else {
            equalizerBand.connect(echo);
        }
    }); 
    
    delay = Tone.context.createDelay(11.0);
    delayFade = Tone.context.createGain();

    delay.delayTime.value = 4.0;
    delayFade.gain.value = 0.75;

    leftSynth.connect(leftPanner);
    rightSynth.connect(rightPanner);

    leftPanner.connect(equalizer[0]);
    rightPanner.connect(equalizer[0]);

    // NEW REVERB

    let freeverb = new Tone.Freeverb(10, 4000).toMaster();
    freeverb.connect(freeverb);

    echo.toMaster();
    echo.connect(delay);

    delay.connect(Tone.context.destination);
    delay.connect(delayFade);
    delayFade.connect(delay);

    // Slow Transport bpw Down
    Tone.Transport.bpm.value = 50;

    // Create an array of notes to be played
    const timing = ['+0:2', '+1:2', '+5.0', '+6:0', '+11:2', '+11:2:2', '12:0:2', '+15:0'];
    let timeIndex;
    let indivTiming;
    
    function makeTiming() {

        timeIndex = Math.random(timing.length);
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
            leftSynth.triggerAttackRelease(note, time, makeTiming());
            synthStart = true;
        },
        notes,
        "2m"
    );


    synthPart1.humanize = true;


    synthPart1.start();
    // synthPart2.start();

    // START AUDIO TRANSPORT
    Tone.Transport.start();

    _isPlaying = true;


// ------------------
    // VISUALIZER 
    // Currently just doing FFT



    let fftNum = 4096;
    const fft = new Tone.Analyser("fft", fftNum);
    const waveform = new Tone.Analyser("waveform", 1024);

    leftSynth.fan(waveform, fft);
    rightSynth.fan(waveform, fft);

    let canvasWidth, canvasHeight, ctx;

    const fftCanvas = document.getElementById("viz-canvas");
    const fftContext = fftCanvas.getContext("2d");


    // drawing the FFT
    // function drawFFT(values) {
    //     fftContext.clearRect(0, 0, canvasWidth, canvasHeight);
    //     let x, y, barWidth, val;
    //     for (let i = 0, len = values.length; i < len - 1; i++) {
    //         barWidth = canvasWidth / len;
    //         x = barWidth * i;

    //         val = Math.abs(values[i] / 255);
    //         y = val * canvasHeight;
    //         fftContext.fillStyle = "rgba(255, 255, 179, " + val + ")";

    //         // fftContext.fillStyle = "rgba(31, 178, 204, " + val + ")";
    //         fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
    //     }
    // }

    //size the canvases
    function sizeCanvases() {
        canvasWidth = fftCanvas.offsetWidth;
        canvasHeight = fftCanvas.offsetHeight;
        fftContext.canvas.width = canvasWidth;
        fftContext.canvas.height = canvasHeight;
    }


    // ALT
    ctx = fftContext;
    function drawFFT(array) {

        //just show bins with a value over the treshold
        var threshold = 0;
        // clear the current state
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        //the max count of bins for the visualization
        var maxBinCount = array.length;
        //space between bins
        var space = 3;

        ctx.save();


        ctx.globalCompositeOperation = 'source-over';

        //console.log(maxBinCount); //--> 1024
        ctx.scale(0.5, 0.5);
        ctx.translate(window.innerWidth, window.innerHeight);
        ctx.fillStyle = "#fff";

        var bass = Math.floor(array[1]); //1Hz Frequenz 
        var radius = 500;

        var bar_length_factor = 1;
        if (canvasWidth >= 785) {
            bar_length_factor = 1.0;
        }
        else if (canvasWidth < 785) {
            bar_length_factor = 1.5;
        }
        else if (canvasWidth < 500) {
            bar_length_factor = 20.0;
        }
        console.log(canvasWidth);
        //go over each bin
        for (var i = 0; i < maxBinCount; i++) {

            var value = array[i];
            if (value >= threshold) {
                //draw bin
                //ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
                //ctx.fillRect(i * space, c.height, 2, -value);
                ctx.fillRect(0, radius, canvasWidth <= 450 ? 2 : 3, -value / bar_length_factor);
                ctx.rotate((180 / 128) * Math.PI / 180);
            }
        }

        for (var i = 0; i < maxBinCount; i++) {

            var value = array[i];
            if (value >= threshold) {

                //draw bin
                //ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
                //ctx.fillRect(i * space, c.height, 2, -value);
                ctx.rotate(-(180 / 128) * Math.PI / 180);
                ctx.fillRect(0, radius, canvasWidth <= 450 ? 2 : 3, -value / bar_length_factor);
            }
        }

        for (var i = 0; i < maxBinCount; i++) {

            var value = array[i];
            if (value >= threshold) {

                //draw bin
                //ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
                //ctx.fillRect(i * space, c.height, 2, -value);
                ctx.rotate((180 / 128) * Math.PI / 180);
                ctx.fillRect(0, radius, canvasWidth <= 450 ? 2 : 3, -value / bar_length_factor);
            }
        }

        ctx.restore();
    }
    // ALT END


    function loop() {
        requestAnimationFrame(loop);
        //get the fft data and draw it
        drawFFT(fft.getValue());
        // console.log(fft.getValue());

    }




 
    let synthInterval = setInterval( () => {
            if (synthStart) {
                sizeCanvases();
                loop();
                clearInterval(synthInterval);
            }
        }, 10);

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