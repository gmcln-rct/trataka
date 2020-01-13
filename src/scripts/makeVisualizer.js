// VISUALIZER 
// Currently just doing FFT


    const fftCanvas = document.getElementById("viz-canvas");
    const fftContext = fftCanvas.getContext("2d");

export const makeVisualizer = (fft, synthStart) => {
    let canvasWidth, canvasHeight;




    //size the canvases
    function sizeCanvases() {
        canvasWidth = fftCanvas.offsetWidth;
        canvasHeight = fftCanvas.offsetHeight;
        fftContext.canvas.width = canvasWidth;
        fftContext.canvas.height = canvasHeight;
    }

    // drawing the FFT
    function drawFFT(values) {
        fftContext.clearRect(0, 0, canvasWidth, canvasHeight);
        let x, y, barWidth, val;
        for (let i = 0, len = values.length; i < len - 1; i++) {
            barWidth = (canvasWidth / len) / 20;
            x = barWidth * i;

            // val = Math.abs(values[i] / 255);
            val = Math.random(1) + 0.7;
            y = (val * canvasHeight) / 10;
            fftContext.fillStyle = "rgba(100, 75, 0, " + val + ")";

            // fftContext.fillStyle = "rgba(31, 178, 204, " + val + ")";
            fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
        }
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
    }, 10);

    //   END VISUALIZATION  
}

// let fftNum = 4096;
// const fft = new Tone.Analyser("fft", fftNum);
// const waveform = new Tone.Analyser("waveform", 1024);

// leftSynth.fan(waveform, fft);
// rightSynth.fan(waveform, fft);

