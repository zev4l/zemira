// Impede alguns erros fáceis de cometer.
"use strict";

$(document).ready(inicial);

/* DEFINIÇÃO DE CONSTANTES E VARIÁVEIS GLOBAIS */

let currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || null;

let accountArray = JSON.parse(localStorage.getItem("accountArray")) || [];

let contentList = ["packs.desert", "packs.lego", "packs.pokemon", "packs.socialMedia", "packs.energy", "packs.epidemic", "packs.food", "packs.radioactive", "backs.space", "backs.superMario", "backs.halloween", "backs.illusion", "avatars.doge", "avatars.starWars", "avatars.dinossaur", "avatars.theWay", "avatars.snakeMGS", "avatars.theCardMaster", "avatars.nerdLady", "avatars.theSpeedrunner" ];



// ************************************+

function updateStats() {
    for (let i=0; i<accountArray.length; i++){ 
        if (accountArray[i].username == currentAccount.username) {

			accountArray[i].aesthetics.boughtIconPacks == currentAccount.aesthetics.boughtIconPacks
			accountArray[i].aesthetics.boughtCardBacks == currentAccount.aesthetics.boughtCardBacks
			accountArray[i].aesthetics.boughtAvatars == currentAccount.aesthetics.boughtAvatars

            accountArray[i].stats.zPoints == currentAccount.stats.zPoints
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

	settingsFiller()
	showStats()
	
}

function showStats() { //displayStuff, o nome teve que ser mudado por questões de compatibilidade com os outros ficheiros
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
	showStats();
}

function showBuyErrorMessage(number) {

    clearTimeout(errorTimeoutID
        )
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

