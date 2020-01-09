import Tone from 'tone';

import {synthPart1} from './generateOrgan';


// let synthPart1, synthPart2;
// let leftSynth, rightSynth, echo, delay, delayFade;
// STOPPING ORGAN

export const stopOrgan = () => {
    // if (_isPlaying) {
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
    // }
};

// STOP ORGAN END