const mysql = require('mysql');

class DataController{
    constructor(){
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        this.connection.connect(function(err){
            if(err) throw err;
            console.log("Connected to database!");
        });

    }

    getHighscore(sock, gridSize, cbfunc){ 

        let highscoreList = new Array();

        this.connection.query('SELECT * FROM highscore' + gridSize + ' ORDER BY points DESC', (err,rows) => { 
            if(err) throw err; 
            //console.log('Data received from Db: highscore'+ gridSize); 
            //console.log(rows);
            //console.log(rows[1].name);

            rows.forEach( (row) => { 
                highscoreList.push({name: row.name, points: row.points});
                //console.log(`${row.name} hat ${row.points}`);
            });
            //console.log(highscoreList.length);
            //console.log(highscoreList[0]);
            cbfunc(sock, JSON.stringify({gridsize: gridSize, list: highscoreList}));
        });
        //console.log(highscoreList.length);
        //return "highscoreList";
    }

    getHighscoreList(gridSize, cbfunc){ 

        let highscoreList = new Array();

        this.connection.query('SELECT * FROM highscore' + gridSize + ' ORDER BY points DESC', (err,rows) => { 
            if(err) throw err; 
            //console.log('Data received from Db: highscore' + gridSize); 
            //console.log(rows);
            //console.log(rows[1].name);

            rows.forEach( (row) => { 
                highscoreList.push({name: row.name, points: row.points});
                //console.log(`${row.name} hat ${row.points}`);
            });
            //console.log(highscoreList.length);
            //console.log(highscoreList[0]);
            cbfunc(JSON.stringify({gridsize: gridSize, list: highscoreList}));
        });
        //console.log(highscoreList.length);
        //return "highscoreList";
    }

    addHighscoreObject(data, cbfunc){
        let highscoreObject = JSON.parse(data);
        //console.log(highscoreObject);

        let sql = "INSERT INTO highscore" + highscoreObject.gridSize + " (name, points) VALUES ('" + highscoreObject.name + "', " + highscoreObject.points + ")";
        this.connection.query(sql, function(err, result){
            if(err) throw err;
            //console.log("1 highscore added");
        });

        this.getHighscoreList(highscoreObject.gridSize,cbfunc);
    }

    

}


module.exports = DataController;