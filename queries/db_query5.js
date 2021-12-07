const oracledb = require('oracledb');
const fs = require('fs');

const db_query5 = function (zip, year_x, year_y) {
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
                let result = await connection.execute(`
                    WITH Subject (SF, L, B, Yrblt, ZIP) AS (SELECT Gross_Area, Land_SQ_FT, BLDG_Bathrooms, BLDG_ActyrbLT, site_Zip 
                    FROM Parcel P, Building B 
                    WHERE P.Parcel_ID = B.PARCEL_ID
                    AND P.Parcel_ID = ${Parcel_ID}'
                    'FETCH FIRST 1 ROWS ONLY),
                    SubjectSub (G, P, F) AS (SELECT (SELECT COUNT(*) FROM Sub_Area
                    WHERE Parcel_ID = ${Parcel_ID}'
                    'AND DESCRIPTION LIKE '%Garage%'),
                    (SELECT COUNT(*) FROM Sub_Area
                    WHERE Parcel_ID = ${Parcel_ID}'
                    'AND DESCRIPTION LIKE '%POOL%'),
                    (SELECT COUNT(*) FROM Sub_Area
                    WHERE Parcel_ID = ${Parcel_ID} 
                    AND DESCRIPTION LIKE '%FIREPLACE%')
                    FROM Sub_Area
                    WHERE Parcel_ID = ${Parcel_ID}'
                    'FETCH FIRST 1 ROWS ONLY),
                    Comparables (a, Si, SFi, Li, Bi, charDate) AS (SELECT P.Parcel_ID, Price, Gross_Area, Land_Sq_Ft, Bldg_Bathrooms, to_char(sale_date, 'YYYY-MM')
                    FROM Sale S, Parcel P, Building B, Subject
                    WHERE P.Parcel_ID = B.Parcel_ID AND P.Parcel_ID = S.Parcel_ID
                    AND Land_SQ_FT BETWEEN (0.8*Subject.L) AND (1.2*Subject.L)
                    AND Gross_Area BETWEEN (0.8*Subject.SF) AND (1.2*Subject.SF)
                    AND Bldg_Actyrblt BETWEEN (Subject.yrblt-5) AND (Subject.yrblt+5)
                    AND Site_Zip = Subject.Zip
                    AND Price > 0)
                    SELECT (SUM(Si - 37*(SF-SFi) + 0.14*(L-Li) + (0.10*Si)*(B-Bi) + 1000*(15*G +11*P + 3*F))/Count(*)) as Value, charDate
                    FROM Comparables, Subject, SubjectSub
                    GROUP BY charDate
                    ORDER BY charDate ASC
                `);
                for (let i = 0; i < result.rows.length; i++) {
                    years.push(result.rows[i][0]); 
                    lotSizes.push(result.rows[i][1]);
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
                                    label: 'Median Lot Size (sqft) for zipcode ${zip}',
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
module.exports = db_query5;