'use strict'

//Automatisches größen anpassen bei browsergrößen änderung
$(window).resize(sizeContent);

//Feldgröße dynamisch an seitengröße anpassen
function sizeContent() {
    let sw3 = $('.square3').width();
    $('.square3').css({'height':sw3+'px'});

    let sw4 = $('.square4').width();
    $('.square4').css({'height':sw4+'px'});

    let sw5 = $('.square5').width();
    $('.square5').css({'height':sw5+'px'});

    let sw6 = $('.square6').width();
    $('.square6').css({'height':sw6+'px'});

    let pw = $('#playground').width();
    $('#playground').css({'height':pw+'px'});
}

//mal-container objekte für leichteres benutzen
const modalContainerAbout = document.getElementById('modal-container-About');
const modalContainerGame = document.getElementById('modal-container-Game');

//Button funktionen
$("#modalCloseAbout").on("click",function(e){
    modalContainerAbout.classList.remove("show");
    keyInput = true;
});
$("#modalCloseGame").on("click",function(e){
    modalContainerGame.classList.remove("show");
    keyInput = true;
});

$("#btnAbout").on("click",function(e){
    modalContainerAbout.classList.add("show");
    keyInput = false;
});

$("#btnNewGame").on("click",function(e){
    newGame();
});

$("#btnSave").on("click",function(e){
    let save = {name: playerName, gridsize: gridSize, grid: grid};
    let saveString = JSON.stringify(save);
    //console.log(saveString);
    window.localStorage.setItem('2048save', saveString);
});

$("#btnVideo").on("click",function(e){
    var stylesheet = document.getElementById("styleColor");
    var activStyle = $('head').find('link:first').attr('href');
    let url = "";
    switch(activStyle){
        case "css/dark.css":
            url = "css/light.css";
            document.getElementById('btnVideo').innerText = "dark-mode";
            break;
        case "css/light.css":
            url = "css/dark.css";
            document.getElementById('btnVideo').innerText = "light-mode";
            break;
    }
    stylesheet.setAttribute('href', url);
});

$("#btnSize").on("click",function(e){
    switch(gridSize){
        case 6:
            gridSize = 3;
            break;
        case 3:
            gridSize = 4;
            break;
        case 4:
            gridSize = 5;
            break;
        case 5:
            gridSize = 6;
            break;
    }
    sock.emit('newgridsize', gridSize);
    sock.emit('highscoreListe', gridSize);
    localStorage.clear();
    document.getElementById('btnSize').innerText = gridSize + "x" + gridSize;
    document.getElementById('leaderboardInfo').innerText = gridSize + "x" + gridSize + " Grid";
    newGame();
});


//Player-Objekte instanziieren und initialisieren
let sock = io();
let keyInput = false;
let gridSize = 4;
let grid = [];
let playerName = "";


//Automatisches Spielstand laden falls vorhanden
let saveString = window.localStorage.getItem('2048save');
if(saveString){
    let save = JSON.parse(saveString);
    playerName = save.name;
    gridSize = save.gridsize;
    grid = save.grid;
    document.getElementById('nameTag').innerText = playerName;
    document.getElementById('btnSize').innerText = gridSize + "x" + gridSize;
    document.getElementById('leaderboardInfo').innerText = gridSize + "x" + gridSize + " Grid";
    startGame();
    printGrid();
    sizeContent();
    keyInput = true;
}else{
    newPlayer();
    newGame();
}


//Anfordern der Highscoreliste für aktuelle grid größe
sock.emit('highscoreListe', gridSize);


//Neuen Spieler anlegen
function newPlayer(){
    playerName = prompt("Bitte gebe deinen Spielernamen an.");
    if(!playerName){
        window.alert("Bitte einen Namen eingeben!");
        newPlayer();
        return 0;
    }
    //console.log(playerName.length);
    if(playerName.length > 15){
        window.alert("Bitte einen kürzeren Namen eingeben!"+"\n"+"(max. 15 zeichen)");
        newPlayer();
        return 0;
    }
    document.getElementById('nameTag').innerText = playerName;
    modalContainerGame.classList.add("show");
}


//Empfangen der Highscore-Liste und übergeben an Ausgabefunktion
sock.on('highscore', showHighscore);


//Anzeigen der Highscore-Liste
function showHighscore(data){
    let highscoreObj = JSON.parse(data);
    if(highscoreObj.gridsize == gridSize){
        let list = document.getElementById('leaderboardList');
        list.innerHTML = "";
        for(let i = 0; i < highscoreObj.list.length; i++){
            let el = document.createElement('li');
            el.setAttribute('class', 'pos' + i);
            el.innerHTML = i+1 + ". " + highscoreObj.list[i].name + " - " + highscoreObj.list[i].points;
            list.appendChild(el);
        }
    }
}


//Tastatureingabe
var keyElement = document.querySelector('body'),text = '';
keyElement.addEventListener("keydown", keyPress );
  
function keyPress (evt) {
    if(keyInput){
        let key = evt.keyCode;
        switch(key){
            case 37:
                for(let i = 1; i < gridSize;i++){
                    left();
                }
                break;
            case 38:
                for(let i = 1; i < gridSize;i++){
                    up();
                }
                break;
            case 39:
                for(let i = 1; i < gridSize;i++){
                    right();
                }
                break;
            case 40:
                for(let i = 1; i < gridSize;i++){
                    down();
                }
                break;
            default:
                return 0;
        }
        turnEnd();
    }
}


function startGame(){
    //Spielfeld Generieren
    let playground = document.getElementById('playground');
    playground.innerHTML = "";
    for(let i = 0; i < gridSize * gridSize; i++){
        let el = document.createElement('div');
        el.setAttribute('id', 'grid' + i);
        el.setAttribute('class', 'square square' + gridSize + ' zahl0');
        playground.appendChild(el);
    }
}

function newGame(){
    //Spielvariablen Generieren
    grid = [];
    for(let i = 0; i < gridSize; i++){
        let row = [];
        for(let j = 0; j < gridSize; j++){
            row.push(0);
        }
        grid.push(row);
    }

    //erste zufällige zahl
    let x = Math.floor(Math.random() * gridSize);
    let y = Math.floor(Math.random() * gridSize);
    grid[y][x] = 2;
    startGame();
    printGrid();
    sizeContent();
}

//Spielzüge 
function left(){
    for(let j = 0; j < gridSize; j++){
        for(let i = 0; i < gridSize - 1; i++){
            if(grid[j][i] == 0){
                //nach links verschieben
                if(grid[j][i+1] != 0){
                    grid[j][i] = grid[j][i+1];
                    grid[j][i+1] = 0;
                }
            }else{
                //nach links zusammenrechnen
                if(grid[j][i] == grid[j][i+1]){
                    grid[j][i] = grid[j][i] * 2;
                    grid[j][i+1] = 0;
                }
            }
        }
    }
}

function up(){
    for(let i = 0; i < gridSize; i++){
        for(let j = 0; j < gridSize - 1; j++){
            if(grid[j][i] == 0){
                //nach oben verschieben
                if(grid[j+1][i]){
                    grid[j][i] = grid[j+1][i];
                    grid[j+1][i] = 0;
                }
            }else{
                //nach oben zusammenrechnen
                if(grid[j][i] == grid[j+1][i]){
                    grid[j][i] = grid[j][i] * 2;
                    grid[j+1][i] = 0;
                }

            }
        }
    }
}

function right(){
    for(let j = 0; j < gridSize; j++){
        for(let i = gridSize - 1; i > 0; i--){
            if(grid[j][i] == 0){
                //nach rechts verschieben
                if(grid[j][i-1] != 0){
                    grid[j][i] = grid[j][i-1];
                    grid[j][i-1] = 0;
                }
            }else{
                //nach rechts zusammenrechnen
                if(grid[j][i] == grid[j][i-1]){
                    grid[j][i] = grid[j][i] * 2;
                    grid[j][i-1] = 0;
                }
            }
        }
    }
}

function down(){
    for(let i = 0; i < gridSize; i++){
        for(let j = gridSize - 1; j > 0; j--){
            if(grid[j][i] == 0){
                //nach unten verschieben
                if(grid[j-1][i]){
                    grid[j][i] = grid[j-1][i];
                    grid[j-1][i] = 0;
                }
            }else{
                //nach unten zusammenrechnen
                if(grid[j][i] == grid[j-1][i]){
                    grid[j][i] = grid[j][i] * 2;
                    grid[j-1][i] = 0;
                }

            }
        }
    }
}

function turnEnd(){
    newNumber();
    printGrid();
}


//Neue Zahl in zufälligen leeren Feld
function newNumber(){
    let newNumber = [];
    for(let j = 0; j < gridSize; j++){
        for(let i = 0; i < gridSize; i++){
            if(grid[j][i] == 0){
                newNumber.push([j,i]);
            }
        }
    }
    if(newNumber.length == 0){
        console.log("ENDE");
        gameOver();
        return 0;
    }
    let newPos = Math.floor(Math.random() * newNumber.length);
    grid[newNumber[newPos][0]][newNumber[newPos][1]] = 2;
}


//Grid Grafik Aktualisieren
function printGrid(){
    let number = 0;
    for(let j = 0; j < gridSize; j++){
        for(let i = 0; i < gridSize; i++){
            let el = document.getElementById('grid' + number);
            el.setAttribute('class', 'square square' + gridSize + ' zahl'+grid[j][i]);
            el.innerText = grid[j][i];
            number ++;
        }
    }
}

//Spiel vorbei
function gameOver(){
    let points = 0;
    for(let j = 0; j < gridSize; j++){
        for(let i = 0; i < gridSize; i++){
            points += grid[j][i];
        }
    }
    console.log(points);

    let highscoreObject = {name: playerName, gridSize: gridSize, points: points}

    sock.emit('addhighscore', JSON.stringify(highscoreObject));

    window.alert("GAME OVER erreichte Punkte: " + points);
    localStorage.clear();
    newGame();
}