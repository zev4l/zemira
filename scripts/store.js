// Impede alguns erros fáceis de cometer.
"use strict";

$(document).ready(inicial);

/* DEFINIÇÃO DE CONSTANTES E VARIÁVEIS GLOBAIS */
let contentList = ["packs.desert", "packs.lego", "packs.pokemon", "packs.socialMedia", "packs.sustainableEnergy", "packs.epidemic", "packs.food", "packs.radioactive", "backs.space", "backs.superMario", "backs.halloween", "backs.illusion", "avatars.doge", "avatars.starWars", "avatars.dinossaur", "avatars.theWay", "avatars.snakeMGS", "avatars.theCardMaster", "avatars.nerdLady", "avatars.theSpeedrunner" ];



// ************************************

function inicial() {

	settingsFiller()
	showStats()
	
}

function showStats() {
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

