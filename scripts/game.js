/* ESTADO DO JOGO */ 

let estado = {
    login: null,
    matches: null,
    timeSpent: null,
    currentCards: null,
}

/* FUNÇÕES DE CONTROLO DE APRESENTAÇÃO DO JOGO/BOTÕES */

function singlePlayerButton() {
    document.getElementsByClassName("gameContent")[0].style.display = "block"
    document.getElementsByClassName("singlePlayer")[0].style.display = "none"
    document.getElementsByClassName("multiPlayer")[0].style.display = "none"
}

function tableTester() {
    cardTable = document.getElementsByClassName("cardTable")[0]
    cards = cardTable.querySelectorAll("th")
    

}

function showCard(n) {
    cardStyle = document.getElementsByClassName("card")[n].style
    cardStyle.transform = "rotateY(0deg)"

    
    // if (cardStyle.transform == "rotateY(180deg)" || cardStyle.transform == "") {
    //     cardStyle.transform = "rotateY(0deg)"
    // }
    // else if (cardStyle.transform == "rotateY(0deg)") {
    //     cardStyle.transform = "rotateY(180deg)"
    // }




    

}