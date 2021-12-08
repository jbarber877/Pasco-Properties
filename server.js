
var http = require('http');
var fs = require('fs');
var url= require('url');
const { outFormat } = require('oracledb');
const db_query1 = require('./queries/db_query1');
const db_query2 = require('./queries/db_query2');
const db_query3 = require('./queries/db_query3');
const db_query4 = require('./queries/db_query4');

var server = http.createServer(function(req, res){

    // The following is mainly for navigation purposes
    // The "Queryx.html" files contain the code for displaying things on webpage

    let file = "./index.html";
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    temp=url.parse(req.url, true).query;
    
    
    if (temp.query=='1'){
        file = "./Query1.html";
        if(temp.zip!== undefined){
          db_query1(temp.zip, temp.year_x, temp.year_y);
          file = 'Query1_chart.html';
      }
    }
    if (temp.query=='2'){
        file = "./Query2.html";
        if(temp.zip!== undefined){
            db_query2(temp.zip, temp.zipb, temp.year_x, temp.year_y);
            file = 'Query2_chart.html';
        }
    }
    if (temp.query=='3'){
        file = "./Query3.html";
        if(temp.zip!== undefined){
          db_query3(temp.zip);
          file = 'Query3_chart.html';
        }
    }
    if (temp.query=='4'){
        file = "./Query4.html";
        if(temp.year_x!== undefined){
          db_query4(temp.year_x, temp.year_y);
          file = 'Query4_chart.html';
        }
    }
    if (temp.query=='5'){
        file = "./Query5.html";
        if(temp.year_x!== undefined){
          db_query5(temp.zip);
          file = 'Query5_chart.html';
        }
    }
    

    // pipe to html
    var myReadStream = fs.createReadStream(file);
    myReadStream.pipe(res);
    
})

server.listen(1337);

