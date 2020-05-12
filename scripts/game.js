/* IMPORTAÇÃO DOS PACKS */

let packs = JSON.parse(localStorage.getItem("packs"))

/* ESTADO DO JOGO */ 
/************************************************************* */
let estado = {
    login: null,
    matches: 0,
    startTime: null,
    timePassed: null,
    timerID: null,
    currentCards: [],
    usedCards: []
}

let config = {
    backImageSource: "imagens/testPatternCard.PNG",
    frontImagePackSource: localStorage.getItem("selectedIconPack") ||  packs.lego
}

let playerStatus = {
    zPoints: localStorage.getItem('zPoints') || 0
};

/************************************************************* */

/* FUNÇÕES */

function imageSetter() {
    
    /* Definição da imagem de trás */

    for (i=0; i<20; i++){
        document.getElementsByClassName("cardBack")[i].getElementsByTagName("img")[0].src = config.backImageSource
    }
    /* Definição das imagens da frente */

    
    iconPackClone = [...config.frontImagePackSource] // Clonagem do iconPack atual de modo a não alterar o original
    let pairedIconPackClone = []
    
    shuffleArray(iconPackClone)

    for (i=0; i<10; i++ ) { //Duplicação dos elementos no iconPack para que sejam formados pares
        pairedIconPackClone.push(iconPackClone[i])
        pairedIconPackClone.push(iconPackClone[i])
    }

    shuffleArray(pairedIconPackClone)
    shuffleArray(pairedIconPackClone)

    for (i=0; i<20; i++){
        document.getElementsByClassName("cardFront")[i].getElementsByTagName("img")[0].src = pairedIconPackClone[i]
    
    }

}

function cardSourceChecker(n) {
    return document.getElementsByClassName("cardFront")[n].getElementsByTagName("img")[0].src
}


/* FUNÇÕES DE CONTROLO DE APRESENTAÇÃO DO JOGO/BOTÕES */

function singlePlayerButton() {

    // Esconder elementos e mostar o start button

    document.getElementsByClassName("singlePlayer")[0].style.display = "none"
    document.getElementsByClassName("multiPlayer")[0].style.display = "none"

    document.getElementsByClassName("startButton")[0].style.display = "block"
    document.getElementsByClassName("sideBar")[0].style.display = "none"
}

function startButton () {
    document.getElementsByClassName("gameContent")[0].style.display = "inline-block"
    document.getElementsByClassName("cardTable")[0].style.display = "inline-block"
    document.getElementsByClassName("sideBar")[0].style.display = "inline-block"
    document.getElementsByClassName("startButton")[0].style.display = "none"

    for (i=0; i<20;i++) {
        document.getElementsByClassName("cardContainer")[i].style.visibility = "visible"
    }
    
    estado.startTime = Math.floor(Date.now()/1000)
    estado.timerID = setInterval(showTimePassed,1000)
    showTempStats();

}

function showTimePassed() {

    estado.timePassed = Math.floor((Date.now()/1000 - estado.startTime))
  
    // Atualiza o temporizador visualmente.
    document.getElementsByClassName("durationCounter")[0].getElementsByTagName("span")[0].innerHTML = estado.timePassed
  
  }

/* FUNÇÃO PRINCIPAL */

function showCard(n) {
    cardStyle = document.getElementsByClassName("card")[n].style
    cardStyle.transform = "rotateY(0deg)"
    
    if (estado.currentCards.length < 2 && n!=estado.currentCards[0] && !(estado.usedCards.includes(n))){
        estado.currentCards.push(n)
    }
    if ((estado.currentCards.length) == 2) {
        if (cardSourceChecker(estado.currentCards[0]) == cardSourceChecker(estado.currentCards[1]) && estado.currentCards[0] != estado.currentCards[1] ){

            estado.matches += 1
            estado.usedCards.push(estado.currentCards[0], estado.currentCards[1])
            estado.currentCards = []
            
        } else if (!(cardSourceChecker(estado.currentCards[0]) == cardSourceChecker(estado.currentCards[1]))) {

            /* É necessário definir estes backups dos identificadores das cartas, pois caso contrário,
            estado.currentCards estaria vazio pela altura em que setTimeout executásse o código interno */
            
            let tmpCardNum0 = estado.currentCards[0]
            let tmpCardNum1 = estado.currentCards[1]

            setTimeout(function() {
                hideCard(tmpCardNum0)
                hideCard(tmpCardNum1)
            }, 1000)

            estado.currentCards = []

            
        }
        if (estado.matches ==10) {
            clearInterval(estado.timerID)
        }
        if (estado.matches == 10) {
            endGame()
        }
    updateMatches()

    }

}

function endGame() {
    playerStatus.zPoints = parseInt(playerStatus.zPoints) + 1;
    updateTempStats();

    // Atualiza os pontos do jogador.
    document.getElementsByClassName("zemiraPoints")[0].getElementsByTagName("span")[0].innerHTML = localStorage.getItem('zPoints');

    resetEstado();
    for (i=0; i<20; i++) {document.getElementsByClassName("card")[i].style.transform = "rotateY(180deg)";};

    document.getElementsByClassName("gameContent")[0].style.display = "none";
    document.getElementsByClassName("cardTable")[0].style.display = "none";
    document.getElementsByClassName("sideBar")[0].style.display = "none";
    document.getElementsByClassName("startButton")[0].style.display = "block";

}

function resetEstado() {
    estado.usedCards = [];
    estado.startTime = null;
    estado.timerID = null;
    estado.timePassed = null;
    estado.matches = 0;
}

function updateMatches() {
    document.getElementsByClassName("matchesFound")[0].getElementsByTagName("span")[0].innerHTML = estado.matches;
}


function hideCard(n) {
    cardStyle = document.getElementsByClassName("card")[n].style;
    cardStyle.transform = "rotateY(180deg)";
}

function updateTempStats() {
    localStorage.setItem('zPoints', playerStatus.zPoints);
}

function showTempStats () {
    document.getElementsByClassName("zemiraPoints")[0].getElementsByTagName("span")[0].innerHTML = localStorage.getItem('zPoints');
}



/* Uso do algoritmo Fisher-Yates-Durstenfelt para organizar uma lista de forma aleatoria */

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

/* FUNÇÕES RELATIVAS AO FORM DE LOGIN */ 

function openLogin() {
    let loginBox = document.getElementById("loginBox")
    let dimmer = document.getElementById("dimmer")
    loginBox.style.display = "block"
    setTimeout(function() {
        loginBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)

  }
  
function closeLogin() {
    let loginBox = document.getElementById("loginBox")
    let dimmer = document.getElementById("dimmer")


    loginBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        loginBox.style.display = "none";
        
    },200)

}
  