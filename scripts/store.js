// Impede alguns erros fáceis de cometer.
"use strict";

$(document).ready(displayPoints);

function displayPoints() {
	/*document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[0].innerHTML = localStorage.getItem();*/
	let currentAccount = JSON.parse(localStorage.getItem("currentAccount")) || null;
	if (currentAccount){
		document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[1].innerHTML = currentAccount.stats.zPoints + "$Z";
	} else {
		document.getElementsByClassName("ZPoints")[0].getElementsByTagName("span")[1].innerHTML = "Unknown! Please Log In!"
	}
}



function displayAllIcons(){
	document.getElementsByClassName("slideShowHolder")[0].style.display="flex";
}


function closeSlideShow(){
	document.getElementsByClassName("slideShowHolder")[0].style.display="none";
}