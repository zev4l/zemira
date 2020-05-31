// Impede alguns erros fáceis de cometer.
"use strict";

/* IMPORTAÇÃO DOS PACKS */

let packs = JSON.parse(localStorage.getItem("packs"))

let backs = JSON.parse(localStorage.getItem("backs"))

let avatars = JSON.parse(localStorage.getItem("avatars"))

/* CONSTRUTOR E GESTÃO DE JOGADORES TEMPORÁRIOS */ 

/**
 * Esta função serve o propósito de criar objetos de jogador temporário, utilizados no multiplayer.
 * @param {string} name - nome do jogador temporário
 */
function tempPlayer(name) {
    this.name= name,
    this.matches= 0,
    this.cardsFlipped= 0
}

// Liste que alberga os objetos de jogador temporário durante jogos de multiplayer. Limpa após cada jogo.
let tempPlayerList = []

// Utilizados para identificar o elemento que alberga o nome do jogador multiplayer cuja vez é.
let TURN_ID = null

let TURN_CONTAINER_ID = null

// Utilizados para albergar o objetos Audio relativos à música de fundo e efeitos sonoros
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

// Representação dos recursos estéticos definidos por omissão

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

/**
 * Função inicial - controla o início da página, chamado funções responsáveis
 * por inicializarem a música, e definirem a maioria do resto dos recursos
 * estáticos relativos ao jogo e aos menus.
 */
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

/**
 * Função que define imagens das cartas (frente + trás) de acordo com os items que o utilizador
 * selecionou no menu settings 
 */
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
    
    // Organizar a lista de forma aleatória, para que se tirem icones aleatórios do pack selecionado.
    shuffleArray(iconPackClone)

    for (let i=0; i<10; i++ ) { //Duplicação dos elementos no iconPack para que sejam formados pares
        pairedIconPackClone.push(iconPackClone[i])
        pairedIconPackClone.push(iconPackClone[i])
    }

    shuffleArray(pairedIconPackClone)

    // Definição das imagens da frente da carta - "icones"

    for (let i=0; i<20; i++){
        document.getElementsByClassName("cardFront")[i].getElementsByTagName("img")[0].src = pairedIconPackClone[i]
    
    }

}
/**
 * Função responsável por verificar o atributo src de uma carta.
 * Utilizada externamente para verificar se duas cartas são iguais.
 * @param {int} n - número da carta, 0<=n<=19
 * @returns {string} - string que representa o nome do ficheiro de 
 * origem da imagem
 */
function cardSourceChecker(n) {
    return document.getElementsByClassName("cardFront")[n].getElementsByTagName("img")[0].src
}

/**
 * Função responsável por iniciar o contador de tempo de um jogo
 */
function startTimeCounter() {
    estado.startTime = Math.floor(Date.now()/1000)
    estado.timerID = setInterval(showTimePassed,1000)
}


/* FUNÇÃO PRINCIPAL */

/**
 * 
 * @param {int} n - número da carta, 0<=n<=19
 * Responsável por virar a carta indicada. Regista matches devidamente.
 * Responsável por tocar efeitos sonoros.
 * Responsável por virar cartas de volta para baixo caso estas não sejam
 * uma match.
 * Responsável por incrementar várias estatísticas do jogador.
 * Chama função responsável por terminar o jogo quando se atingem as 10 matches.
 */
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

/**
 * 
 * @param {n} n - número da carta, 0<=n<=19
 * Esconde a carta indicada por n
 */
function hideCard(n) {
    let cardStyle = document.getElementsByClassName("card")[n].style;
    cardStyle.transform = "rotateY(180deg)";
}


/**
 * Termina o jogo. Responsável por tocar o efeito sonoro de vitória.
 * Incrementa várias estatísticas da conta do jogador.
 * Termina o contador de tempo do jogo.
 */
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

/**
 * 
 * @param {string} scope - define os termos de uso da função. Suporta opção "multiplayer".
 * Responsável por reiniciar o jogo, redefinindo icones aleatórios, recomeçando o temporizador
 * e, caso scope=="multiplayer", reiniciando também os stats dos jogadores temporários.
 */
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
/**
 * Responsável por reiniciar os valores do estado do jogo.
 */
function resetEstado() {
    estado.usedCards = [];
    estado.startTime = null;
    estado.timerID = null;
    estado.timePassed = null;
    estado.matches = 0;
    estado.cardsFlipped = 0;
}


/* FUNÇÕES QUE GEREM VISIBILIDADE DE ELEMENTOS HTML */

/**
 * Responsável por atualizar as estatísticas vistas no ecrã, durante o jogo.
 */
function showStats () {

    if (currentAccount != null) {
        document.getElementsByClassName("zemiraPoints")[0].getElementsByTagName("span")[0].innerHTML = currentAccount.stats.zPoints;
    }
    else {
        document.getElementsByClassName("zemiraPoints")[0].getElementsByTagName("span")[0].innerHTML = "0 <br> (Not logged in)"
    }
    
    document.getElementsByClassName("matchesFound")[0].getElementsByTagName("span")[0].innerHTML = estado.matches;
}

/**
 * Mostra elementos necessários ao jogo em singleplayer.
 */
function showSPGameElements() {
    document.getElementsByClassName("gameContent")[0].style.display = "inline-block"
    document.getElementsByClassName("cardTable")[0].style.display = "inline-block"
    tableStartAnimation()
    
    document.getElementsByClassName("sideBar")[0].style.display = "inline-block"
    document.getElementById("singleplayerLeaderboard").style.display = "block"

    for (let i=0; i<20;i++) {
        document.getElementsByClassName("cardContainer")[i].style.visibility = "visible"
    }

}

/**
 * Mostra elementos necessários ao jogo em multiplayer.
 */
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

/**
 * Permite executar uma animação ao início de um jogo
 */
function tableStartAnimation() {

    setTimeout(function() {
        document.getElementsByClassName("cardTable")[0].style.opacity = 1
    },100)

    // Mostra cada carta suavemente, 100ms uma após da outra

    for (let i = 0; i<document.querySelectorAll(".cardContainer").length; i++) {
        setTimeout(function() {
                document.querySelectorAll(".cardContainer")[i].style.opacity = "1"
            },200+(i*100))
        }
    
}

/**
 * Esconde elementos não necessários ao jogo em si.
 */
function hideNonGameElements() {
    document.getElementsByClassName("multiPlayer")[0].style.display = "none"
    document.getElementsByClassName("singlePlayer")[0].style.display = "none"
    document.getElementsByClassName("settingsButton")[0].style.display = "none"
    document.getElementsByClassName("statsButton")[0].style.display = "none"

}

/**
 * Responsável por atualizar, no ecrã, o temporizador.
 */
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

/**
 * 
 * @param {array} array 
 * Função responsável por baralhar um array. Utilizada externamente para escolher ícones aleatórios.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

/* Funções relativas à caixa de singleplayer */

/**
 * Responsável por gerir as funções a chamar quando se inicia um jogo em singleplayer.
 */
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

/**
 * Abre o popup de singleplayer.
 */
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

/**
 * Fecha o popup de singleplayer.
 */
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

/**
 * Permite entrar no multiplayer quando logged-in.
 */
function multiplayerEnabler() {
    if (currentAccount) {
        let MPPlayButton = document.getElementsByClassName("multiPlayerButton")[0]

        MPPlayButton.innerHTML = "Play!"
        MPPlayButton.addEventListener("click", openMultiplayer)
    }
}

/**
 * Abre o popup de multiplayer.
 */
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
  

/**
 * Fecha o popup de multiplayer.
 */
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

/**
 * Permite passar ao segundo ecrã do menu de entrada para um jogo multiplayer.
 */
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

/**
 * Permite reverter ao primeiro ecrã do menu de multiplayer.
 */
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


/**
 * Responsável por iniciar um jogo de multiplayer, verificado a validade dos
 * forms preenchidos no respetivo menu.
 */
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

/**
 * Dentro de uma lista de nomes de jogadores, permite verificar se algum deles se repete.
 * @param {array} playerNames - array de nomes de jogadores
 */
function checkMPNames(playerNames) {

    let hasDupes = (new Set(playerNames)).size !== playerNames.length

    if (hasDupes) {
        showDuplicateNameErrorMessage()
    }

    return hasDupes
}

/**
 * Responsável por gerir os turnos dos jogadores num jogo multiplayer.
 */
function MPTurnHandler() {
    let playerIndex = tempPlayerList.indexOf(estado.currentMPPlayer)

    // Faz reset do contador de indice
    if (playerIndex + 1 == tempPlayerList.length) {
        playerIndex = -1;
    }
    estado.currentMPPlayer = tempPlayerList[playerIndex+1]
}

/**
 * Responsável por incrementar em  estatísticas de jogadores temporários.
 * @param {string} scope - suporta scope=="matches" e scope=="cardsFlipped"
 * scope=="matches" - incrementa "matches" no jogador cuja turn é a atual
 * scope=="cardsFlipped" - incrementa "cards flipped" no jogador cuja turn é a atual
 */
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

/**
 * Mostra uma mensagem de erro no lugar do botão respetivo quando se usam nomes duplicados
 * nos menus de multiplayer.
 */
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

/**
 * Permite abrir o popup de fim de jogo.
 */
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

/**
 * Permite fechar o popup de fim de jogo.
 */
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

/**
 * Enche as tabelas de endgame conforme as estatísticas dos jogadores/do jogador.
 */
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
        // Organiza a lista conforme o número de matches dos jogadores como primeiro atributo de decisão, tendo a sua accuracy como segundo atributo de decisão.
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

/**
 * Recebe um objeto tempPlayer e devolve a sua accuracy.
 * @param {tempPlayer} tempPlayerObject
 */
function getTempPlayerAccuracy(tempPlayerObject) {
    let playerAccuracy = Math.round((tempPlayerObject.matches / (tempPlayerObject.cardsFlipped/2)) * 100)
    
    return playerAccuracy
}

// Funções relativas ao popup de leaderboard (não o de final de jogo)

/**
 * Permite abrir o leaderboard, através do menu hamburger.
 */
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
  
/**
 * Permite fechar o leaderboard.
 */
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






