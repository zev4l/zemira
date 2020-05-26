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


/* CONSTRUTOR DE CONTAS */

function Account(username, password, email, gender, ageGroup, stats, aesthetics) {

    this.username = username,
    this.password = password,
    this.email = email,
    this.gender = gender,
    this.ageGroup = ageGroup,
    this.stats = stats,
    this.aesthetics = aesthetics
}

function playerStats() {
    this.zPoints = 0,
    this.gamesCompleted = 0,
    this.cardsFlipped = 0,
    this.matchesFoundEver = 0,
    this.timeSpentPlaying = 0
}

function aesthetics() {
    this.cardBack = "defaultBack",
    this.avatar = "defaultAvatar",
    this.iconPack = "defaultPack",
    this.boughtCardBacks = [],
    this.boughtAvatars = [],
    this.boughtIconPacks = []
}

// ************************************+

window.onload = inicial

function inicial() {

    menuElementToggle()

	
}

function menuElementToggle() {

    if (currentAccount) {
        document.getElementsByClassName("registerButton")[0].style.display = "none"
        document.getElementsByClassName("loginButton")[0].style.display = "none"
        document.getElementsByClassName("logoutButton")[0].style.display = "inline-block"
        document.getElementsByClassName("settingsButton")[0].style.display = "inline-block"
		document.getElementsByClassName("statsButton")[0].style.display = "inline-block"
    }
    if (!(currentAccount)) {
        document.getElementsByClassName("registerButton")[0].style.display = "inline-block"
        document.getElementsByClassName("loginButton")[0].style.display = "inline-block"
        document.getElementsByClassName("logoutButton")[0].style.display = "none"
        document.getElementsByClassName("settingsButton")[0].style.display = "none"
		document.getElementsByClassName("statsButton")[0].style.display = "none"
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

    /* Atualização dos stats é feita aqui pois, se for feita quando o utilizador
    carrega no botão de logout, dá-se um bug estranho em que os dados não são guardados */
    
    updateStats()

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

/* FUNÇÕES RELATIVAS AO BOTÃO DE SETTINGS */

function openSettings() {
    settingsFiller()
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


    statsBox.style.opacity= "0";
    dimmer.style.opacity = "0"

    setTimeout(function() {
        statsBox.style.display = "none";
        
    },200)
	
	
}


/* FUNÇÂO RESPONSAVEL PELO UPDATE DOS STATS*/

function statsBoxUpdater(){
	
		
		
	document.getElementsByClassName("usernameStats")[0].innerHTML = currentAccount.username;
	document.getElementsByClassName("numberOfCards")[0].innerHTML = currentAccount.stats.cardsFlipped;
	document.getElementsByClassName("numberOfGamesPlayed")[0].innerHTML = currentAccount.stats.gamesCompleted;
	document.getElementsByClassName("numberOfCorrectPairs")[0].innerHTML = currentAccount.stats.matchesFoundEver;
	document.getElementsByClassName("timePlayed")[0].innerHTML = currentAccount.stats.timeSpentPlaying;
	
	
		
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

            // Não se adiciona essa opção se ela já existir, para evitar duplicados

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
    },4000)

}