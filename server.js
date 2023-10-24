'use strict'

//Einbinden der benötigten Bibliotheken
const https = require('https');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const path = require('path');


//eigene Klassen einbinden
const DataController = require('./datacontroller');

//Array  in dem alle Spieler abgelegt sind
let lobby = [];

//Server generieren
let app = express();

//Client-App an anfragenden Client ausliefern
app.use(express.static(__dirname + '/client'));

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'RSA-cert.pem')),
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'RSA-privkey.pem'))
};

let server = https.createServer(httpsOptions, app).listen(8080, function(){
    showReady();
});

let io = socketio(server);

//Auf Verbindungen von Clients reagieren
io.on('connection', connected);


//Datacontroller
let datacontroller;

function showReady() {
    console.log('Server connected!');
    //Datacontroller initialisieren
    datacontroller = new DataController();

}

//Highscore aus datenback lesen und an aufrufer senden
let singleHighscore = (function(sock, data){
    sock.emit('highscore', data);
});

//Highscore aus datenback lesen und an alle senden mit richtigem gridsize
let newHighscoreList = (function(data){
    io.emit('highscore', data);
});

function connected(sock) {
    //Event-Handler für erstmaliges senden der HighscoreListe
    sock.on('highscoreListe', (data) => datacontroller.getHighscore(sock, data, singleHighscore));

    //Event-Handler für das hinzufügen eines Highscore eintrags
    sock.on('addhighscore', (data) => datacontroller.addHighscoreObject(data, newHighscoreList));
}


//Fehlerbehandlung
server.on('error', serverError);

function serverError(err) {
    console.error('Server error: ', err);
}




