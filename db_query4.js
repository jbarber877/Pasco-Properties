async function db_query2(zip, year_x, year_y) {

    let connection;
    let chart_file_text;
    try {
  
      connection = await oracledb.getConnection({ user: "Barber.J", password: "RedCedar3", connectionString: "oracle.cise.ufl.edu/orcl" });
  
      console.log("Successfully connected to Oracle Database");

      let result = await connection.execute(text);
        let years = [];
        let lotSizes =[];
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
                    const labels = [${years}];
            const data = {
              labels: labels,
              datasets: [{
                label: 'Percentage of total Pasco County sales in zip code ${zip},
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
        fs.writeFile('Query4_chart.html', chart_file_text, err => {
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
    return chart_file_text;
}

  module.exports = {
      get: db_query4
  }