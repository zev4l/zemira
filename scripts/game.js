// Impede alguns erros fáceis de cometer.
"use strict";

/* IMPORTAÇÃO DOS PACKS */

let packs = JSON.parse(localStorage.getItem("packs"))

let backs = JSON.parse(localStorage.getItem("backs"))

let avatars = JSON.parse(localStorage.getItem("avatars"))



/* ESTADO DO JOGO */ 
/************************************************************* */

let currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || null

let estado = {
    loggedIn: null,
    matches: 0,
    startTime: null,
    timePassed: null,
    timerID: null,
    currentCards: [],
    usedCards: []
}

let defaultPack = packs.socialMedia

let defaultBack = "imagens/cardBacks/cardBack.png"

let defaultAvatar = "imagens/avatares/dogeAvatar.png"



let config = {
    backImageSource: defaultBack,
    frontImagePackSource:  defaultPack,
    avatar: defaultAvatar
}

let accountArray = JSON.parse(localStorage.getItem("accountArray")) || []

/************************************************************* */

/* FUNÇÕES */

function inicial() {

    loginRegisterButtonToggle()

    imageSetter()
    settingsFiller()
}


function imageSetter() {
    
    /* Utilziar recursos selecionados pelo jogador */

    if (currentAccount) { // Define os items selecionados pelo jogador como recursos a usar no jogo
        config.backImageSource = eval(currentAccount.aesthetics.cardBack)
        config.frontImagePackSource = eval(currentAccount.aesthetics.iconPack)
        config.avatar = eval(currentAccount.aesthetics.avatar)
    }
    /* Definição da imagem de trás */

    for (let i=0; i<20; i++){
        document.getElementsByClassName("cardBack")[i].getElementsByTagName("img")[0].src = config.backImageSource
    }
    /* Definição das imagens da frente */

    
    let iconPackClone = [...config.frontImagePackSource] // Clonagem do iconPack atual de modo a não alterar o original
    let pairedIconPackClone = []
    
    shuffleArray(iconPackClone)

    for (let i=0; i<10; i++ ) { //Duplicação dos elementos no iconPack para que sejam formados pares
        pairedIconPackClone.push(iconPackClone[i])
        pairedIconPackClone.push(iconPackClone[i])
    }

    shuffleArray(pairedIconPackClone)
    shuffleArray(pairedIconPackClone)

    for (let i=0; i<20; i++){
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

function multiPlayerButton() {
	document.getElementsByClassName("singlePlayer")[0].style.display = "none"

    document.getElementsByClassName("multiPlayer")[0].style.display = "none"

    document.getElementsByClassName("startButton")[0].style.display = "none"

    document.getElementsByClassName("sideBar")[0].style.display = "none"
	
	document.getElementsByClassName("multiPlayerMainMenu")[0].style.display = "block"
	
}

function startButton () {
    document.getElementsByClassName("gameContent")[0].style.display = "inline-block"
    document.getElementsByClassName("cardTable")[0].style.display = "inline-block"
    document.getElementsByClassName("sideBar")[0].style.display = "inline-block"
    document.getElementsByClassName("startButton")[0].style.display = "none"
    document.getElementsByClassName("settingsButton")[0].style.display = "none"

    for (let i=0; i<20;i++) {
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
    if (currentAccount) {
        currentAccount.stats.timeSpentPlaying ++
        updateStats()
    }
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
    if (currentAccount) {
        currentAccount.stats.cardsFlipped ++;
        updateStats()
    }


    let cardStyle = document.getElementsByClassName("card")[n].style
    cardStyle.transform = "rotateY(0deg)"
    
    if (estado.currentCards.length < 2 && n!=estado.currentCards[0] && !(estado.usedCards.includes(n))){
        estado.currentCards.push(n)
    }
    if ((estado.currentCards.length) == 2) {
        if (cardSourceChecker(estado.currentCards[0]) == cardSourceChecker(estado.currentCards[1]) && estado.currentCards[0] != estado.currentCards[1] ){

            estado.matches ++
            estado.usedCards.push(estado.currentCards[0], estado.currentCards[1])
            estado.currentCards = []

            if (currentAccount) {
            currentAccount.stats.matchesFoundEver ++
            // Para que seja atualizado na localStorage o contador de matchesFoundEver
            updateStats()
            }

            
            
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

function hideCard(n) {
    let cardStyle = document.getElementsByClassName("card")[n].style;
    cardStyle.transform = "rotateY(180deg)";
}

function endGame() {
    if (currentAccount) {
        currentAccount.stats.zPoints ++
        currentAccount.stats.gamesCompleted ++
        updateStats();
    }

    // Atualiza os zPoints do jogador.
    showStats()
}

function restartButton() {
    resetEstado();
    for (let i=0; i<20; i++) {
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

/* FUNÇÕES QUE GEREM VARIÁVEIS E LOCALSTORAGE */ 

function resetEstado() {
    estado.usedCards = [];
    estado.startTime = null;
    estado.timerID = null;
    estado.timePassed = null;
    estado.matches = 0;
}


function updateStats() {
    for (let i=0; i<accountArray.length; i++){ 
        if (accountArray[i].username == currentAccount.username) {

            accountArray[i].stats.zPoints == currentAccount.zPoints
            accountArray[i].stats.gamesCompleted == currentAccount.gamesCompleted
            accountArray[i].stats.cardsFlipped == currentAccount.cardsFlipped
            accountArray[i].stats.matchesFoundEver == currentAccount.matchesFoundEver

            accountArray[i].aesthetics.iconPack == currentAccount.aesthetics.iconPack
            accountArray[i].aesthetics.cardBack == currentAccount.aesthetics.cardBack
            accountArray[i].aesthetics.avatar == currentAccount.aesthetics.avatar
            updateAccounts()
            break
        }

    }
}

function updateAccounts() {
    localStorage.setItem("accountArray", JSON.stringify(accountArray))
    localStorage.setItem("currentAccount", JSON.stringify(currentAccount))
}

function showStats () {

    if (currentAccount != null) {
        document.getElementsByClassName("zemiraPoints")[0].getElementsByTagName("span")[0].innerHTML = currentAccount.stats.zPoints;
    }
    else {
        document.getElementsByClassName("zemiraPoints")[0].getElementsByTagName("span")[0].innerHTML = "0 <br> (Not logged in)"
    }
    
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

/* Funções relativas ao multiplayer */

function openMultiplayer() {
    let multiplayerBox = document.getElementById("multiplayerBox")
    let dimmer = document.getElementById("dimmer")
    multiplayerBox.style.display = "block"
    setTimeout(function() {
        multiplayerBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)

}
  
function closeMultiplayer() {
    let multiplayerBox = document.getElementById("multiplayerBox")
    let dimmer = document.getElementById("dimmer")


    multiplayerBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        multiplayerBox.style.display = "none";
        
    },200)

    setTimeout(function() {
        multiplayerFirstScreen();
        
    },200)

}

function multiplayerSecondScreen() {
    let nextButton = document.getElementById("MPNextButton")
    let startButton = document.getElementById("MPStartButton")
    let numberForm = document.forms["numberOfPlayers"]
    let nameForm = document.forms["namesOfPlayers"]
    let numberFormText = document.getElementById("MPNumberFormText")
    let nameFormText = document.getElementById("MPNameFormText")
    let currentAccountName = document.getElementById("currentAccountName")

    let validInput = numberForm.reportValidity()

    if (validInput) {

        nextButton.style.display = "none"
        numberForm.style.display = "none"
        numberFormText.style.display = "none"

        startButton.style.display = "inline-block"
        nameForm.style.display = "inline-block"
        nameFormText.style.display = "inline-block"
        currentAccountName.value = currentAccount.username
        

        let selectedValue = numberForm.playerNumber.value



        for (let i=1; i < selectedValue; i++) {
        let newLabel = document.createElement("label")

            let playerNumber = i + 1 
            
            // Definição dos atributos da label

            newLabel.setAttribute("for",`player${playerNumber}`)
            newLabel.appendChild(document.createTextNode(` Player ${playerNumber}\'s name:`))


            // Definição de todos os atributos do input

            let newInput = document.createElement("input")
            newInput.className = "MPTextArea"
            newInput.setAttribute("type","text")
            newInput.setAttribute("id",`player${playerNumber}`)
            newInput.setAttribute("name", `playername${playerNumber}`)
            newInput.setAttribute("maxlength","30")
            newInput.setAttribute("size","15")
            newInput.setAttribute("placeholder","Enter Name")
            newInput.required = true

            // Adicionar label e input ao form dos nomes dos jogadores

            nameForm.appendChild(newLabel)
            nameForm.appendChild(newInput)
        }
    }
}

function multiplayerFirstScreen() {
    let nextButton = document.getElementById("MPNextButton")
    let startButton = document.getElementById("MPStartButton")
    let numberForm = document.forms["numberOfPlayers"]
    let nameForm = document.forms["namesOfPlayers"]
    let numberFormText = document.getElementById("MPNumberFormText")
    let nameFormText = document.getElementById("MPNameFormText")

    // Remover todos os inputs e labels excepto o primeiro par

    while (nameForm.children.length > 2) { 
        nameForm.removeChild(nameForm.lastElementChild);
    }




    nextButton.style.display = "inline-block"
    numberForm.style.display = "inline-block"
    numberFormText.style.display = "inline-block"

    startButton.style.display = "none"
    nameForm.style.display = "none"
    nameFormText.style.display = "none"
}