const oracledb = require('oracledb');
const fs = require('fs');

function db_query6(zip) {
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
              connection = await oracledb.getConnection({ user: "Barber.J", password: "RedCedar3", connectionString: "oracle.cise.ufl.edu/orcl"});
  
              console.log("Successfully connected to Oracle Database");
              let text = ` SELECT extract(year FROM Sale.Sale_Date) as year, 
              round(avg(price),0) as avgprice
              FROM Parcel, Sale
              WHERE Parcel.Parcel_ID = Sale.Parcel_ID AND site_zip = ` + zip + `
              GROUP BY extract(year from Sale.Sale_Date), site_zip
              ORDER BY year
              `;
        
              let result = await connection.execute(text);
                let years = [];
                let avgprice =[];
                result.rows.forEach((pair) => {
                  years.push(pair[0]);
                  avgprice.push(pair[1]);
                })
                
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
                        label: 'Avg Sale Price of Houses Yearly in Zip Code ` + zip + `',
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: [` + avgprice + `]
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
                fs.writeFile('Query6_chart.html', chart_file_text, err => {
                    if (err){
                        console.error(err)
                        return
                    }
                });
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

  module.exports = {
      get: db_query6
  }

  