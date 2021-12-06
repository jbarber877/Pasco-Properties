var http = require('http');
var fs = require('fs');
const { prototype } = require('events');

var home = http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});

        // pipe to html
        var myReadStream = fs.createReadStream(__dirname + '/index.html', 'utf8');
        myReadStream.pipe(res);
});

home.listen(80);


var Parcel_ID = '';
var ZipCode = '';
var ret = '';

/*
var server = http.createServer(function(req, res){
    console.log('request was made: '+ req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});

        // pipe to html
        var myReadStream = fs.createReadStream(__dirname + '/template.html', 'utf8');
        myReadStream.pipe(res);
});

server.listen(8000);
*/
 
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true })); 

// Return to homepage
app.post('/home', (req, res)=>{
    res.writeHead(200, {'Content-Type': 'text/html'});

    // pipe to html
    var myReadStream = fs.createReadStream(__dirname + '/index.html', 'utf8');
    myReadStream.pipe(res);
})

// Average Price by ZipCode
app.post('/Price', (req, res) => {
  Parcel_ID = req.body.fname;

  var text = fs.readFileSync("./template.txt").toString('utf-8');

    // Code to connect to the oracle db    
    const { outFormat } = require('oracledb');
    const oracledb = require('oracledb');

    try {
    async function run(){
        let connection;
        try {
        connection = await oracledb.getConnection({
            user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
        });
        console.log("Connected to oracle database");

        // query goes here 

        let z = 33576;

        let text_query = "WITH sales_with_year AS (\
            SELECT Sale_ID, Parcel_ID, EXTRACT(year FROM Sale_Date) year\
            FROM SALE\
            ),\
            sales_per_year_total(year, sales) AS (\
            SELECT year, count(*)\
            FROM sales_with_year\
            GROUP BY year\
            ),\
            sales_per_year_zip(year, sales) AS (\
            SELECT year, count(*)\
            FROM sales_with_year, parcel\
            WHERE sales_with_year.parcel_ID = parcel.parcel_ID AND parcel.site_zip = ";
            text_query += z;
            text_query += " GROUP BY year\
            )\
            SELECT sales_per_year_total.year, (sales_per_year_zip.sales / sales_per_year_total.sales) AS percent\
            FROM sales_per_year_zip, sales_per_year_total\
            WHERE sales_per_year_total.year = sales_per_year_zip.year\
            ORDER BY year";



            let query = 'select * from dummy';

        let result = await connection.execute(text_query, []);
        //console.log(result); 

    // Write everything to an html file. Sort the query data into strings 
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

    console.log('y axis =1=1=1= ' + yAxis);

    text+= yAxis;
    text+= "],datasets:[{label:'Average Price', data:[";
    text+= xAxis;
    text += "]}], backgroundColor:'rgba(255,99,132,0.6)'}, options:{}}); </script> <div id=inputForm>";
    text += '<form action="http://localhost:8080/example" method="POST">Zip Code: <input type="text" name="fname"><br><br>';
    text += '<button type="submit">Send to backend</button> </form> </div> <p> Some text';
    text += '</p><a href="/MyNode/index.html" >Query 1</a></body></html>';

    fs.writeFile('middle.html', text, err => {
    if (err) { 
        console.error(err)
        return
    }
    //file written successfully
    })

    // return to db connection code
    } catch (err){
    console.error(err);
    } finally {
    if (connection){
        try{
        await connection.close();
        } catch (err){
        console.error(err);
        }
    }}
    }

    run();

    } catch (err){
    console.error('Whoops!');
    console.error(err);
    process.exit(1);
    }
    // end connection to db

  var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
  myReadStream.pipe(res);
});

// Median Lot Size by Year Built
app.post('/LotSize', (req, res) => {
    Parcel_ID = req.body.fname;
  
    var text = fs.readFileSync("./template.txt").toString('utf-8');
  
      // Code to connect to the oracle db    
      const { outFormat } = require('oracledb');
      const oracledb = require('oracledb');
  
      try {
      async function run(){
          let connection;
          try {
          connection = await oracledb.getConnection({
              user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
          });
          console.log("Connected to oracle database");
  
          // query goes here 
          let query = 'select BLDG_ACTYRBLT as Year, median(LAND_SQ_FT) as Median_Lot_Size ';
          query +=  'from BUILDING natural join PARCEL ';
          query += 'where BLDG_ACTYRBLT is not null ';
          query += 'group by BLDG_ACTYRBLT ';
          query += 'order by BLDG_ACTYRBLT ';

          //console.log(query);
          
          let result = await connection.execute(query, []); 
  
      // Write everything to an html file. Sort the query data into strings 
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
  
      text+= xAxis;
      text+= "],datasets:[{label:'Lot Size', data:[";
      text+= yAxis;
      text += "]}], backgroundColor:'rgba(255,99,132,0.6)'}, options:{}}); </script> <div id=inputForm>";
      text += '<form action="http://localhost:8080/example" method="POST">Zip Code: <input type="text" name="fname"><br><br>';
      text += '<button type="submit">Send to backend</button> </form> </div> <p> Some text';
      text += '</p><a href="/MyNode/index.html" >Return to Homepage</a></body></html>';
      
      fs.writeFile('middle.html', text, err => {
      if (err) { 
          console.error(err)
          return
      }
      //file written successfully
      })
  
      // return to db connection code
      } catch (err){
      console.error(err);
      } finally {
      if (connection){
          try{
          await connection.close();
          } catch (err){
          console.error(err);
          }
      }}
      }
  
      run();
  
      } catch (err){
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
      }
      // end connection to db
  
    var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
    myReadStream.pipe(res);
  });

// SOH Homestead Exemptions
app.post('/SOH', (req, res) => {
    Parcel_ID = req.body.fname;
  
    var text = fs.readFileSync("./template.txt").toString('utf-8');
  
      // Code to connect to the oracle db    
      const { outFormat } = require('oracledb');
      const oracledb = require('oracledb');
  
      try {
      async function run(){
          let connection;
          try {
          connection = await oracledb.getConnection({
              user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
          });
          console.log("Connected to oracle database");
  
          // query goes here 
           //The average sale price in the zip code, regardless of homestead status
        query = "WITH AVG_ZIP_CODE_PRICE (average, cdate) AS (SELECT AVG(Price), to_char(sale_date, 'YYYY-MM') ";
        query +=                                              "FROM Parcel NATURAL JOIN Sale ";
        query +=                                              ("WHERE site_Zip = " + zipcode);
        query +=                                              " GROUP BY to_char(sale_date, 'YYYY-MM')), ";
        //The std deviation in the zip code where the parcel is homesteaded
        query +=      "DEV_ZIP_CODE_HOME (stdHomestead, cdate) AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM') ";
        query +=                                                   "FROM Parcel NATURAL JOIN Sale ";
        query +=                                                   "WHERE Homestead LIKE '%Y%' ";
        query +=                                                   ("AND site_Zip = " + zipcode);
        query +=                                                   " GROUP BY to_char(sale_date, 'YYYY-MM')), ";
        //The std deviation in the zip code where the parcel IS NOT homesteaded
        query +=     "DEV_ZIP_CODE_NO (stdNotHomestead, cdate)AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM') ";
        query +=                                                  "FROM Parcel NATURAL JOIN Sale "
        query +=                                                  "WHERE Homestead NOT LIKE '%Y%' "
        query +=                                                  ("AND site_Zip = " + zipcode);
        query +=                                                   " GROUP BY to_char(sale_date, 'YYYY-MM')) ";
        // The actual query itself                                   
        query += "SELECT stdHomestead, stdNotHomestead, average, cdate ";
        query += "FROM AVG_ZIP_CODE_PRICE NATURAL JOIN DEV_ZIP_CODE_HOME NATURAL JOIN DEV_ZIP_CODE_NO ";
        query += "ORDER BY cdate;";

          //console.log(query);
          
          let result = await connection.execute(query, []);
          //console.log(result); 
  
      // Write everything to an html file. Sort the query data into strings 
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

      text+= xAxis;
      text+= "],datasets:[{label:'Average Price', data:[";
      text+= yAxis;
      text += "]}], backgroundColor:'rgba(255,99,132,0.6)'}, options:{}}); </script> <div id=inputForm>";
      text += '<form action="http://localhost:8080/example" method="POST">Zip Code: <input type="text" name="fname"><br><br>';
      text += '<button type="submit">Send to backend</button> </form> </div> <p> Some text';
      text += '</p><a href="/MyNode/index.html" >Return to Homepage</a></body></html>';
      
      fs.writeFile('middle.html', text, err => {
      if (err) { 
          console.error(err)
          return
      }
      //file written successfully
      })
  
      // return to db connection code
      } catch (err){
      console.error(err);
      } finally {
      if (connection){
          try{
          await connection.close();
          } catch (err){
          console.error(err);
          }
      }}
      }
  
      run();
  
      } catch (err){
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
      }
      // end connection to db
  
    var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
    myReadStream.pipe(res);
  });

// Sale Price of Properties Near Sinkholes
app.post('/Sinkhole', (req, res) => {
    Parcel_ID = req.body.fname;
  
    var text = fs.readFileSync("./template.txt").toString('utf-8');
  
      // Code to connect to the oracle db    
      const { outFormat } = require('oracledb');
      const oracledb = require('oracledb');
  
      try {
      async function run(){
          let connection;
          try {
          connection = await oracledb.getConnection({
              user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
          });
          console.log("Connected to oracle database");
  
          // query goes here 
          // The average sale prices and dates of sales where the property itself does not have a sinkhole, but another property in the neighborhood does
        query = "WITH Neighborhood(mu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') ";
        query +=        " from Parcel NATURAL JOIN Land NATURAL JOIN Sale ";
        query +=                " where sinkhole_status is NULL ";
        query +=                " and neighborhood_code IN (select distinct neighborhood_code ";
        query +=                                          " from parcel NATURAL JOIN Land ";
        query +=                                          " where sinkhole_status is not NULL) ";
        query +=                "GROUP BY to_char(sale_date, 'YYYY-MM')),";
        // The average price in the zip code, regardless of sinkhole status
        query += "ZipCode (nu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') "; 
        query +=                   " from Parcel NATURAL JOIN Land NATURAL JOIN Sale ";
        query +=                   " GROUP BY to_char(sale_date, 'YYYY-MM')) ";

        // The percent difference between sale prices in the affected neighborhood and the zipcode in general     
        query += " select (1-((mu - nu)/mu)) as Percent Difference,cdate as Date ";
        query += " from Neighborhood NATURAL JOIN ZipCode ";
        query += " order by cdate;";




        let new_query = "WITH Neighborhood(mu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') "; 
        new_query += " from Parcel NATURAL JOIN Land NATURAL JOIN Sale";
        new_query += " where sinkhole_status is NULL and neighborhood_code IN (select distinct neighborhood_code from parcel NATURAL JOIN Land where sinkhole_status is not NULL)";
        new_query += " GROUP BY to_char(sale_date, 'YYYY-MM')), ";
        //new_query +=                "  

        new_query = "WITH ZipCode (nu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') "; 
        new_query +=                   " from Parcel NATURAL JOIN Land NATURAL JOIN Sale ";
        new_query +=                   " GROUP BY to_char(sale_date, 'YYYY-MM')) select * from ZipCode ";


        //oogahboogah

          //console.log(query);
          
          let result = await connection.execute(new_query, []);
          //console.log(result); 
  
      // Write everything to an html file. Sort the query data into strings 
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


      console.log(result.rows);

      text+= yAxis;
      text+= "],datasets:[{label:'Average Price', data:[";
      text+= xAxis;
      text += "]}], backgroundColor:'rgba(255,99,132,0.6)'}, options:{}}); </script> <div id=inputForm>";
      text += '<form action="http://localhost:8080/example" method="POST">Zip Code: <input type="text" name="fname"><br><br>';
      text += '<button type="submit">Send to backend</button> </form> </div> <p> Some text';
      text += '</p><a href="C:/MyNode/index.html" >Return to Homepage</a></body></html>';
      
      fs.writeFile('middle.html', text, err => {
      if (err) { 
          console.error(err)
          return
      }
      //file written successfully
      })
  
      // return to db connection code
      } catch (err){
      console.error(err);
      } finally {
      if (connection){
          try{
          await connection.close();
          } catch (err){
          console.error(err);
          }
      }}
      }
  
      run();
  
      } catch (err){
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
      }
      // end connection to db
  
    var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
    myReadStream.pipe(res);
  });

// Property Valuation
app.post('/Value', (req, res) => {
    Parcel_ID = req.body.fname;
  
    var text = fs.readFileSync("./template.txt").toString('utf-8');
  
      // Code to connect to the oracle db    
      const { outFormat } = require('oracledb');
      const oracledb = require('oracledb');
  
      try {
      async function run(){
          let connection;
          try {
          connection = await oracledb.getConnection({
              user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
          });
          console.log("Connected to oracle database");
  
          // query goes here 
          let query = 'select BLDG_ACTYRBLT as Year, median(LAND_SQ_FT) as Median_Lot_Size ';
          query +=  'from BUILDING natural join PARCEL ';
          query += 'where BLDG_ACTYRBLT is not null ';
          query += 'group by BLDG_ACTYRBLT ';
          query += 'order by BLDG_ACTYRBLT ';

          //console.log(query);
          
          let result = await connection.execute(query, []);
          //console.log(result); 
  
      // Write everything to an html file. Sort the query data into strings 
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

      text+= xAxis;
      text+= "],datasets:[{label:'Average Price', data:[";
      text+= yAxis;
      text += "]}], backgroundColor:'rgba(255,99,132,0.6)'}, options:{}}); </script> <div id=inputForm>";
      text += '<form action="http://localhost:8080/example" method="POST">Zip Code: <input type="text" name="fname"><br><br>';
      text += '<button type="submit">Send to backend</button> </form> </div> <p> Some text';
      text += '</p><a href="/MyNode/index.html" >Return to Homepage</a></body></html>';
      
      fs.writeFile('middle.html', text, err => {
      if (err) { 
          console.error(err)
          return
      }
      //file written successfully
      })
  
      // return to db connection code
      } catch (err){
      console.error(err);
      } finally {
      if (connection){
          try{
          await connection.close();
          } catch (err){
          console.error(err);
          }
      }}
      }
  
      run();
  
      } catch (err){
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
      }
      // end connection to db
  
    var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
    myReadStream.pipe(res);
  });

// Percentage of Sales by Zipcode
app.post('/Sales', (req, res) => {
    Parcel_ID = req.body.fname;
  
    var text = fs.readFileSync("./template.txt").toString('utf-8');
  
      // Code to connect to the oracle db    
      const { outFormat } = require('oracledb');
      const oracledb = require('oracledb');
  
      try {
      async function run(){
          let connection;
          try {
          connection = await oracledb.getConnection({
              user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
          });
          console.log("Connected to oracle database");
  
          // query goes here 
          let query = 'select BLDG_ACTYRBLT as Year, median(LAND_SQ_FT) as Median_Lot_Size ';
          query +=  'from BUILDING natural join PARCEL ';
          query += 'where BLDG_ACTYRBLT is not null ';
          query += 'group by BLDG_ACTYRBLT ';
          query += 'order by BLDG_ACTYRBLT ';

          //console.log(query);
          
          let result = await connection.execute(query, []);
          //console.log(result); 
  
      // Write everything to an html file. Sort the query data into strings 
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

      text+= xAxis;
      text+= "],datasets:[{label:'Average Price', data:[";
      text+= yAxis;
      text += "]}], backgroundColor:'rgba(255,99,132,0.6)'}, options:{}}); </script> <div id=inputForm>";
      text += '<form action="http://localhost:8080/example" method="POST">Zip Code: <input type="text" name="fname"><br><br>';
      text += '<button type="submit">Send to backend</button> </form> </div> <p> Some text';
      text += '</p><a href="/MyNode/index.html" >Return to Homepage</a></body></html>';
      
      fs.writeFile('middle.html', text, err => {
      if (err) { 
          console.error(err)
          return
      }
      //file written successfully
      })
  
      // return to db connection code
      } catch (err){
      console.error(err);
      } finally {
      if (connection){
          try{
          await connection.close();
          } catch (err){
          console.error(err);
          }
      }}
      }
  
      run();
  
      } catch (err){
      console.error('Whoops!');
      console.error(err);
      process.exit(1);
      }
      // end connection to db
  
    var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
    myReadStream.pipe(res);
  });

//}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

app.listen(port, () => {
  console.log(`Server running on port${port}`);
});