/* DEFINIÇÃO DE CONSTANTES E VARIÁVEIS GLOBAIS */

const REGISTER_EMAIL = "email"

const REGISTER_GENDER = "gender"

const REGISTER_AGE_GROUP = "age"

const REGISTER_USERNAME = "username"

const REGISTER_PASSWORD = "password"

const LOGIN_USERNAME = "username"

const LOGIN_PASSWORD = "password"

const SELECTED_PACK = "choosePack"

const SELECTED_BACK = "chooseBack"

const SELECTED_AVATAR = "chooseAvatar"

let formularioRegister = null

let formularioLogin = null

let formularioSettings = null

let errorTimeoutID = null

let appliedTimeoutID = null

let deleteAccountTimeoutID = null

let currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || null;

let accountArray = JSON.parse(localStorage.getItem("accountArray")) || [];

let hamburgerState = false


/* CONSTRUTOR DE CONTAS */

function Account(username, password, email, gender, ageGroup, stats, aesthetics) {

    this.username = username,
    this.password = password,
    this.email = email,
    this.gender = gender,
    this.ageGroup = ageGroup,
    this.stats = stats,
    this.aesthetics = aesthetics
    this.playmode = "mouse"

}

function playerStats() {
    this.zPoints = 0,
    this.gamesCompleted = 0,
    this.cardsFlipped = 0,
    this.matchesFoundEver = 0,
    this.timeSpentPlaying = 0,
    this.lowestTime = null
    this.bestTimes = []
}

function aesthetics() {
    this.cardBack = "defaultBack",
    this.avatar = "defaultAvatar",
    this.iconPack = "defaultPack",
    this.boughtCardBacks = [],
    this.boughtAvatars = [],
    this.boughtIconPacks = []
}

function matchData(timeTaken, accuracy, date) {
    this.accuracy = accuracy,
    this.timeTaken = timeTaken,
    this.date = date
}

// ************************************+

window.onload = inicial

function inicial() {

    menuElementToggle()

	
}

// FUNÇÕES GESTORAS DE DADOS

function updateStats() {
    for (let i=0; i<accountArray.length; i++){ 
        if (accountArray[i].username == currentAccount.username) {

			accountArray[i].aesthetics.boughtIconPacks = currentAccount.aesthetics.boughtIconPacks
			accountArray[i].aesthetics.boughtCardBacks = currentAccount.aesthetics.boughtCardBacks
			accountArray[i].aesthetics.boughtAvatars = currentAccount.aesthetics.boughtAvatars

			accountArray[i].aesthetics.iconPack = currentAccount.aesthetics.iconPack
            accountArray[i].aesthetics.cardBack = currentAccount.aesthetics.cardBack
			accountArray[i].aesthetics.avatar = currentAccount.aesthetics.avatar

			accountArray[i].stats.zPoints = currentAccount.stats.zPoints
            accountArray[i].stats.gamesCompleted = currentAccount.stats.gamesCompleted
            accountArray[i].stats.cardsFlipped = currentAccount.stats.cardsFlipped
            accountArray[i].stats.matchesFoundEver = currentAccount.stats.matchesFoundEver
            accountArray[i].stats.timeSpentPlaying = currentAccount.stats.timeSpentPlaying
            accountArray[i].stats.lowestTime = currentAccount.stats.lowestTime
            accountArray[i].stats.bestTimes = currentAccount.stats.bestTimes

			updateAccounts()
			
            break
		}

	}
	
}

function updateAccounts() {
    localStorage.setItem("accountArray", JSON.stringify(accountArray))
    localStorage.setItem("currentAccount", JSON.stringify(currentAccount))
}

function menuElementToggle() {

    if (currentAccount) {
        document.getElementsByClassName("registerButton")[0].style.display = "none"
        document.getElementsByClassName("loginButton")[0].style.display = "none"
        document.getElementsByClassName("logoutButton")[0].style.display = "inline-block"
        document.getElementsByClassName("settingsButton")[0].style.display = "inline-block"
        document.getElementById("hamburgerButton").style.display = "inline-block"

        if (location.href.includes("game.html")) {
            document.getElementsByClassName("statsButton")[0].style.display = "inline-block"
        }
    }
    if (!(currentAccount)) {
        document.getElementsByClassName("registerButton")[0].style.display = "inline-block"
        document.getElementsByClassName("loginButton")[0].style.display = "inline-block"
        document.getElementsByClassName("logoutButton")[0].style.display = "none"
        document.getElementsByClassName("settingsButton")[0].style.display = "none"
        document.getElementById("hamburgerButton").style.display = "none"
        document.getElementById("musicToggle").style.right = "25ex"

        if (location.href.includes("game.html")) {
            document.getElementsByClassName("statsButton")[0].style.display = "none"
        }
		
    }

}

/* FUNÇÕES RELATIVAS AO FORM DE LOGIN */ 

function openLogin() {
    let loginBox = document.getElementById("loginBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("disable")
    loginBox.style.display = "block"
    setTimeout(function() {
        loginBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}
  
function closeLogin() {
    let loginBox = document.getElementById("loginBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")


    loginBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        loginBox.style.display = "none";
        
    },200)
}

function loginHandler() {

    formularioLogin = document.forms["loginForm"]

    let validInput = formularioLogin.reportValidity()

    if (validInput){

        if (accountArray.length == 0) {
            showLoginErrorMessage()
        }

        for (let i = 0; i < accountArray.length; i++) {
            if (accountArray[i].username == formularioLogin.elements[LOGIN_USERNAME].value) {
                if (accountArray[i].password == formularioLogin.elements[LOGIN_PASSWORD].value) {
                    currentAccount = accountArray[i]
                    menuElementToggle()
                    closeLogin()
                    updateAccounts()
                    settingsFiller()

                    if (location.href.includes("game.html")) {
                        imageSetter()
                        multiplayerEnabler()
                    }

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

/* FUNÇÕES RELATIVAS AO FORM DE REGISTER */ 

function openRegister() {
    let registerBox = document.getElementById("registerBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("disable")
    registerBox.style.display = "block"
    setTimeout(function() {
        registerBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}

function closeRegister() {
    let registerBox = document.getElementById("registerBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")


    registerBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        registerBox.style.display = "none";
        
    },200)
}

function registerHandler() {
    formularioRegister = document.forms["registerForm"]

    let validAccount = formularioRegister.reportValidity()

    let used = usedCredentialChecker(formularioRegister.elements[REGISTER_USERNAME].value, 
                          formularioRegister.elements[REGISTER_EMAIL].value)

    if (validAccount && !used) {
        let newAccount = new Account(formularioRegister.elements[REGISTER_USERNAME].value,
                           formularioRegister.elements[REGISTER_PASSWORD].value,
                           formularioRegister.elements[REGISTER_EMAIL].value,
                           formularioRegister.elements[REGISTER_GENDER].value,
                           formularioRegister.elements[REGISTER_AGE_GROUP].value,
                           new playerStats, new aesthetics)
                           
    formularioRegister.reset()
    closeRegister()
    
    accountArray.push(newAccount)

    updateAccounts()
    }
}

/* FUNÇÕES RELATIVAS AO LOGOUT */ 

function openLogout() {
    
    updateStats()

    clickToggler("disable")

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
    clickToggler("enable")


    logoutBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        logoutBox.style.display = "none";
        
    },200)
}

function logoutHandler() {
    updateStats()
    currentAccount = null
    updateAccounts()
	closeLogout()
    //reloads page
    location = location
    menuElementToggle()
    showStats()

}

function deleteAccount() {

    let deleteButton = document.getElementById("deleteAccountButton") 

    if (deleteAccountTimeoutID) {
        deleteButton.innerHTML = "ACCOUNT DELETED"
        for (let i = 0; i < accountArray.length; i++) {
            if (accountArray[i].username == currentAccount.username) {
                accountArray.splice(i, 1)
                currentAccount = null
                updateAccounts()
                location = location
            }
        }
    }

    

    deleteButton.innerHTML = "ARE YOU 100% SURE?"

    deleteAccountTimeoutID = setTimeout(function() {
        deleteButton.innerHTML = "DELETE ACCOUNT"
        deleteAccountTimeoutID = null
    },4000)

}

/* FUNÇÕES RELATIVAS AO BOTÃO DE SETTINGS */

function openSettings() {
    settingsFiller()
    clickToggler("disable")
    let settingsBox = document.getElementById("settingsBox")
    let dimmer = document.getElementById("dimmer")
    settingsBox.style.display = "block"
    setTimeout(function() {
        settingsBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)

  }
  
function closeSettings() {
    let settingsBox = document.getElementById("settingsBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")


    settingsBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        settingsBox.style.display = "none";
        
    },200)
}


/* FUNÇÕES RELATIVAS AO BOTÃO DE STATS */



function openStats(){
	let statsBox = document.getElementById("statsBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("disable")
	statsBoxUpdater()
    statsBox.style.display = "block"
	
	
    setTimeout(function() {
        statsBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)	
	
}


function closeStats(){
	let statsBox = document.getElementById("statsBox")
    let dimmer = document.getElementById("dimmer")
    clickToggler("enable")


    statsBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        statsBox.style.display = "none";
        
    },200)	
	
	
}


function usernameSettingsAccess(){
	closeStats()
	openSettings()
	
}


function toggleHamburgerMenu(){
    
    let hamburgerMenu = document.getElementsByClassName("hamburgerMenuDiv")[0]
    let hamburgerMenuButton = document.getElementById("hamburgerButton")
    
    if (!(hamburgerState)) {
        
        hamburgerMenu.style.visibility = "hidden"
        hamburgerMenu.style.display = "block"

        hamburgerMenuButton.style.transform = "rotate(-90deg)";

        hamburgerState = true
        
        setTimeout(function() {
            
            
            hamburgerMenu.style.visibility = "visible"
            hamburgerMenu.style.maxHeight = "40%"
        },200)
    }

    else if (hamburgerState) {
        hamburgerMenu.style.maxHeight = "0%"

        hamburgerState = false

        setTimeout(function() {
            
            hamburgerMenuButton.style.transform = "rotate(0deg)";
            hamburgerMenu.style.display = "none"
        },500)
    }
}







/* FUNÇÕES RESPONSAVEL PELO UPDATE DA CAIXA DE STATS*/

function statsBoxUpdater(){		
	let statsCardsFlipped = currentAccount.stats.cardsFlipped
	let statsMatchesFound = currentAccount.stats.matchesFoundEver
    let statsFinalGrade = Math.round((statsMatchesFound / (statsCardsFlipped/2)) * 100)
	
    if (isNaN(statsFinalGrade)) {
        statsFinalGrade = 0
    }
    
    let lowestTime = ""

    if (currentAccount.stats.lowestTime == null) {
        lowestTime = "Never played"
    } else {
        lowestTime = currentAccount.stats.lowestTime
    }
    
	
    
    // Miguel, quando puderes adiciona um novo parâmetro.
    // Existe uma coisa nova chamada currentAccount.stats.lowestTime
    // que mostra o tempo mais baixo que o jogador alguma vez fez!
    // Se tiveres problemas apaga a tua localstorage e tenta denovo :) good luck!



	document.getElementsByClassName("usernameStats")[0].innerHTML = currentAccount.username;
	document.getElementsByClassName("numberOfCards")[0].innerHTML = currentAccount.stats.cardsFlipped;
	document.getElementsByClassName("numberOfGamesPlayed")[0].innerHTML = currentAccount.stats.gamesCompleted;
	document.getElementsByClassName("numberOfCorrectPairs")[0].innerHTML = currentAccount.stats.matchesFoundEver;
	document.getElementsByClassName("timePlayed")[0].innerHTML = currentAccount.stats.timeSpentPlaying
    document.getElementsByClassName("accountCurrency")[0].innerHTML = currentAccount.stats.zPoints
	document.getElementsByClassName("lowestTime")[0].innerHTML = lowestTime
    document.getElementsByClassName("accuracySpan")[0].innerHTML = statsFinalGrade + "%";
    
    gradeStatCheck(statsFinalGrade)
}



function gradeStatCheck(accuracyLevel){
    
    // Em vez de redefinires, passa a percentagem como argumento através da outra função!! :)
		
	if (accuracyLevel < 10){
		document.getElementsByClassName("statsGradeAnalyser")[0].innerHTML = "Get you some memofante!";
	}	else if (accuracyLevel < 30){
		document.getElementsByClassName("statsGradeAnalyser")[0].innerHTML = "Average memory!";
	}	else if (accuracyLevel <60){
		document.getElementsByClassName("statsGradeAnalyser")[0].innerHTML = "good memory!";
	}	else if (accuracyLevel <=80){
		document.getElementsByClassName("statsGradeAnalyser")[0].innerHTML = "Photographic memory?";
	}	else if (accuracyLevel > 80) {
		document.getElementsByClassName("statsGradeAnalyser")[0].innerHTML = "You hacker!";
	}
	
}

/* FUNÇÕES QUE MOSTRAM MENSAGENS DE ERRO */

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

function usedCredentialChecker(username, email) {
    for(let i=0;i<accountArray.length; i++) {
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

// Settings

function settingsFiller() {

    formularioSettings = document.forms["aestheticsForm"]


    if (currentAccount) {
        let boughtIconPacks = currentAccount.aesthetics.boughtIconPacks
        let boughtCardBacks = currentAccount.aesthetics.boughtCardBacks
        let boughtAvatars = currentAccount.aesthetics.boughtAvatars

        let selectListPacks = document.getElementById("choosePack")
        let selectListBacks = document.getElementById("chooseBack")
        let selectListAvatars = document.getElementById("chooseAvatar")

        // Primeiro remover entradas pre-existentes para alem da Default, para evitar 

        for (let i = 0; i<boughtIconPacks.length; i++) {
            let newOption = document.createElement("option")
            let prettyOptionText = settingsNameProcessor(boughtIconPacks[i])

            newOption.appendChild(document.createTextNode(prettyOptionText))

            newOption.value = boughtIconPacks[i]

            // Não se adiciona essa opção se ela já existir, para evitar entradas duplicadas na mesma sessão de jogo

            let optionExists = document.querySelectorAll(`[value="${newOption.value}"]`).length > 0

            if (!(optionExists)) {
                selectListPacks.appendChild(newOption)
            }
        }

        for (let i = 0; i<boughtCardBacks.length; i++) {
            let newOption = document.createElement("option")
            let prettyOptionText = settingsNameProcessor(boughtCardBacks[i])

            newOption.appendChild(document.createTextNode(prettyOptionText))

            newOption.value = boughtCardBacks[i]

            let optionExists = document.querySelectorAll(`[value="${newOption.value}"]`).length > 0

            if (!(optionExists)) {
                selectListBacks.appendChild(newOption)
            }
        }

        for (let i = 0; i<boughtAvatars.length; i++) {
            let newOption = document.createElement("option")
            let prettyOptionText = settingsNameProcessor(boughtAvatars[i])

            newOption.appendChild(document.createTextNode(prettyOptionText))

            newOption.value = boughtAvatars[i]

            let optionExists = document.querySelectorAll(`[value="${newOption.value}"]`).length > 0

            if (!(optionExists)) {
                selectListAvatars.appendChild(newOption)
            }
        }


        // Selecionar os settings da conta

        for (let i = 0; i<formularioSettings.choosePack.length; i++) {
            if (formularioSettings.choosePack[i].value == currentAccount.aesthetics.iconPack) {
                formularioSettings.choosePack[i].selected = true
            }
        }

        for (let i = 0; i<formularioSettings.chooseBack.length; i++) {
            if (formularioSettings.chooseBack[i].value == currentAccount.aesthetics.cardBack) {
                formularioSettings.chooseBack[i].selected = true
            }
        }

        for (let i = 0; i<formularioSettings.chooseAvatar.length; i++) {
            if (formularioSettings.chooseAvatar[i].value == currentAccount.aesthetics.avatar) {
                formularioSettings.chooseAvatar[i].selected = true
            }
        }
    }
    
}

function settingsNameProcessor(name) {
    // retirar "packs.","backs." e "avatars." do nome
    let cleanName = name.replace("packs.","").replace("backs.","").replace("avatars.","")

    // tornar a primeira letra maiuscula
    let capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)

    // Adicionar espaços antes de letras maiusculas como, por exemplo, no pack "theWay"->"The Way"
    capitalizedName = capitalizedName.replace(/([A-Z])/g, ' $1').trim()

    return capitalizedName
}

function settingsHandler() {
    formularioSettings = document.forms.aestheticsForm
    currentAccount.aesthetics.iconPack = formularioSettings.choosePack.value
    currentAccount.aesthetics.cardBack = formularioSettings.chooseBack.value
    currentAccount.aesthetics.avatar = formularioSettings.chooseAvatar.value
    showSettingsAppliedMessage()

    if (location.href.includes("game.html")) {
        imageSetter()
    }
    
    updateStats()


}

function showSettingsAppliedMessage() {

    if (appliedTimeoutID) {
        clearTimeout(appliedTimeoutID)
    }

    let applyButton = document.getElementById("applySettingsButton") 

    applyButton.innerHTML = "SETTINGS APPLIED"

    appliedTimeoutID = setTimeout(function() {
    applyButton.innerHTML = "Apply Settings"
        
    },1500)
}

function clickToggler(scope) {

    let pointerEventsValue = null

    if (scope =="disable") {
        pointerEventsValue = "none"
    }

    if (scope =="enable") {
        pointerEventsValue = "auto"
    }

    
    document.getElementsByClassName("registerButton")[0].style.pointerEvents = pointerEventsValue
    document.getElementsByClassName("loginButton")[0].style.pointerEvents = pointerEventsValue
    document.getElementsByClassName("logoutButton")[0].style.pointerEvents = pointerEventsValue
    document.getElementsByClassName("settingsButton")[0].style.pointerEvents = pointerEventsValue
    

    document.getElementById("hamburgerButton").style.pointerEvents = pointerEventsValue



    if (location.href.includes("game.html")) {
        document.getElementsByClassName("statsButton")[0].style.pointerEvents = pointerEventsValue
        document.getElementsByClassName("leaderboardButton")[0].style.pointerEvents = pointerEventsValue
        document.getElementsByClassName("multiPlayerButton")[0].style.pointerEvents = pointerEventsValue
        document.getElementsByClassName("singlePlayerButton")[0].style.pointerEvents = pointerEventsValue
    }

    if (location.href.includes("Loja.html")) {
        let listOfButtons = document.querySelectorAll(".buyButton")

        for (let i = 0; i<listOfButtons.length; i++){
            listOfButtons[i].style.pointerEvents = pointerEventsValue
        }
    }

}

