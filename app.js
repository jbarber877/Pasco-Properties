/*
Rough draft of program - awaits a request from the webpage, querys the db, writes the results to an html file, then pipes the results back to the webpage.
To Do:
    - right now this only accepts one query - how to handle requests for different queries?
    - how to get input from the starting webpage and send it to the query?
    - the webpage design used here is very basic - I believe Michael has worked on some better looking pages?
*/





var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){
    console.log('request was made: '+ req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});

    // Code to connect to the oracle db    
        const { outFormat } = require('oracledb');
        const oracledb = require('oracledb');

        try {
        //oracledb.initOracleClient({libDir:'/oracle/instantclient_21_3'});
        //console.log("Successful");
        async function run(){
            let connection;
            try {
            connection = await oracledb.getConnection({
                user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
            });
            console.log("Connected to oracle database");

            // query goes here
            let result = await connection.execute('select * from dummy', []);
            //console.log(result);
         

        // Write everything to an html file

        // Sort the query data into strings 
        let yAxis = "";
        let xAxis = "";
        for (let i = 0; i < result.rows.length; i++) { 
            xAxis += (result.rows[i][0]);
            yAxis += ("'" + result.rows[i][1] + "'");

            if (i+1 < result.rows.length){
                xAxis += ",";
                yAxis += ",";
            }
        }

        var content = '<!DOCTYPE html> <html lang = "en"> <head> <meta charset = "UTF-8"> <meta name="viewport" content="width=device-width, initial-scale = 1.0">';
        content += '<meta http-equiv="X-UA-Compatible" content="ie=edge"> <script src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.6.0/chart.min.js"></script>';
        content += '<link rel = "stylesheet" href = "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">';
        content += '<title>Document</title> </head> <body> <div class = "container"> <canvas id = "myChart"></canvas> </div>';
        content += '<script> let myChart = document.getElementById(\'myChart\').getContext(\'2d\'); ';
        content += 'let massPopChart = new Chart(myChart,{type:\'bar\', data:{labels:[';
        content += yAxis;
        content += '], datasets:[{label:\'Population\', data:[';
        content += xAxis;
        content += ']}],backgroundColor:\'rgba(255,99,132,0.6)\'},options:{}});</script></body></html>';

        fs.writeFile('middle.html', content, err => {
        if (err) { 
            console.error(err)
            return
        }
        //file written successfully
        })

        // return to db connection code
    } catch (err){
        console.error(err);
        } finally {
        if (connection){
            try{
            await connection.close();
            } catch (err){
            console.error(err);
            }
        }}
    }

    run();

        } catch (err){
        console.error('Whoops!');
        console.error(err);
        process.exit(1);
        }
    // end connection to db

    // pipe to html
    var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
    myReadStream.pipe(res);
})

server.listen(1337);