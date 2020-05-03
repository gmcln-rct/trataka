import "./styles/index.scss";

import { makeNewTones } from './scripts/fetchCurrentsData';
import { setUpSounds } from './scripts/setUpSounds';
import { generateSoundscape, stopSoundscape, _isPlaying } from './scripts/generateSoundscape';
import StartAudioContext from 'startaudiocontext';


window.addEventListener("DOMContentLoaded", () => {
    let result, notesList, elem;

    elem = document.getElementById('select-button');

    elem.onclick = function (e) {
        e.preventDefault();
        Tone.context.resume()
        if (_isPlaying) {
            stopSoundscape();

            elem.setAttribute('class', 'play-button');
            elem.value = "Start Flame";
            elem.innerHTML = 'Start Flame';
            document.getElementById('viz-canvas').setAttribute('class', 'viz-off');
            // Stop Transport
        } else {
            StartAudioContext(Tone.context, '#select-button')
                .then( () => {
                    makeNewTones(result)
                        .then(
                            () => {
                                notesList = setUpSounds();
                                generateSoundscape(notesList);
                            }
                        )
                        .then( () => {
                            elem.value = "Extinguish Flame";
                            elem.setAttribute('class', 'stop-button');
                            elem.innerHTML= 'Extinguish Flame';
                            document.getElementById('viz-canvas').setAttribute('class', 'viz-on');
                        });
                    })

        };
        
    }

});