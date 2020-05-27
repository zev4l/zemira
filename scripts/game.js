// Impede alguns erros fáceis de cometer.
"use strict";

/* IMPORTAÇÃO DOS PACKS */

let packs = JSON.parse(localStorage.getItem("packs"))

let backs = JSON.parse(localStorage.getItem("backs"))

let avatars = JSON.parse(localStorage.getItem("avatars"))

/* CONSTRUTOR E GESTÃO DE JOGADORES TEMPORÁRIOS */ 

function tempPlayer(name) {
    this.name= name,
    this.matches= 0,
    this.cardsFlipped= 0
}

let tempPlayerList = []

let TURN_ID = null

let TURN_CONTAINER_ID = null

/************************************************************* */
/* ESTADO DO JOGO */

let estado = {
    loggedIn: null,
    matches: 0,
    startTime: null,
    timePassed: null,
    timerID: null,
    currentCards: [],
    usedCards: [],
    multiplayer: false, // Usado para saber se a instância do jogo é MP ou não
    currentMPPlayer: null
}

let defaultPack = packs.socialMedia

let defaultBack = "imagens/cardBacks/cardBack.png"

let defaultAvatar = "imagens/avatares/dogeAvatar.png"

let config = {
    backImageSource: defaultBack,
    frontImagePackSource:  defaultPack,
    avatar: defaultAvatar
}

/* Especificidades do multiplayer */

let duplicateNameErrorTimeoutID = null;

/************************************************************* */


/* FUNÇÕES */

function inicial() {

    menuElementToggle()

    // Permite jogar multiplayer quando se está logged-in
    multiplayerEnabler()

    imageSetter()
    settingsFiller()

    TURN_ID = document.getElementById("turn")
    TURN_CONTAINER_ID = document.getElementById("turnContainer")
}

// Função que define imagens das cartas (frente + trás)
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

function startTimeCounter() {
    estado.startTime = Math.floor(Date.now()/1000)
    estado.timerID = setInterval(showTimePassed,1000)
}


/* FUNÇÃO PRINCIPAL */

function showCard(n) {

    let multiplayerOn = estado.multiplayer

    /* Atualiza o contador de cartas viradas em todo o tempo de jogo do utilizador
    Simultaneamente impede um jogador de farmar cardFlips, pois verifica se a carta
    já se inclui numa match (se pertence a usedCards) ou se é a mesma que a primeira */
    if (currentAccount && n!=estado.currentCards[0] && !(estado.usedCards.includes(n))) {
        if (multiplayerOn) {
            if (currentAccount.username == estado.currentMPPlayer.name ) {
                currentAccount.stats.cardsFlipped ++;
                updateStats()
            }
        } else if (!(multiplayerOn)) {
            currentAccount.stats.cardsFlipped ++;
            updateStats()
        }
        
    }

    if (multiplayerOn && n!=estado.currentCards[0] && !(estado.usedCards.includes(n))) {
        MPStatUpdater("cardsFlipped")
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

            if (multiplayerOn) {
                MPStatUpdater("matches")
                
            }
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

        if (multiplayerOn) {
    
            MPTurnHandler()

            /* Este passo serve para que possa haver um pequeno atraso no mostrador de turns,
            mas que os dados dos jogadores possam ser atualizados instantaneamente.
            Sem este passo, um jogador poderia clicar em mais que 2 cartas por jogada, fazendo
            com que os stats de fim de jogo fossem destabilizados (um jogador poderia ter 
            muitas mais cardsFlipped do que outros. */
            let currentPlayerBackup = estado.currentMPPlayer

            setTimeout(function() {
                TURN_ID.innerHTML = currentPlayerBackup.name
            }, 1000)
    
        }

        if (estado.matches == 10) {
            endGame()
        }

        
    // Para mostrar as matches atualizadas
    showStats()

    }

}

// Funções ajudantes da principal

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

    clearInterval(estado.timerID)

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

            accountArray[i].stats.zPoints = currentAccount.stats.zPoints
            accountArray[i].stats.gamesCompleted = currentAccount.stats.gamesCompleted
            accountArray[i].stats.cardsFlipped = currentAccount.stats.cardsFlipped
            accountArray[i].stats.matchesFoundEver = currentAccount.stats.matchesFoundEver

            accountArray[i].aesthetics.iconPack = currentAccount.aesthetics.iconPack
            accountArray[i].aesthetics.cardBack = currentAccount.aesthetics.cardBack
            accountArray[i].aesthetics.avatar = currentAccount.aesthetics.avatar
            break
        }
    }
    updateAccounts()
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

/* FUNÇÕES QUE GEREM VISIBILIDADE DE ELEMENTOS HTML */

function showSPGameElements() {
    // Mostra elementos essenciais ao jogo em single player
    document.getElementsByClassName("gameContent")[0].style.display = "inline-block"
    document.getElementsByClassName("cardTable")[0].style.display = "inline-block"
    document.getElementsByClassName("sideBar")[0].style.display = "inline-block"

    for (let i=0; i<20;i++) {
        document.getElementsByClassName("cardContainer")[i].style.visibility = "visible"
    }

}

function showMPGameElements() { 
     // Mostra elementos essenciais ao jogo em single player
    document.getElementsByClassName("gameContent")[0].style.display = "inline-block"
    document.getElementsByClassName("cardTable")[0].style.display = "inline-block"
    document.getElementsByClassName("sideBar")[0].style.display = "inline-block"
    TURN_CONTAINER_ID.style.display = "block"

    for (let i=0; i<20;i++) {
        document.getElementsByClassName("cardContainer")[i].style.visibility = "visible"
    }
}

function hideNonGameElements() {
    document.getElementsByClassName("multiPlayer")[0].style.display = "none"
    document.getElementsByClassName("singlePlayer")[0].style.display = "none"
    document.getElementsByClassName("settingsButton")[0].style.display = "none"
    document.getElementsByClassName("statsButton")[0].style.display = "none"

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

/* Uso do algoritmo Fisher-Yates-Durstenfelt para organizar uma lista de forma aleatoria */

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

/* Funções relativas à caixa de singleplayer */

function singleplayerStart() {

    // Esconder elementos do menu home e mostrar elementos do jogo

    hideNonGameElements()
    closeSingleplayer()

    showSPGameElements()
    
    startTimeCounter()

    // Para mostrar os zPoints atualizados
    showStats();

}

function openSingleplayer(){
    let singleplayerBox = document.getElementById("singleplayerBox")
    let dimmer = document.getElementById("dimmer")
    singleplayerBox.style.display = "block"
    setTimeout(function() {
        singleplayerBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}

function closeSingleplayer() {
    let singleplayerBox = document.getElementById("singleplayerBox")
    let dimmer = document.getElementById("dimmer")


    singleplayerBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        singleplayerBox.style.display = "none";
        
    },200)
}

/* Funções relativas ao multiplayer */

function multiplayerEnabler() {
    if (currentAccount) {
        let MPPlayButton = document.getElementsByClassName("multiPlayerButton")[0]

        MPPlayButton.innerHTML = "Play!"
        MPPlayButton.addEventListener("click", openMultiplayer)
    }
}

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

function multiplayerStart() {

    let nameForm = document.forms.namesOfPlayers
    let validInput = nameForm.reportValidity()

    // Obtenção dos nomes referidos
    let playerNames = []

    for (let i=0; i<nameForm.elements.length; i++) {
        playerNames.push(nameForm.elements[i].value)
    }

    // Verificação de nomes duplicados
    let dupeChecker = checkMPNames(playerNames)


    if (validInput && !(dupeChecker)) {
        closeMultiplayer()
        hideNonGameElements()
        showMPGameElements()
        startTimeCounter()

        for (let i = 0; i < playerNames.length; i++) {
            let newTempPlayer = new tempPlayer(playerNames[i])
            tempPlayerList.push(newTempPlayer)
        }
        
        estado.multiplayer = true
        estado.currentMPPlayer = tempPlayerList[0]
        TURN_ID.innerHTML = estado.currentMPPlayer.name
        


        
    }
}

function checkMPNames(playerNames) {

    let hasDupes = (new Set(playerNames)).size !== playerNames.length

    if (hasDupes) {
        showDuplicateNameErrorMessage()
    }

    return hasDupes
}

function MPTurnHandler() {
    let playerIndex = tempPlayerList.indexOf(estado.currentMPPlayer)

    // Faz reset do contador de indice
    if (playerIndex + 1 == tempPlayerList.length) {
        playerIndex = -1;
    }
    estado.currentMPPlayer = tempPlayerList[playerIndex+1]
}

function MPStatUpdater(scope) {

    // Incrementa matches nas estatisticas do jogador atual
    if (scope=="matches") {
        estado.currentMPPlayer.matches ++
    }

    // Incrementa cardsFlipped nas estatisticas do jogador atual
    if (scope=="cardsFlipped") {
        estado.currentMPPlayer.cardsFlipped ++
    }
}

// Funções relativas a mensagens de erro

function showDuplicateNameErrorMessage() {
    if (duplicateNameErrorTimeoutID) {
        clearTimeout(duplicateNameErrorTimeoutID)
    }

    let startButton = document.getElementById("MPStartButton") 

    startButton.innerHTML = "DO NOT USE DUPLICATE NAMES"
    startButton.style.backgroundColor = "red"
    startButton.classList.remove("backgroundHighlight")

    duplicateNameErrorTimeoutID = setTimeout(function() {
        startButton.innerHTML = "Start"
        startButton.style.backgroundColor = ""
        startButton.classList.add("backgroundHighlight")
        
    },2000)
}



