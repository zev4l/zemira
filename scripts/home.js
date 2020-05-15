// Impede alguns erros fáceis de cometer.
"use strict";

/*-----------------------------------------------------------------------------------------------*/
// Definição das funções que controlam a música de fundo na home.

let music = null;

function backgroundMusic(src) {
    let sound = document.createElement("audio");
    sound.src = src;
    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");
    sound.style.display = "none";
    sound.loop = true;
    sound.volume = 0.3;
    return sound
}

window.onload = startMusic

function startMusic() {
    music = backgroundMusic("sons/musicBackground.mp3")
}

function toggleMusicHome() {
    if (music.paused) {
        music.play()
        document.getElementById("soundButtonHome").src="imagens/soundIcon.png"
    } else {
        music.pause()
        document.getElementById("soundButtonHome").src="imagens/muteIcon.png"
    }
}


/*-----------------------------------------------------------------------------------------------*/
