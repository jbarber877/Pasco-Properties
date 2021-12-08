const oracledb = require('oracledb');
const fs = require('fs');
const db_query1 = function (zip, year_x, year_y) {
    let connection;
    let chart_file_text;
    let years = [];
    let lotSizes =[];
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
                `select BLDG_ACTYRBLT as Year, median(LAND_SQ_FT) as Median_Lot_Size from
                    BUILDING natural join PARCEL_
                    where BLDG_ACTYRBLT >= ${year_x} and BLDG_ACTYRBLT <= ${year_y}
                    and SITE_ZIP = ${zip}
                    group by BLDG_ACTYRBLT
                    order by BLDG_ACTYRBLT`
                );
                let lotSizes = "";
                let years = "";
                for (let i = 0; i < result.rows.length; i++) { 
                    years += (result.rows[i][0]);
                    lotSizes += ("'" + (result.rows[i][1] / 43560) + "'");

                    if (i+1 < result.rows.length){
                        years += ",";
                        lotSizes += ",";
                    }
                }
                console.log(years);
                console.log(lotSizes);
                chart_file_text = 
                    `<!DOCTYPE html>
                    <html lang="en">
                        <head>
                        </head>
                        <body>
                            <h1>Query Results</h1>
                            <h2 id="return">Return</h2>
                            <div >
                                <canvas id="myChart"></canvas>
                            </div>
                            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                            <script>
                                document.getElementById("return").onclick = () => {
                                    location.search = '';
                                }
                                const labels = [${years}];
                                const data = {
                                labels: labels,
                                datasets: [{
                                    label: 'Median Lot Size (acres) for zipcode ${zip}',
                                    backgroundColor: 'rgb(255, 99, 132)',
                                    borderColor: 'rgb(255, 99, 132)',
                                    data: [${lotSizes}]
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
module.exports = db_query1;