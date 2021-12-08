
var http = require('http');
var fs = require('fs');
var url= require('url');
const { outFormat } = require('oracledb');
const oracledb = require('oracledb');

async function db_query1(zip, from, to) {
  let connection;
  let chart_file_text;
  try {

    connection = await oracledb.getConnection({ user: "Barber.J", password: "RedCedar3", connectionString: "oracle.cise.ufl.edu/orcl" });

    console.log("Successfully connected to Oracle Database");
    let text = `select BLDG_ACTYRBLT as Year, median(LAND_SQ_FT) as Median_Lot_Size from
    BUILDING natural join PARCEL
    where BLDG_ACTYRBLT >= ${from} and BLDG_ACTYRBLT <= ${to}
    and SITE_ZIP = ${zip}
    and BLDG_ACTYRBLT is not null
    group by BLDG_ACTYRBLT
    order by BLDG_ACTYRBLT`;

    let result = await connection.execute(text);
      let years = [];
      let percentages =[];
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
                  const labels = [` + years + `];
          const data = {
            labels: labels,
            datasets: [{
              label: 'Median lot size in zip code ` + zip + ` between ` + from + ` and ` + to + `',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: [` + percentages + `]
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
}

async function db_query2(zip, year_x, year_y) {

  let connection;
  let chart_file_text;
  try {

    connection = await oracledb.getConnection({ user: "t.schneider", password: "yGzNUcY59fEFBnud0YFaDOmT", connectionString: "oracle.cise.ufl.edu/orcl" });

    console.log("Successfully connected to Oracle Database");
    let text = `WITH sales_with_year AS (
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
      WHERE sales_with_year.parcel_ID = parcel_test.parcel_ID AND parcel_test.site_zip = ` + zip + `
      GROUP BY year
      )
      SELECT sales_per_year_total.year, (sales_per_year_zip.sales / sales_per_year_total.sales) AS percent
      FROM sales_per_year_zip, sales_per_year_total
      WHERE sales_per_year_total.year = sales_per_year_zip.year AND sales_per_year_total.year >= ` + year_x + ` AND sales_per_year_total.year <= ` + year_y + `
      ORDER BY year`;

    let result = await connection.execute(text);
      let years = [];
      let percentages =[];
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
                  const labels = [` + years + `];
          const data = {
            labels: labels,
            datasets: [{
              label: 'Percentage of total Pasco County sales in zip code ` + zip + `',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: [` + percentages + `]
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
      fs.writeFile('Query2_chart.html', chart_file_text, err => {
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
  
}

async function db_query3(zip) {
  let connection;
  let chart_file_text;
  try {
         
          connection = await oracledb.getConnection({user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl" });
          console.log("Connected to oracle database");
  
          //The average sale price in the zip code, regardless of homestead status
          let query = "WITH AVG_ZIP_CODE_PRICE (average, cdate) AS (SELECT AVG(Price), to_char(sale_date, 'YYYY-MM')\n";
          query +=                                              "FROM Parcel NATURAL JOIN Sale \n";
          query +=                                              ("WHERE site_Zip = \n" + zip);
          query +=                                              " GROUP BY to_char(sale_date, 'YYYY-MM')),\n ";
          //The std deviation in the zip code where the parcel is homesteaded
          query +=      "DEV_ZIP_CODE_HOME (stdHomestead, cdate) AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM') \n";
          query +=                                                   "FROM Parcel NATURAL JOIN Sale\n ";
          query +=                                                   "WHERE Homestead LIKE '%Y%'\n ";
          query +=                                                   ("AND site_Zip = " + zip);
          query +=                                                   " GROUP BY to_char(sale_date, 'YYYY-MM')), \n";
          //The std deviation in the zip code where the parcel IS NOT homesteaded
          query +=     "DEV_ZIP_CODE_NO (stdNotHomestead, cdate)AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM')\n ";
          query +=                                                  "FROM Parcel NATURAL JOIN Sale\n "
          query +=                                                  "WHERE Homestead NOT LIKE '%Y%' \n"
          query +=                                                  ("AND site_Zip = \n" + zip);
          query +=                                                   " GROUP BY to_char(sale_date, 'YYYY-MM'))\n";
          // The actual query itself                                   
          query += "SELECT stdHomestead, stdNotHomestead, average, cdate\n";
          query += "FROM AVG_ZIP_CODE_PRICE NATURAL JOIN DEV_ZIP_CODE_HOME NATURAL JOIN DEV_ZIP_CODE_NO\n";
          query += "where stdNotHomestead < 1000000 \n";
          query += "ORDER BY cdate";

    // Write everything to an html file. Sort the query data into strings 
    let yAxis = "";
    let stdHomestead = "";
    let stdNot = "";

    let result = await connection.execute(query, []);
    //console.log('result = ' + result);

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
              return
          }
      })
  } 
  
  
  
  
  
  
  
  catch (err) {
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
}

async function db_query4(year_x, year_y) {
  // The average sale prices and dates of sales where the property itself does not have a sinkhole, but another property in the neighborhood does
  let new_query = "WITH Neighborhood (mu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') \n";
  new_query +=                                     " from Parcel NATURAL JOIN Land NATURAL JOIN Sale \n";
  new_query +=                                     " where sinkhole_status is NULL \n";
  new_query +=                                     ("AND SALE_DATE BETWEEN to_date('01/01/" + year_x + "', 'DD/MM/YYYY') and to_date('01/01/" + year_y + "', 'DD/MM/YYYY') \n");
  new_query +=                                     " and neighborhood_code IN (select distinct neighborhood_code \n";
  new_query +=                                                              " from parcel NATURAL JOIN Land \n";
  new_query +=                                                              " where sinkhole_status is not NULL) \n";
  new_query +=                                    " GROUP BY to_char(sale_date, 'YYYY-MM')), \n";  
  // The average price in the zip code, regardless of sinkhole status
  new_query += "ZipCode (nu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') \n"; 
  new_query +=                              " from Parcel NATURAL JOIN Land NATURAL JOIN Sale \n";
  new_query +=                              " GROUP BY to_char(sale_date, 'YYYY-MM')) \n";
  // The percent difference between sale prices in the affected neighborhood and the zipcode in general 
  new_query += " select (1-((mu - nu)/mu)) as PercentDifference, cdate as Foo from Neighborhood NATURAL JOIN ZipCode where (1-((mu - nu)/mu)) < 2000000 order by cdate";

  let connection;
  let chart_file_text;
  try {

    connection = await oracledb.getConnection({ user: "Barber.J", password: "RedCedar3", connectionString: "oracle.cise.ufl.edu/orcl" });

    console.log("Successfully connected to Oracle Database");
    let text = new_query
    let result = await connection.execute(text, []);

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
    /*
      let y = [];
      let x =[];
      result.rows.forEach((pair) => {
        y.push(pair[0]);
        x.push(pair[1]);
      })
      console.log(x);
*/
   


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
                  const labels = [` + yAxis + `];
                  console.log(labels);
          const data = {
            labels: labels,
            datasets: [{
              label: 'percent difference',
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
  
  async function db_query6(zip) {

    let connection;
    let chart_file_text;
    try {
  
      connection = await oracledb.getConnection({ user: "Barber.J", password: "RedCedar3", connectionString: "oracle.cise.ufl.edu/orcl" });
  
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
    
  }

  


}

var server = http.createServer(function(req, res){

    // The following is mainly for navigation purposes
    // The "Queryx.html" files contain the code for displaying things on webpage

    let file = "./index.html";
    
    res.writeHead(200, {'Content-Type': 'text/html'});
    temp=url.parse(req.url, true).query;
    
    
    if (temp.query=='1'){
        file = "./Query1.html";
        if(temp.zip!== undefined){
          db_query1(temp.zip, temp.year_x, temp.year_y);
          file = 'Query1_chart.html';
      }
    }
    if (temp.query=='2'){
        file = "./Query2.html";
        if(temp.zip!== undefined){
            db_query2(temp.zip, temp.year_x, temp.year_y);
            file = 'Query2_chart.html';
        }
    }
    if (temp.query=='3'){
        file = "./Query3.html";
        if(temp.zip!== undefined){
          db_query3(temp.zip);
          file = 'Query3_chart.html';
        }
    }
    if (temp.query=='4'){
        file = "./Query4.html";
        if(temp.year_x!== undefined){
          db_query4(temp.year_x, temp.year_y);
          file = 'Query4_chart.html';
        }
    }
    if (temp.query=='5'){
        file = "./Query5.html";
    }
  
  if(temp.query == '6'){
    file = "./Query6.html";
    if(temp.zip !== undefined){
      db_query6(temp.zip);
      file = 'Query6_chart.html';
    }
  }
    





    // pipe to html
    var myReadStream = fs.createReadStream(file);
    myReadStream.pipe(res);
    
})

server.listen(1337);

