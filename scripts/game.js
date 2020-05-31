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

let music = null

let matchesSoundEffect = null

let cardFlipSoundEffect = null

let winningSoundEffect = new Audio("sons/winningSound.wav")

/************************************************************* */
/* ESTADO DO JOGO */

let estado = {
    loggedIn: null,
    matches: 0,
    startTime: null,
    timePassed: null,
    timerID: null,
    cardsFlipped: null,
    currentCards: [],
    usedCards: [],
    multiplayer: false, // Usado para saber se a instância do jogo é MP ou não
    currentMPPlayer: null
}

let defaultIconPack = packs.default

let defaultBack = "imagens/cardBacks/cardBack.png"

let defaultAvatar = "imagens/avatares/zemiraDefaultAvatar&TopImage.png"

let config = {
    backImageSource: defaultBack,
    frontImagePackSource:  defaultIconPack,
    avatar: defaultAvatar
}

/* Especificidades do multiplayer */

let duplicateNameErrorTimeoutID = null;

/************************************************************* */


/* FUNÇÕES */

function inicial() {

    startMusic()

    winningSoundEffect.volume = 0.3


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

    if (n!=estado.currentCards[0] && !(estado.usedCards.includes(n))) {
        estado.cardsFlipped ++
        // Elemento Audio é definido aqui para que seja tocado quando as 
        // cartas são clicadas repetidamente em pouco tempo
        cardFlipSoundEffect = new Audio("sons/cardFlip.wav")
        cardFlipSoundEffect.volume = 0.3
        cardFlipSoundEffect.play()

    }


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

        matchesSoundEffect =  new Audio("sons/matchFound.wav")
        matchesSoundEffect.volume = 0.3
        matchesSoundEffect.play()

            
            
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
let multiplayerOn = estado.multiplayer

    winningSoundEffect.play()
    // abre o popup de fim de jogo

    openEndgamePopup()

    if (currentAccount) {
        currentAccount.stats.zPoints ++
        currentAccount.stats.gamesCompleted ++
        if (!(multiplayerOn) && (currentAccount.stats.lowestTime == null || estado.timePassed < currentAccount.stats.lowestTime)) {
            currentAccount.stats.lowestTime = estado.timePassed
        }

        // Verificar se existem valores na lista de melhores tempos maiores que o deste jogo

        let valueCheck = currentAccount.stats.bestTimes.some(el => el.timeTaken > estado.timePassed)

        currentAccount.stats.bestTimes.sort((a, b) => (a.timeTaken > b.timeTaken) ? 1 : -1)

        if (!(multiplayerOn) && (currentAccount.stats.bestTimes.length < 11 || valueCheck)) {
            let playerAccuracy = Math.round((estado.matches / (estado.cardsFlipped/2)) * 100)

            // Obter data em forma YYYY-MM-DD
            let currentDate = new Date().toISOString().slice(0, 10)
            
            let newBestTimeObject = new matchData(estado.timePassed, playerAccuracy, currentDate)

            currentAccount.stats.bestTimes.push(newBestTimeObject)

            // Reorganizar lista

            currentAccount.stats.bestTimes.sort((a, b) => (a.timeTaken > b.timeTaken) ? 1 : -1)

            if (currentAccount.stats.bestTimes.length > 10) {
                currentAccount.stats.bestTimes.pop()
            }






        }

        console.log(currentAccount.stats.bestTimes)
        updateStats();
    }

    clearInterval(estado.timerID)

    // Atualiza os zPoints do jogador.
    showStats()

}

function restartButton(scope=null) {
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
    closeEndgamePopup()

    if (scope="multiplayer") {
        for (let i = 0; i< tempPlayerList.length; i++) {
            let currentPlayer = tempPlayerList[i]
            currentPlayer.matches = 0
            currentPlayer.cardsFlipped = 0
        }
    }
}

/* FUNÇÕES QUE GEREM VARIÁVEIS E LOCALSTORAGE */ 

function resetEstado() {
    estado.usedCards = [];
    estado.startTime = null;
    estado.timerID = null;
    estado.timePassed = null;
    estado.matches = 0;
    estado.cardsFlipped = 0;
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
    tableStartAnimation()
    
    document.getElementsByClassName("sideBar")[0].style.display = "inline-block"
    document.getElementById("singleplayerLeaderboard").style.display = "block"

    for (let i=0; i<20;i++) {
        document.getElementsByClassName("cardContainer")[i].style.visibility = "visible"
    }

}

function showMPGameElements() { 
     // Mostra elementos essenciais ao jogo em single player
    document.getElementsByClassName("gameContent")[0].style.display = "inline-block"
    document.getElementsByClassName("cardTable")[0].style.display = "inline-block"
    tableStartAnimation()
    

    document.getElementsByClassName("sideBar")[0].style.display = "inline-block"
    document.getElementById("multiplayerLeaderboard").style.display = "block"
    TURN_CONTAINER_ID.style.display = "block"

    for (let i=0; i<20;i++) {
        document.getElementsByClassName("cardContainer")[i].style.visibility = "visible"
    }
}

function tableStartAnimation() {

    setTimeout(function() {
        document.getElementsByClassName("cardTable")[0].style.opacity = 1
    },100)

    for (let i = 0; i<document.querySelectorAll(".cardContainer").length; i++) {
        setTimeout(function() {
                document.querySelectorAll(".cardContainer")[i].style.opacity = "1"
            },200+(i*100))
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
    
    setTimeout(function() {
        startTimeCounter()
        enableCardClick()
    },2000)
    
    // Para mostrar os zPoints atualizados
    showStats();

}

function openSingleplayer(){
    let singleplayerBox = document.getElementById("singleplayerBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("disable")
    singleplayerBox.style.display = "block"
    setTimeout(function() {
        singleplayerBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}

function closeSingleplayer() {
    let singleplayerBox = document.getElementById("singleplayerBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")


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
    clickToggler("disable")
    multiplayerBox.style.display = "block"
    setTimeout(function() {
        multiplayerBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}
  
function closeMultiplayer() {
    let multiplayerBox = document.getElementById("multiplayerBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")


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

        // Dar algum tempo para as cartas aparecerem antes de começar o contador
        setTimeout(function() {
        startTimeCounter()
        enableCardClick()
        },1200)


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

// Funções relativas ao popup de final de jogo.

function openEndgamePopup() {
    let endgameBox = document.getElementById("endgameBox")
    let dimmer = document.getElementById("dimmer")
    let multiplayerOn = estado.multiplayer
    endgameFiller()
    clickToggler("disable")
    endgameBox.style.display = "block"

    setTimeout(function() {
        endgameBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}
  
function closeEndgamePopup() {
    let endgameBox = document.getElementById("endgameBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")


    endgameBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        endgameBox.style.display = "none";
        
    },200)
}

function endgameFiller() {
    let multiplayerLeaderboardTable = document.getElementById("multiplayerLeaderboardTable")
    let singleplayerLeaderboardTable = document.getElementById("singleplayerLeaderboardTable")
    let multiplayerOn = estado.multiplayer 

    // Lidar com o leaderboard de final de jogo do multiplayer
    if (multiplayerOn) {

        // Remover possíveis entradas de jogos anteriores
        while (multiplayerLeaderboardTable.children.length > 1) { 
            multiplayerLeaderboardTable.removeChild(multiplayerLeaderboardTable.lastElementChild);
        }

        // Adicionar novas entradas

            // mas primeiro, organizar a lista de jogadores pelo número de matches encontradas
            // primariamente, e secundariamente pelo nível de accuracy
        
        let listCopy = [...tempPlayerList]
        listCopy.sort((a, b) => (a.matches < b.matches) ? 1 : (a.matches === b.matches) ? ((getTempPlayerAccuracy(a) < getTempPlayerAccuracy(b)) ? 1 : -1) : -1 )

        for(let i= 0; i < listCopy.length; i++) {
        
            let currentPlayer = listCopy[i]
            let playerAccuracy = getTempPlayerAccuracy(currentPlayer)
            let MPTimeTaken = document.getElementById("MPTimeTaken")

            if (isNaN(playerAccuracy)) {
                playerAccuracy = 0
            }

            MPTimeTaken.innerHTML = estado.timePassed

            multiplayerLeaderboardTable.innerHTML += "<tr>" +
                                                "<td>" + (i+1) + "." + "</td>" +
                                                "<td>" + currentPlayer.name + "</td>" +
                                                "<td>" + currentPlayer.matches + "</td>" +
                                                "<td>" + currentPlayer.cardsFlipped + "</td>" +
                                                "<td>" + playerAccuracy + "%" + "</td>" +
                                                "</tr>"
                        
        }
    }

    // Lidar com o leaderboard de final de jogo com o singleplayer
    if (!(multiplayerOn)) {

        let SPTimeTaken = document.getElementById("SPTimeTaken")
        let SPCardsFlipped = document.getElementById("SPCardsFlipped")
        let SPAccuracy = document.getElementById("SPAccuracy")
        let playerAccuracy = Math.round((estado.matches / (estado.cardsFlipped/2)) * 100)

        if (isNaN(playerAccuracy)) {
            playerAccuracy = 0
        }

        SPTimeTaken.innerHTML = estado.timePassed
        SPCardsFlipped.innerHTML = estado.cardsFlipped
        SPAccuracy.innerHTML = playerAccuracy + "%"

        // Tabela de 10 melhores tempos 

        // Remover possíveis entradas de jogos anteriores
        while (singleplayerLeaderboardTable.children.length > 1) { 
            singleplayerLeaderboardTable.removeChild(singleplayerLeaderboardTable.lastElementChild);
        }


        let listCopy = [...currentAccount.stats.bestTimes]

        for(let i= 0; i < listCopy.length; i++) {
        
            let match = listCopy[i]
            let accuracy = match.accuracy
            let timeTaken = match.timeTaken
            let date = match.date


            singleplayerLeaderboardTable.innerHTML += "<tr>" +
                                                    "<td>" + (i+1) + "." + "</td>" +
                                                    "<td>" + timeTaken + "s" + "</td>" +
                                                    "<td>" + accuracy + "%" + "</td>" +
                                                    "<td>" + date + "</td>" +
                                                    "</tr>"

        }

    }
}

function getTempPlayerAccuracy(tempPlayerObject) {
    let playerAccuracy = Math.round((tempPlayerObject.matches / (tempPlayerObject.cardsFlipped/2)) * 100)
    
    return playerAccuracy
}

// Funções relativas ao popup de leaderboard (não o de final de jogo)

function openLeaderboard() {
    leaderboardFiller()
    clickToggler("disable")
    let leaderboardBox = document.getElementById("leaderboardBox")
    let dimmer = document.getElementById("dimmer")
    leaderboardBox.style.display = "block"
    setTimeout(function() {
        leaderboardBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}
  
function closeLeaderboard() {
    let leaderboardBox = document.getElementById("leaderboardBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")

    leaderboardBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        leaderboardBox.style.display = "none";
        
    },200)
}

function leaderboardFiller() {

    let leaderboardTable = document.getElementById("leaderboardTable")
    let tempCopy = [...accountArray]


     // Remover possíveis entradas de jogos anteriores
     while (leaderboardTable.children.length > 1) { 
        leaderboardTable.removeChild(leaderboardTable.lastElementChild);
    }



    tempCopy.sort((a, b) => (a.stats.lowestTime == null) ? 1 : ((a.stats.lowestTime > b.stats.lowestTime) ? 1 : -1))

    for(let i = 0; i<tempCopy.length; i++) {
        
        let playerName = tempCopy[i].username
        let playerLowestTime = tempCopy[i].stats.lowestTime
        let playerAvatar = tempCopy[i].aesthetics.avatar

        if (playerLowestTime == 0 || playerLowestTime == null) {
            playerLowestTime = "Never played"
        } else {
            playerLowestTime += " seconds"
        }

        leaderboardTable.innerHTML+="<tr>" +
                                    "<td>" + `<img class="leaderboardAvatar" src=${eval(playerAvatar)}>` + "</td>" +
                                    "<td>" + (i+1) + "." + "</td>" +
                                    "<td>" + playerName + "</td>" +
                                    "<td>" + playerLowestTime + "</td>" +
                                    "</tr>"
    }
}

// Funções relacionadas com audio

function startMusic() {
    music = backgroundMusic("sons/musicBackground.mp3")
}

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

function toggleMusic() {
    if (music.paused) {
        music.play()
        document.getElementById("musicToggle").src="imagens/soundIcon2.png"
    } else {
        music.pause()
        document.getElementById("musicToggle").src="imagens/muteIcon2.png"
    }
}





// Outras funções

function exitGame(scope=null) {
    location = location

    if (scope == "MPNewPlayers") {
        openMultiplayer()
    }
}

function enableCardClick() {
    let cardList = document.querySelectorAll(".cardContainer")

    for (let i = 0; i < cardList.length; i++) {
        cardList[i].style.pointerEvents = "auto"
    }
}

// Funções relativas a jogar com o teclado

// function keyboardSupport() {
//     let cardNumberPrompt = prompt("Enter card number!") 
// }






