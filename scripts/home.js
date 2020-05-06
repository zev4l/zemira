/*-----------------------------------------------------------------------------------------------*/
// Definição das funções que controlam a música de fundo na home.

function backgroundMusic(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.loop = true;
    this.sound.volume = 0.3;
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
    return this
}

window.onload = startMusic

function startMusic() {
    window.music = backgroundMusic("sons/musicBackground.mp3")
}

function toggleMusicHome() {
    if (music.sound.paused) {
        music.play()
        document.getElementById("soundButtonHome").src="imagens/soundIcon.png"
    } else {
        music.stop()
        document.getElementById("soundButtonHome").src="imagens/muteIcon.png"
    }
}


/*-----------------------------------------------------------------------------------------------*/
