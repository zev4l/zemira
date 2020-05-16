// Impede alguns erros fáceis de cometer.
"use strict";

$(document).ready(displayStuff);

let currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || null;
let accountArray = JSON.parse(localStorage.getItem("accountArray")) || [];
let contentList = ["packs.desert", "packs.lego", "packs.pokemon", "packs.socialMedia", "packs.energy", "packs.epidemic", "packs.food", "packs.radioactive", "backs.space", "backs.superMario", "backs.halloween", "backs.illusion", "avatars.doge", "avatars.starWars", "avatars.dinossaur", "avatars.theWay", "avatars.snakeMGS", "avatars.theCardMaster", "avatars.nerdLady", "avatars.theSpeedrunner" ];


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


function displayStuff() {
	let currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || null;
	if (currentAccount){
		document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[1].innerHTML = currentAccount.stats.zPoints + "$Z";
		
		for (let i = 0; i<currentAccount.aesthetics.boughtIconPacks; i++) {
			let item = contentList.indexOf(currentAccount.aesthetics.boughtIconPacks[i]);
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
}


function closeSlideShow(){
	document.getElementsByClassName("slideShowHolder")[0].style.display="none";
}


function buyItem (number) {

	let itemBought = contentList[number];

	if (currentAccount.stats.zPoints >= 1) {
		currentAccount.stats.zPoints -= 1;

		if (itemBought.includes("packs")) {
			currentAccount.aesthetics.boughtIconPacks.push(itemBought);
			updateStats();
		}
	
		if (itemBought.includes("backs")) {
			currentAccount.aesthetics.boughtCardBacks.push(itemBought);
			updateStats();
		}
	
		if (itemBought.includes("avatars")) {
			currentAccount.aesthetics.boughtAvatars.push(itemBought);
			updateStats();
		}

		updateStats();

		document.getElementsByClassName("buyButton")[number].disabled = true;
		document.getElementsByClassName("buyButton")[number].innerHTML = "Item Bought!";
		displayStuff();
	} else {
		alert("Não tens pontos suficientes!");
	}



	currentAccount.stats.zPoints /* alterar zPoints */
	updateStats()

	if (currentAccount){
		/* document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[1].innerHTML = currentAccount.stats.zPoints + "$Z"; */
	} else {
		/* document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[1].innerHTML = "Unknown! Please Log In!" */
	}





}
