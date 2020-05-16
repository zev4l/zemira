// Impede alguns erros fáceis de cometer.
"use strict";

$(document).ready(inicial);

/* DEFINIÇÃO DE CONSTANTES E VARIÁVEIS GLOBAIS */

const REGISTER_EMAIL = "email"

const REGISTER_GENDER = "gender"

const REGISTER_AGE_GROUP = "age"

const REGISTER_USERNAME = "username"

const REGISTER_PASSWORD = "password"

const LOGIN_USERNAME = "username"

const LOGIN_PASSWORD = "password"

let currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || null;
let accountArray = JSON.parse(localStorage.getItem("accountArray")) || [];
let contentList = ["packs.desert", "packs.lego", "packs.pokemon", "packs.socialMedia", "packs.energy", "packs.epidemic", "packs.food", "packs.radioactive", "backs.space", "backs.superMario", "backs.halloween", "backs.illusion", "avatars.doge", "avatars.starWars", "avatars.dinossaur", "avatars.theWay", "avatars.snakeMGS", "avatars.theCardMaster", "avatars.nerdLady", "avatars.theSpeedrunner" ];

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
    this.cardBack = "default",
    this.avatar = "default",
    this.iconPack = "default"
    this.boughtCardBacks = [],
    this.boughtAvatars = [],
    this.boughtIconPacks = []
}

// ************************************+

function updateStats() {
    for (let i=0; i<accountArray.length; i++){ 
        if (accountArray[i].username == currentAccount.username) {

            accountArray[i].stats.zPoints == currentAccount.zPoints
            updateAccounts()
            break
        }

    }
}

function updateAccounts() {
    localStorage.setItem("accountArray", JSON.stringify(accountArray))
    localStorage.setItem("currentAccount", JSON.stringify(currentAccount))
}

function inicial() {
	formularioRegister = document.forms["registerForm"]

    formularioLogin = document.forms["loginForm"]

    loginRegisterButtonToggle()


	displayStuff()
	
}

function displayStuff() {
	if (currentAccount){
		document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[1].innerHTML = currentAccount.stats.zPoints + "$Z";

		for (let i=0; i<20; i++) {
			document.getElementsByClassName("buyButton")[i].disabled = false;
			document.getElementsByClassName("buyButton")[i].innerHTML = "Buy it!";
		}
		
		for (let i = 0; i<(currentAccount.aesthetics.boughtIconPacks).length; i++) {
			let item = contentList.indexOf(currentAccount.aesthetics.boughtIconPacks[i]);
			document.getElementsByClassName("buyButton")[item].disabled = true;
			document.getElementsByClassName("buyButton")[item].innerHTML = "Item bought!";
		}

		for (let i = 0; i<(currentAccount.aesthetics.boughtAvatars).length; i++) {
			let item = contentList.indexOf(currentAccount.aesthetics.boughtAvatars[i]);
			document.getElementsByClassName("buyButton")[item].disabled = true;
			document.getElementsByClassName("buyButton")[item].innerHTML = "Item bought!";
		}

		for (let i = 0; i<(currentAccount.aesthetics.boughtCardBacks).length; i++) {
			let item = contentList.indexOf(currentAccount.aesthetics.boughtCardBacks[i]);
			document.getElementsByClassName("buyButton")[item].disabled = true;
			document.getElementsByClassName("buyButton")[item].innerHTML = "Item bought!";
		}

	} else {
		document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[1].innerHTML = "Unknown, please Login!"
		for (let i=0; i<20; i++) {
			document.getElementsByClassName("buyButton")[i].disabled = true;
			document.getElementsByClassName("buyButton")[i].innerHTML = "Please Login!";
		}
	}
}

function displayAllIcons(){
	document.getElementsByClassName("slideShowHolder")[0].style.display="flex";
	
	let dimmer = document.getElementById("dimmer")

	setTimeout(function() {
        loginBox.style.opacity = "1"
        dimmer.style.opacity = "1"
    },100)
}


function closeSlideShow(){
	document.getElementsByClassName("slideShowHolder")[0].style.display="none";

	let dimmer = document.getElementById("dimmer")

    dimmer.style.opacity = "0"


}


function buyItem (number) {

	let itemBought = contentList[number];


	if ((itemBought.includes("packs")) && (currentAccount.stats.zPoints >= 5)) {
		currentAccount.aesthetics.boughtIconPacks.push(itemBought);
		currentAccount.stats.zPoints -= 5;
		updateStats();
		buttonDisabler(number)
	} else if ((itemBought.includes("packs")) && (currentAccount.stats.zPoints < 5)) {
		showBuyErrorMessage(number);
	}


	if ((itemBought.includes("backs")) && (currentAccount.stats.zPoints >= 2)) {
		currentAccount.aesthetics.boughtCardBacks.push(itemBought);
		currentAccount.stats.zPoints -= 2;
		updateStats();
		buttonDisabler(number)
	} else if ((itemBought.includes("backs")) && (currentAccount.stats.zPoints < 2)) {
		showBuyErrorMessage(number);
	}


	if ((itemBought.includes("avatars")) && (currentAccount.stats.zPoints >= 2)) {
		currentAccount.aesthetics.boughtAvatars.push(itemBought);
		currentAccount.stats.zPoints -= 2;
		updateStats();
		buttonDisabler(number)
	} else if ((itemBought.includes("avatars")) && (currentAccount.stats.zPoints < 2)) {
		showBuyErrorMessage(number);
	}

}

function buttonDisabler(number) {
	document.getElementsByClassName("buyButton")[number].disabled = true;
	document.getElementsByClassName("buyButton")[number].innerHTML = "Item Bought!";
	displayStuff();
}

function showBuyErrorMessage(number) {
	let buyButton = document.getElementsByClassName("buyButton")[number]

	buyButton.innerHTML = "NOT ENOUGH POINTS"
	buyButton.style.backgroundColor = "red"
	buyButton.style.fontSize = "70%"

    errorTimeoutID = setTimeout(function() {
        buyButton.innerHTML = "Buy it!"
		buyButton.style.backgroundColor = "rgb(218,165,32)"
		buyButton.style.fontSize = "initial"
        
    },3000)
}

// FUNÇÕES LOGIN/REGISTER/LOGOUT

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
					displayStuff()
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
	displayStuff()
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