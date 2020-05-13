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
    backImageSource: "imagens/cardBack.png",
    frontImagePackSource: localStorage.getItem("selectedIconPack") ||  packs.socialMedia
}

let playerStats = {
    zPoints: JSON.parse(localStorage.getItem('zPoints')) || 0,
    gamesCompleted: JSON.parse(localStorage.getItem("gamesCompleted")) || 0,
    cardsFlipped: JSON.parse(localStorage.getItem("cardsFlipped")) || 0,
    matchesFoundEver: JSON.parse(localStorage.getItem("matchesFoundEver")) || 0,
    timeSpentPlaying: JSON.parse(localStorage.getItem("timeSpentPlaying")) || 0
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

    // Para mostrar os zPoints atualizados
    showStats();

}

function showTimePassed() {

    estado.timePassed = Math.floor((Date.now()/1000 - estado.startTime))

    /* Adiciona tempo jogado ao contador de timeSpentPlaying (localStorage).
       Existe aqui pois esta função é executada a cada segundo que passa.*/
    playerStats.timeSpentPlaying ++
    localStorage.setItem("timeSpentPlaying", playerStats.timeSpentPlaying);
    /* A variável é guardada no localStorage nesta função em vez de em showStats()
       por uma questão de fiabilidade. Ao ser feito aqui, todos os segundos de jogo
       serão contabilizados, mesmo que o utilizador feche abruptamente o browser
       em vez de carregar no botão de recomeçar, ou em vez de ganhar o jogo.
       Esta variável serve para contar todos os segundos passados a jogar ao longo
       de todo o tempo de jogo que o utilizador tem. */

  
    // Atualiza o temporizador visualmente.
    document.getElementsByClassName("durationCounter")[0].getElementsByTagName("span")[0].innerHTML = estado.timePassed
  
  }

/* FUNÇÃO PRINCIPAL */

function showCard(n) {

    // Atualiza o contador de cartas viradas em todo o tempo de jogo do utilizador
    playerStats.cardsFlipped ++;


    cardStyle = document.getElementsByClassName("card")[n].style
    cardStyle.transform = "rotateY(0deg)"
    
    if (estado.currentCards.length < 2 && n!=estado.currentCards[0] && !(estado.usedCards.includes(n))){
        estado.currentCards.push(n)
    }
    if ((estado.currentCards.length) == 2) {
        if (cardSourceChecker(estado.currentCards[0]) == cardSourceChecker(estado.currentCards[1]) && estado.currentCards[0] != estado.currentCards[1] ){

            estado.matches ++
            estado.usedCards.push(estado.currentCards[0], estado.currentCards[1])
            estado.currentCards = []
            playerStats.matchesFoundEver ++

            // Para que seja atualizado na localStorage o contador de matchesFoundEver
            updateStats()
            
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
    // Para mostrar as matches atualizadas
    showStats()

    }

}

function endGame() {
    playerStats.zPoints = playerStats.zPoints + 1;
    playerStats.gamesCompleted = playerStats.gamesCompleted + 1;
    updateStats();

    // Atualiza os zPoints do jogador.
    showStats()


}

function restartButton() {
    resetEstado();
    for (i=0; i<20; i++) {
        // document.getElementsByClassName("card")[i].style.transform = "rotateY(180deg)";
        hideCard(i)
    }

    // Volta a baralhar as cartas
    imageSetter()

    // Recomeçar o temporizador
    estado.startTime = Math.floor(Date.now()/1000)
    estado.timerID = setInterval(showTimePassed,1000)
    
    // Para mostrar as matches e os zPoints atualizados
    showStats();
}

function resetEstado() {
    estado.usedCards = [];
    estado.startTime = null;
    estado.timerID = null;
    estado.timePassed = null;
    estado.matches = 0;
}




function hideCard(n) {
    cardStyle = document.getElementsByClassName("card")[n].style;
    cardStyle.transform = "rotateY(180deg)";
}

function updateStats() {
    localStorage.setItem('zPoints', playerStats.zPoints);
    localStorage.setItem("gamesCompleted", playerStats.gamesCompleted);
    localStorage.setItem("cardsFlipped", playerStats.cardsFlipped);
    localStorage.setItem("matchesFoundEver", playerStats.matchesFoundEver);

}

function showStats () {
    document.getElementsByClassName("zemiraPoints")[0].getElementsByTagName("span")[0].innerHTML = localStorage.getItem('zPoints');
    document.getElementsByClassName("matchesFound")[0].getElementsByTagName("span")[0].innerHTML = estado.matches;
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
