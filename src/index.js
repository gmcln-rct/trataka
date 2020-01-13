import "./styles/index.scss";

import { ydayCurrents } from './scripts/fetchCurrentsData';
import { setUpSounds } from './scripts/setUpSounds';
import { generateOrgan, stopOrgan, _isPlaying } from './scripts/generateOrgan';
import StartAudioContext from 'startaudiocontext';

let tideObjAlt = {
    0: ["0.911", "0.005"],
1: ["0.905", "0.008"],
2: ["0.901", "0.008"],
3: ["0.903", "0.007"],
4: ["0.918", "0.005"],
5: ["0.921", "0.006"],
6: ["0.924", "0.010"],
7: ["0.927", "0.006"],
8: ["0.934", "0.007"],
9: ["0.943", "0.005"],
10: ["0.949", "0.004"],
11: ["0.951", "0.005"],
12: ["0.949", "0.005"],
13: ["0.947", "0.005"],
14: ["0.949", "0.005"],
15: ["0.953", "0.004"],
16: ["0.961", "0.005"]
};


window.addEventListener("DOMContentLoaded", () => {
    let result, notesList, elem;

    let selection = document.getElementById('station_id');

    elem = document.getElementById('select-button');

    // StartAudioContext(Tone.context, 'select-button');

    elem.onclick = function (e) {
        e.preventDefault();
        result = selection.value;
        if (_isPlaying) {
            stopOrgan();
            selection.selectedIndex = 0;
            elem.setAttribute('class', 'play-button');
            elem.value = "Play";
            // Stop Transport
        } else {
            StartAudioContext(Tone.context, '#select-button')
                .then( () => {
                    ydayCurrents(result)
                        .then(
                            tideObj => {
                                // console.log("Tide Obj: ", tideObj);
                                console.log("Tide Obj Alt ", tideObjAlt);
                                notesList = setUpSounds(tideObjAlt);
                                generateOrgan(notesList);
                            }
                        )
                        .then( () => {
                            elem.value = "Stop";
                            elem.setAttribute('class', 'stop-button');
                        });
                    })

        };
        
    }

});