const oracledb = require('oracledb');
const fs = require('fs');
const db_query4 = function (year_x, year_y) {
    let connection;
    let chart_file_text;
    try {
        async function run(){
            try {
                connection = await oracledb.getConnection({ user: "USERNAME", password: "PASSWORD", connectionString: "oracle.cise.ufl.edu/orcl" });
                console.log("Successfully connected to Oracle Database");
                let result = await connection.execute(`
                    WITH Neighborhood (mu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') 
                    from Parcel NATURAL JOIN Land NATURAL JOIN Sale 
                    where sinkhole_status is NULL 
                    AND SALE_DATE BETWEEN to_date('01/01/${year_x}', 'DD/MM/YYYY') and to_date('01/01/${year_y}', 'DD/MM/YYYY') 
                    and neighborhood_code IN (select distinct neighborhood_code 
                    from parcel NATURAL JOIN Land 
                    where sinkhole_status is not NULL) 
                    GROUP BY to_char(sale_date, 'YYYY-MM')), 
                    ZipCode (nu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') 
                    from Parcel NATURAL JOIN Land NATURAL JOIN Sale 
                    GROUP BY to_char(sale_date, 'YYYY-MM')) 
                    select (1-((mu - nu)/mu)) as PercentDifference, cdate as Foo from Neighborhood NATURAL JOIN ZipCode where (1-((mu - nu)/mu)) < 2000000 order by cdate`
                );
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
                console.log(xAxis);
                console.log(yAxis);
                // pass info from database to chart
                chart_file_text = `<!DOCTYPE html>
                <html lang="en">
                <head>
                <link href = "index.css" rel = "stylesheet" type = "text/css">
                <script src="https://kit.fontawesome.com/de27bd6bac.js" crossorigin="anonymous"></script>
                <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Roboto&display=swap" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Permanent+Marker&family=Roboto&display=swap" rel="stylesheet">
            
                <style>
                  /* Basic Css */
                  body{ background-color: #5cdb95; font-family:Lobster; color: #05386b; padding: 30px;}
                  h1{font-size: 48px; text-transform: uppercase; letter-spacing: 2px; text-align: center;}
                  
                  .middle-message{text-align: center; margin: 300px; margin-top: 0;}
            
                  /* The sidebar menu */
                  .sidenav {height: 100%; width: 200px; position: fixed; z-index: 1; top: 0; left: 0; background-color: #379683; overflow-x: hidden; padding-top: 20px;}
                  .sidenav h2 {padding: 6px 8px 6px 16px; text-decoration: none; font-size: 25px; color: #edf5e1; display: block;}
                  .sidenav h2:hover {color: #f1f1f1;}
                  #home:hover{
                    text-decoration: underline;
                    cursor: pointer;
                  }
                  #que1:hover {
                    text-decoration: underline;
                    cursor: pointer;
                  }
            
                  #que2:hover{
                    text-decoration: underline;
                    cursor: pointer;
                  }
            
                  #que3:hover{
                    text-decoration: underline;
                    cursor: pointer;
                  }
            
                  #que4:hover{
                    text-decoration: underline;
                    cursor: pointer;
                  }
            
                  #que5:hover{
                    text-decoration: underline;
                    cursor: pointer;
                  }
            
                  #que6:hover{
                    text-decoration: underline;
                    cursor: pointer;
                  }
            
                  /* Style page content */
                  .main {margin-left: 160px; padding: 0px 10px;} 
                  .main h2{text-align: center;}
                  .main p{padding-left: 60px; padding-top: 60px;}  
                  .about {text-align: center; margin: 300px; margin-top: 0;} 
                  
                  #chart{
                      margin-left:200px;
                  }
              </style>
              </head>
                    <body>
                    <div class="sidenav">
                    <h2 id="home">Home</h2>
                        <h2 id="que1">Query 1: Median Lot Size by Zip</h2>
                        <h2 id="que2">Query 2: Percentage of Total Sales by Zip</h2>
                        <h2 id="que3">Query 3: Tax Exemption Exploitation</h2>
                        <h2 id="que4">Query 4: Sinkholes and Sales Price</h2>
                        <h2 id="que5">Query 5: Value Over Time</h2>
                        <h2 id="que6">Query 6: Avg Price Sold by Zip </h2>
                    </div>
                        <h1>Query Results</h1>
                        <h2 id="return">return</h2>
                        <div id="chart">
                            <canvas id="myChart"></canvas>
                        </div>
                        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                        <script >
                            const labels = [` + yAxis + `];
                            console.log(labels);
                    const data = {
                        labels: labels,
                        datasets: [{
                        label: 'Percent Difference',
                        backgroundColor: '#05386b',
                        borderColor: '#05386b',
                        data: [` + xAxis + `]
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
                        document.getElementById("home").onclick = (e) => {
                            location.search = '';
                        };
                        document.getElementById("que1").onclick = (e) => {
                            location.search = 'query=1';
                        };
                        document.getElementById("que2").onclick = (e) => {
                            location.search = 'query=2';
                        };
                        document.getElementById("que3").onclick = () => {
                          location.search = 'query=3';
                        }
                        document.getElementById("que4").onclick = () => {
                          location.search = 'query=4';
                        }
                        document.getElementById("que5").onclick = () => {
                          location.search = 'query=5';
                        }
                        document.getElementById("que6").onclick = () => {
                          location.search = 'query=6';
                        }
                        </script>
                    </body>
                </html>`  
                fs.writeFile('Query4_chart.html', chart_file_text, err => {
                    if (err){
                        console.error(err)
                        return;
                    }
                })
            }
            catch (e) {
                console.error(e);
            }
            finally {
                if (connection) {
                try {
                    await connection.close();
                    } 
                    catch (err) {
                    console.error(err);
                    }
                }
            }
        }
        run();
    } 
    catch (err) {
      console.error(err);
    } 
}
module.exports = db_query4;
