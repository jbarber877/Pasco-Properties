const oracledb = require('oracledb');
const fs = require('fs');

function db_query5 (sqf, lotSize, bathrooms, garage, fireplace, pool, yearBuilt, zip) {
    let connection;
    let chart_file_text;
    
    try {
        async function run(){
            try {
                connection = await oracledb.getConnection({ user: "USERNAME", password: "PASSWORD", connectionString: "oracle.cise.ufl.edu/orcl" });
                console.log("Successfully connected to Oracle Database");
                let result = await connection.execute(`
                    WITH 
                    Comparables (a, Si, SFi, Li, Bi, charDate) AS (SELECT P.Parcel_ID, Price, Gross_Area, Land_Sq_Ft, Bldg_Bathrooms, to_char(sale_date, 'YYYY-MM')
                    FROM Sale S, Parcel P, Building B
                    WHERE P.Parcel_ID = B.Parcel_ID AND P.Parcel_ID = S.Parcel_ID
                    AND Land_SQ_FT BETWEEN (0.8*${lotSize}) AND (1.2*${lotSize})
                    AND Gross_Area BETWEEN (0.8*${sqf}) AND (1.2*${sqf})
                    AND Bldg_Actyrblt BETWEEN (${yearBuilt}-5) AND (${yearBuilt}+5)
                    AND Site_Zip = ${zip}
                    AND Price > 0)
                    SELECT (SUM(Si - 37*(${sqf}-SFi) + 0.14*(${lotSize}-Li) + (0.10*Si)*(${bathrooms}-Bi) + 1000*(15*${(garage.toUpperCase()=='Y')?1:0} +11*${(pool.toUpperCase()=='Y')?1:0} + 3*${(fireplace.toUpperCase()=='Y')?1:0}))/Count(*)) as Value, charDate
                    FROM Comparables
                    GROUP BY charDate
                    ORDER BY charDate ASC
                `);
                let prices = "";
                let dates = "";
                for (let i = 0; i < result.rows.length; i++) { 
                    prices += (result.rows[i][0]);
                    dates += ("'" + result.rows[i][1] + "'");

                    if (i+1 < result.rows.length){
                        prices += ",";
                        dates += ",";
                    }
                }
                console.log(dates);
                console.log(prices);
                axes = [dates, prices];
                chart_file_text = 
                    `<!DOCTYPE html>
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
                            <h2 id="return">Return</h2>
                            <div id="chart">
                                <canvas id="myChart"></canvas>
                            </div>
                            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                            <script>
                                const labels = [${dates}];
                                const data = {
                                labels: labels,
                                datasets: [{
                                    label: 'Selling Price of Similar House',
                                    backgroundColor: '#05386b',
                                    borderColor: '#05386b',
                                    data: [${prices}]
                                }]
                                };
                                const config = {
                                type: 'line',
                                data: data,
                                options: {
                                    scales: {
                                        y: {
                                            ticks: {
                                                // Include a dollar sign in the ticks
                                                callback: function(value, index, values) {
                                                    return '$' + value;
                                                }
                                            }
                                        }
                                    }
                                }
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
                fs.writeFile('Query5_chart.html', chart_file_text, err => {
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
module.exports = db_query5;

// function test(){
//     db_query5(2000,11000,4,1,1,1,2000,33559);
// }
// test();
