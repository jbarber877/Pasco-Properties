const oracledb = require('oracledb');
const fs = require('fs');

function db_query5 (sqf, lotSize, bathrooms, garage, fireplace, pool, yearBuilt, zip) {
    let connection;
    let chart_file_text;
    
    try {
        try { 
            oracledb.initOracleClient({libDir: '/Users/samuelroberson/instantclient_19_8'});
            console.log("Successful");
        }
        catch (e) {}
        async function run(){
            try {
                connection = await oracledb.getConnection({ user: "barber.j", password: "RedCedar3", connectionString: "oracle.cise.ufl.edu/orcl" });
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
                        </head>
                        <body>
                            <h1>Query Results</h1>
                            <h2 id="return">Return</h2>
                            <div >
                                <canvas id="myChart" width="100" height="100"></canvas>
                            </div>
                            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                            <script>
                                document.getElementById("return").onclick = () => {
                                    location.search = '';
                                }
                                const labels = [${dates}];
                                const data = {
                                labels: labels,
                                datasets: [{
                                    label: 'Selling Price of Similar House',
                                    backgroundColor: 'rgb(255, 99, 132)',
                                    borderColor: 'rgb(255, 99, 132)',
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