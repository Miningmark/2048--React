'use strict'

//Audio Interface
let audio = document.getElementById("audio");
let slider = document.getElementById("volume");

let songArray = [   "musicfox_hot_dogs_for_breakfast", 
                    "musicfox_friendship_forever",
                    "musicfox_dancing_street",
                    "musicfox_shopping_street",
                    "musicfox_the_small_farm",
                    "musicfox_lift_me_up",
                    "musicfox_old_news",
                    "musicfox_big_synth_action"
                ];
let songIndex = 0;
let audioState = 0;

audio.volume = 0.5;
audio.src = "audio/" + songArray[0] + ".mp3";




// Update des sliders für die lautstärke
slider.oninput = function() {
    audio.volume = this.value / 100;
} 

$("#btnLast").on("click",function(e){
    nextSong(-1);
});

$("#btnPause").on("click",function(e){
    pauseSong();
});

$("#btnNext").on("click",function(e){
    nextSong(1);
});


audio.onended = function() {
    nextSong(1);
}; 

function nextSong(input){
    songIndex += input;
    if(songIndex >= songArray.length){
        songIndex = 0;
    }else if(songIndex < 0){
        songIndex = songArray.length - 1;
    }
    audio.pause();
    audio.src = "audio/" + songArray[songIndex] + ".mp3";
    audio.play();
}

function pauseSong(){
    switch(audioState){
        case 0:
            audio.play();
            audioState = 1;
            document.getElementById('btnPauseIcon').src="img/pause.png";
            break;
        case 1:
            audio.pause();
            audioState = 0;
            document.getElementById('btnPauseIcon').src="img/play.png";
            break;
    }
}