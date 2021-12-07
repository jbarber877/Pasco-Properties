const oracledb = require('oracledb');
const fs = require('fs');

const db_query3 = function (zip) {
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
                connection = await oracledb.getConnection({ user: "samuel.roberson", password: "Mfdgn13#", connectionString: "oracle.cise.ufl.edu/orcl" });
                console.log("Successfully connected to Oracle Database");
                let result = await connection.execute(
                `
                    WITH AVG_ZIP_CODE_PRICE (average, cdate) AS (SELECT AVG(Price), to_char(sale_date, 'YYYY-MM')
                    FROM Parcel NATURAL JOIN Sale 
                    WHERE site_Zip = 
                    ${zip} GROUP BY to_char(sale_date, 'YYYY-MM')),
                    DEV_ZIP_CODE_HOME (stdHomestead, cdate) AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM') 
                    FROM Parcel NATURAL JOIN Sale
                    WHERE Homestead LIKE '%Y%'
                    AND site_Zip = ${zip} GROUP BY to_char(sale_date, 'YYYY-MM')), 
                    DEV_ZIP_CODE_NO (stdNotHomestead, cdate)AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM')
                    FROM Parcel NATURAL JOIN Sale
                    WHERE Homestead NOT LIKE '%Y%' 
                    AND site_Zip = 
                    ${zip} GROUP BY to_char(sale_date, 'YYYY-MM'))
                    SELECT stdHomestead, stdNotHomestead, average, cdate
                    FROM AVG_ZIP_CODE_PRICE NATURAL JOIN DEV_ZIP_CODE_HOME NATURAL JOIN DEV_ZIP_CODE_NO
                    where stdNotHomestead < 1000000 
                    ORDER BY cdate
                `
                );
                let yAxis = "";
                let stdHomestead = "";
                let stdNot = "";
                for (let i = 0; i < result.rows.length; i++) { 
                    stdHomestead += (result.rows[i][0]);
                    stdNot += (result.rows[i][1]);
                    // The average may be useful as a baseline, but is not displayed on the graph
                    //avg += (result.rows[i][2]); 
                    yAxis += ("'" + result.rows[i][3] + "'");
            
                    if (i+1 < result.rows.length){
                        stdHomestead += ",";
                        stdNot += ",";
                        yAxis += ",";
                    }
                }
                chart_file_text = 
                `<!DOCTYPE html>
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
                            const labels = [` + yAxis + `];
                            const data = {
                            labels: labels,
                            datasets: [{
                                label: 'Sale Prices of Homesteaded Properties in ` + zip + `',
                                backgroundColor: 'rgb(255, 99, 132)',
                                borderColor: 'rgb(255, 99, 132)',
                                data: [` + stdHomestead + `]
                            },
                            {
                                label: 'Sale Prices of Non-homesteaded Properties in ` + zip + `',
                                backgroundColor: 'rgb(0, 99, 132)',
                                borderColor: 'rgb(0, 99, 132)',
                                data: [` + stdNot + `]
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
                fs.writeFile('Query3_chart.html', chart_file_text, err => {
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
module.exports = db_query3;