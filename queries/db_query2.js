const oracledb = require('oracledb');
const fs = require('fs');
const db_query2 = function (zip, zipb, year_x, year_y) {
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
              connection = await oracledb.getConnection({ user: "t.schneider", password: "yGzNUcY59fEFBnud0YFaDOmT", connectionString: "oracle.cise.ufl.edu/orcl" });
              console.log("Successfully connected to Oracle Database");
              let result = await connection.execute(
              `
                WITH sales_with_year AS (
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
                WHERE sales_with_year.parcel_ID = parcel_test.parcel_ID AND parcel_test.site_zip = ${zip} 
                GROUP BY year
                )
                SELECT sales_per_year_total.year, (sales_per_year_zip.sales / sales_per_year_total.sales)*100 AS percent
                FROM sales_per_year_zip, sales_per_year_total
                WHERE sales_per_year_total.year = sales_per_year_zip.year AND sales_per_year_total.year >= ${year_x}  AND sales_per_year_total.year <=  ${year_y}
                ORDER BY year
              `
              );
              let years = [];
              let percentages =[];
              result.rows.forEach((pair) => {
                years.push(pair[0]);
                percentages.push(pair[1]);
              })

              let resultb = await connection.execute(
                `
                  WITH sales_with_year AS (
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
                  WHERE sales_with_year.parcel_ID = parcel_test.parcel_ID AND parcel_test.site_zip = ${zipb} 
                  GROUP BY year
                  )
                  SELECT sales_per_year_total.year, (sales_per_year_zip.sales / sales_per_year_total.sales)*100 AS percent
                  FROM sales_per_year_zip, sales_per_year_total
                  WHERE sales_per_year_total.year = sales_per_year_zip.year AND sales_per_year_total.year >= ${year_x}  AND sales_per_year_total.year <=  ${year_y}
                  ORDER BY year
                `
                );
                let yearsb = [];
                let percentagesb =[];
                resultb.rows.forEach((pair) => {
                  yearsb.push(pair[0]);
                  percentagesb.push(pair[1]);
                })
                console.log(percentages);
                console.log(percentagesb);
              chart_file_text = 
                  `
                    <!DOCTYPE html>
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
                                  label: 'Percentage of total Pasco County sales in zip code ${zip}',
                                  backgroundColor: 'rgb(255, 99, 132)',
                                  borderColor: 'rgb(255, 99, 132)',
                                  data: [${percentages}]
                                },
                                {
                                  label: 'Percentage of total Pasco County sales in zip code ${zipb}',
                                  backgroundColor: 'rgb(0, 99, 132)',
                                  borderColor: 'rgb(0, 99, 132)',
                                  data: [${percentagesb}]
                                }
                              ]
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
              fs.writeFile('Query2_chart.html', chart_file_text, err => {
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
module.exports = db_query2;