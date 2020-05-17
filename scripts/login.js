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
	formularioRegister = document.forms["registerForm"]

    formularioLogin = document.forms["loginForm"]

    loginRegisterButtonToggle()

	
}

function loginRegisterButtonToggle() {

    if (currentAccount) {
        document.getElementsByClassName("registerButton")[0].style.display = "none"
        document.getElementsByClassName("loginButton")[0].style.display = "none"
        document.getElementsByClassName("logoutButton")[0].style.display = "inline-block"
        document.getElementsByClassName("settingsButton")[0].style.display = "inline-block"
    }
    if (!(currentAccount)) {
        document.getElementsByClassName("registerButton")[0].style.display = "inline-block"
        document.getElementsByClassName("loginButton")[0].style.display = "inline-block"
        document.getElementsByClassName("logoutButton")[0].style.display = "none"
        document.getElementsByClassName("settingsButton")[0].style.display = "none"
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
                           new playerStats, new aesthetics)
                           
    formularioRegister.reset()
    closeRegister()
    
    accountArray.push(newAccount)

    updateAccounts()
    }
}

/* FUNÇÕES RELATIVAS AO LOGOUT */ 

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

function logoutHandler() {
    currentAccount = null
    loginRegisterButtonToggle()
    updateAccounts()
	closeLogout()
	showStats()
}

/* FUNÇÕES RELATIVAS AO BOTÃO DE SETTINGS */

function openSettings() {
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