//import db_query2 from './db_query2';
var http = require('http');
var fs = require('fs');
var url= require('url');
const { outFormat } = require('oracledb');


const oracledb = require('oracledb');


async function db_query2(zip) {

    let connection;
    let chart_file_text;
    try {
  
      connection = await oracledb.getConnection({ user: "t.schneider", password: "yGzNUcY59fEFBnud0YFaDOmT", connectionString: "oracle.cise.ufl.edu/orcl" });
  
      console.log("Successfully connected to Oracle Database");
      let text = `WITH sales_with_year AS (
        SELECT Sale_ID, Parcel_ID, EXTRACT(year FROM Sale_Date) year
        FROM SALE_TEST
        ),
        sales_per_year_total(year, sales) AS (
        SELECT year, count(*)
        FROM sales_with_year
        GROUP BY year
        ),
        sales_per_year_zip(year, sales) AS (
        SELECT year, count(*)
        FROM sales_with_year, parcel_test
        WHERE sales_with_year.parcel_ID = parcel_test.parcel_ID AND parcel_test.site_zip = ` + zip + `
        GROUP BY year
        )
        SELECT sales_per_year_total.year, (sales_per_year_zip.sales / sales_per_year_total.sales) AS percent
        FROM sales_per_year_zip, sales_per_year_total
        WHERE sales_per_year_total.year = sales_per_year_zip.year
        ORDER BY year`;

      let result = await connection.execute(text);
        let years = [];
        let percentages =[];
        result.rows.forEach((pair) => {
          years.push(pair[0]);
          percentages.push(pair[1]);
        })
        //console.log(years);
        //console.log(percentages);
        // pass info from database to chart
        chart_file_text = `<!DOCTYPE html>
        <html lang="en">
            <head>
            </head>
            <body>
                <h1>Query Results</h1>
                <h2 id="return">return</h2>
                <div >
                    <canvas id="myChart"></canvas>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script >
                    document.getElementById("return").onclick = () => {
                        location.search = '';
                    }
                    const labels = [` + years + `];
            const data = {
              labels: labels,
              datasets: [{
                label: 'Percentage of total Pasco County sales in zip code ` + zip + `',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [` + percentages + `]
            }]
            };
            const config = {
              type: 'line',
              data: data,
              options: {}
            };
              // === include 'setup' then 'config' above ===
            
              const myChart = new Chart(
                document.getElementById('myChart'),
                config
              );
                </script>
            </body>
        </html>` 
        fs.writeFile('Query1_chart.html', chart_file_text, err => {
            if (err){
                console.error(err)
                return
            }
        })
    } catch (err) {
      console.error(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
    
  }



var server = http.createServer(function(req, res){

    // The following is mainly for navigation purposes
    // The "Queryx.html" files contain the code for displaying things on webpage

    let file = "./index.html";
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    temp=url.parse(req.url, true).query;
    
    
    if (temp.query=='1'){
        file = "./Query1.html";
    }
    if (temp.query=='2'){
        file = "./Query2.html";
        if(temp.zip!== undefined){
            
            db_query2(temp.zip);
            file = 'Query1_chart.html';
        }
    }
    if (temp.query=='3'){
        file = "./Query3.html";
    }
    if (temp.query=='4'){
        file = "./Query4.html";
    }
    if (temp.query=='5'){
        file = "./Query5.html";
    }
    





    // pipe to html
    var myReadStream = fs.createReadStream(file);
    myReadStream.pipe(res);
    
})

server.listen(1337);