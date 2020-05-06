/* CONSTANTES */


/* ESTADO DO JOGO */ 

let estado = {
    login: null,
    matches: null,
    timeSpent: null,
    currentCards: [],
}

let config = {
    backImageSource: "imagens/testPatternCard.PNG",
    cardPacks: []
}

/* Other Functions */

function imageSetter() {
    
    //Defining back image

    for (i=1; i<20; i++){
        document.getElementsByClassName("card")[i].getElementsByTagName("img")[0].src = config.backImageSource

    
}
}

function cardSourceChecker(n) {
    return document.getElementsByClassName("card")[n].getElementsByTagName("img")[0].src
}


/* FUNÇÕES DE CONTROLO DE APRESENTAÇÃO DO JOGO/BOTÕES */

function singlePlayerButton() {
    document.getElementsByClassName("gameContent")[0].style.display = "block"
    document.getElementsByClassName("singlePlayer")[0].style.display = "none"
    document.getElementsByClassName("multiPlayer")[0].style.display = "none"
}

function showCard(n) {
    cardStyle = document.getElementsByClassName("card")[n].style
    cardStyle.transform = "rotateY(0deg)"
    
    if (estado.currentCards.length < 2) {
        estado.currentCards.push(n)
    }
    if ((estado.currentCards.length) == 2) {
        if (cardSourceChecker(estado.currentCards[0]) == cardSourceChecker(estado.currentCards[1])){

            estado.matches += 1
            estado.currentCards = []
            
        } else if (!(cardSourceChecker(estado.currentCards[0]) == cardSourceChecker(estado.currentCards[1]))) {

            /* É necessário definir estes backups dos identificadores das cartas, pois caso contrário,
            estado.currentCards estaria vazio pela altura em que setTimeout executásse o código interno */
            
            let tmpCardNum0 = estado.currentCards[0]
            let tmpCardNum1 = estado.currentCards[1]

            setTimeout(function() {
                hideCard(tmpCardNum0)
                hideCard(tmpCardNum1)
            }, 1500)

            estado.currentCards = []

            
        }


    }

function hideCard(n) {
    cardStyle = document.getElementsByClassName("card")[n].style
    cardStyle.transform = "rotateY(180deg)"
}

}


/* Uso do algoritmo Fisher-Yates-Durstenfelt para organizar uma lista de forma aleatoria */

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

