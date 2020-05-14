/* IMPORTAÇÃO DOS PACKS */

let packs = JSON.parse(localStorage.getItem("packs"))

/* DEFINIÇÃO DE CONSTANTES E VARIÁVEIS GLOBAIS */

const REGISTER_EMAIL = "email"

const REGISTER_GENDER = "gender"

const REGISTER_AGE_GROUP = "age"

const REGISTER_USERNAME = "username"

const REGISTER_PASSWORD = "password"

const LOGIN_USERNAME = "username"

const LOGIN_PASSWORD = "password"

let formularioRegister = null

let formularioLogin = null

let errorTimeoutID = null

/* CONSTRUTOR DE CONTAS */

function Account(username, password, email, gender, ageGroup, stats) {

    this.username = username,
    this.password = password,
    this.email = email,
    this.gender = gender,
    this.ageGroup = ageGroup,
    this.stats = stats
}

function playerStats() {
    this.zPoints = 0,
    this.gamesCompleted = 0,
    this.cardsFlipped = 0,
    this.matchesFoundEver = 0,
    this.timeSpentPlaying = 0
}

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

let config = {
    backImageSource: "imagens/cardBack.png",
    frontImagePackSource: localStorage.getItem("selectedIconPack") ||  packs.socialMedia
}

let accountArray = JSON.parse(localStorage.getItem("accountArray")) || []

/************************************************************* */

/* FUNÇÕES */

function inicial() {

    formularioRegister = document.forms["registerForm"]

    formularioLogin = document.forms["loginForm"]

    loginRegisterButtonToggle()


    imageSetter()

}


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
    currentAccount.stats.cardsFlipped ++;
    updateStats()


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

            currentAccount.stats.matchesFoundEver ++

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

function hideCard(n) {
    cardStyle = document.getElementsByClassName("card")[n].style;
    cardStyle.transform = "rotateY(180deg)";
}

function endGame() {
    currentAccount.stats.zPoints ++
    currentAccount.stats.gamesCompleted ++
    updateStats();

    // Atualiza os zPoints do jogador.
    showStats()
}

function restartButton() {
    resetEstado();
    for (i=0; i<20; i++) {
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
    for (i=0; i<accountArray.length; i++){ 
        if (accountArray[i].username == currentAccount.username) {

            accountArray[i].stats.zPoints == currentAccount.zPoints
            accountArray[i].stats.gamesCompleted == currentAccount.gamesCompleted
            accountArray[i].stats.cardsFlipped == currentAccount.cardsFlipped
            accountArray[i].stats.matchesFoundEver == currentAccount.matchesFoundEver
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

/* FUNÇÕES RELATIVAS AO FORM DE REGISTER */ 

function openRegister() {
    let registerBox = document.getElementById("registerBox")
    let dimmer = document.getElementById("dimmer")
    registerBox.style.display = "block"
    setTimeout(function() {
        registerBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}

function closeRegister() {
    let registerBox = document.getElementById("registerBox")
    let dimmer = document.getElementById("dimmer")


    registerBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        registerBox.style.display = "none";
        
    },200)
}

function registerHandler() {
    let validAccount = formularioRegister.reportValidity()

    let used = usedCredentialChecker(formularioRegister.elements[REGISTER_USERNAME].value, 
                          formularioRegister.elements[REGISTER_EMAIL].value)

    if (validAccount && !used) {
        let newAccount = new Account(formularioRegister.elements[REGISTER_USERNAME].value,
                           formularioRegister.elements[REGISTER_PASSWORD].value,
                           formularioRegister.elements[REGISTER_EMAIL].value,
                           formularioRegister.elements[REGISTER_GENDER].value,
                           formularioRegister.elements[REGISTER_AGE_GROUP].value,
                           new playerStats)
                           
    formularioRegister.reset()
    closeRegister()
    
    accountArray.push(newAccount)

    updateAccounts()
    }
}

function loginHandler() {
    let validInput = formularioLogin.reportValidity()

    if (validInput){

        for (let i = 0; i < accountArray.length; i++) {
            if (accountArray[i].username == formularioLogin.elements[LOGIN_USERNAME].value) {
                if (accountArray[i].password == formularioLogin.elements[LOGIN_PASSWORD].value) {
                    currentAccount = accountArray[i]
                    loginRegisterButtonToggle()
                    closeLogin()
                    updateAccounts()
                    showStats()
                    break
                }
            }
            if (i == (accountArray.length - 1)) {
                showLoginErrorMessage()
            }
        
        }
        
    }
}

function showLoginErrorMessage() {

    if (errorTimeoutID) {
        clearTimeout(errorTimeoutID)
    }

    let loginSubmitButton = document.getElementById("loginSubmit") 

    loginSubmitButton.innerHTML = "INCORRECT USERNAME/PASSWORD"
    loginSubmitButton.style.backgroundColor = "red"

    errorTimeoutID = setTimeout(function() {
        loginSubmitButton.innerHTML = "Enter the Matrix"
        loginSubmitButton.style.backgroundColor = "#4CAF50"
        
    },3000)

}

function showRegisterErrorMessage(reason) {

    if (errorTimeoutID) {
        clearTimeout(errorTimeoutID)
    }

    let registerSubmitButton = document.getElementById("registerSubmit") 

    if (reason == "username"){
        registerSubmitButton.innerHTML = "USERNAME ALREADY IN USE"
    }
    if (reason == "email"){
        registerSubmitButton.innerHTML = "EMAIL ALREADY IN USE"
    }
    

    registerSubmitButton.style.backgroundColor = "red"

    errorTimeoutID = setTimeout(function() {
        registerSubmitButton.innerHTML = "Register"
        registerSubmitButton.style.backgroundColor = "#4CAF50"
        
    },3000)

}

function loginRegisterButtonToggle() {

    if (currentAccount) {
        document.getElementsByClassName("registerButton")[0].style.display = "none"
        document.getElementsByClassName("loginButton")[0].style.display = "none"
        document.getElementsByClassName("logoutButton")[0].style.display = "inline-block"
    }
    if (!(currentAccount)) {
        document.getElementsByClassName("registerButton")[0].style.display = "inline-block"
        document.getElementsByClassName("loginButton")[0].style.display = "inline-block"
        document.getElementsByClassName("logoutButton")[0].style.display = "none"
    }

}

function openLogout() {
    let logoutBox = document.getElementById("logoutBox")

    let playerSpan = document.getElementById("playerName")

    playerSpan.innerHTML = currentAccount.username

    playerSpan.style.animation = "color-change 5s infinite"

    let dimmer = document.getElementById("dimmer")

    logoutBox.style.display = "block"
    setTimeout(function() {
        logoutBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}

function closeLogout() {
    let logoutBox = document.getElementById("logoutBox")
    let dimmer = document.getElementById("dimmer")


    logoutBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        logoutBox.style.display = "none";
        
    },200)
}

function usedCredentialChecker(username, email) {
    for(i=0;i<accountArray.length; i++) {
        if (accountArray[i].username == username) {
            showRegisterErrorMessage("username")
            return true
        }
        if (accountArray[i].email == email) {
            showRegisterErrorMessage("email")
            return true
        }
    }
}



function logout() {
    currentAccount = null
    loginRegisterButtonToggle()
    updateAccounts()
    closeLogout()
}

