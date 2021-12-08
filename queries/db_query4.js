const oracledb = require('oracledb');
const fs = require('fs');
const db_query4 = function (year_x, year_y) {
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
                            console.log(labels);
                    const data = {
                        labels: labels,
                        datasets: [{
                        label: 'Percent Difference',
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
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