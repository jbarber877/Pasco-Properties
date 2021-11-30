/*
Rough draft of program - awaits a request from the webpage, querys the db, writes the results to an html file, then pipes the results back to the webpage.
To Do:
    - right now this only accepts one query - how to handle requests for different queries?
    - how to get input from the starting webpage and send it to the query?
    - the webpage design used here is very basic - I believe Michael has worked on some better looking pages?
    - also, (note to self) the SOH query returns more than two columns - how to fix this?
*/



var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){
    console.log('request was made: '+ req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});

    // the default query - so nothing breaks
    let query = 'select * from dummy';

    // The stuff in this section can be changed, I am just trying to show my idea
    var h1 = "DEFAULT TITLE";
    let h2 = "default sub title";
    let zipcode = '33525';
    let parcelID = '26-26-15-0030-00000-5490';

    if (req.url == "/"){
        console.log("stuff");
        // stuff
    }
    else if (req.url == "/AvgPrice"){
        // query =  INSERT AVERAGE PRICE QUERY HERE
        h1 = "Average Price";
        h2 = "What was the average price in a given zip code?";
    }
    else if (req.url == "/Percent"){
        // query =  INSERT PERCENT OF SALES QUERY HERE
        h1 = "Percentage of Sales";
        h2 = "What percentage of sales occurred in a given zip code?";
    }
    else if (req.url == "/SOH"){
        h1 = "Homestead Fraud";
        h2 = "Are tax exemptions being exploited to avoid paying fair tax rates?";

        //The average sale price in the zip code, regardless of homestead status
        query = "WITH AVG_ZIP_CODE_PRICE (average, cdate) AS (SELECT AVG(Price), to_char(sale_date, 'YYYY-MM')";
        query +=                                              "FROM Parcel NATURAL JOIN Sale";
        query +=                                              ("WHERE site_Zip = " + zipcode);
        query +=                                              "GROUP BY to_char(sale_date, 'YYYY-MM')),";
        //The std deviation in the zip code where the parcel is homesteaded
        query +=      "DEV_ZIP_CODE_HOME (stdHomestead, cdate) AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM')";
        query +=                                                   "FROM Parcel NATURAL JOIN Sale";
        query +=                                                   "WHERE Homestead LIKE '%Y%'";
        query +=                                                   ("AND site_Zip = " + zipcode);
        query +=                                                   "GROUP BY to_char(sale_date, 'YYYY-MM')),";
        //The std deviation in the zip code where the parcel IS NOT homesteaded
        query +=     "DEV_ZIP_CODE_NO (stdNotHomestead, cdate)AS (SELECT STDDEV(Price), to_char(sale_date, 'YYYY-MM')";
        query +=                                                  "FROM Parcel NATURAL JOIN Sale"
        query +=                                                  "WHERE Homestead NOT LIKE '%Y%'"
        query +=                                                  ("AND site_Zip = " + zipcode);
        query +=                                                   "GROUP BY to_char(sale_date, 'YYYY-MM'))";
        // The actual query itself                                   
        query += "SELECT stdHomestead, stdNotHomestead, average, cdate";
        query += "FROM AVG_ZIP_CODE_PRICE NATURAL JOIN DEV_ZIP_CODE_HOME NATURAL JOIN DEV_ZIP_CODE_NO";
        query += "ORDER BY cdate;";

    }
    else if (req.url == "/Median"){
        // query =  INSERT MEDIAN LOT SIZE QUERY HERE
        h1 = "Median Lot Size";
        h2 = "What is the median lot size by year built?";
    }
    else if (req.url == "/Value"){
        // query =  INSERT AVERAGE PRICE QUERY HERE
        h1 = "Fair Market Value";
        h2 = "How has the value of a house changed over time?";

        query = "WITH";
        // Gets the square footage, lot size, year built, and zip code for the subject property
        // Only 1 row will be returned, but the "Fetch first" statement is important for the join later
        query += "Subject (SF, L, B, Yrblt, ZIP) AS (SELECT Gross_Area, Land_SQ_FT, BLDG_Bathrooms, BLDG_ActyrbLT, site_Zip"; 
        query +=                                        "FROM Parcel P, Building B";
        query +=                                        "WHERE P.Parcel_ID = B.PARCEL_ID";
        query +=                                        ("AND P.Parcel_ID = " + parcelID);
        query +=                                        "FETCH FIRST 1 ROWS ONLY),";
        //Gets the number of garages, pools and fireplaces for the subject property
        //Only 1 row will be returned, but the "Fetch first statement is important for the join later
        query += "SubjectSub (G, P, F) AS (SELECT (SELECT COUNT(*) FROM Sub_Area"
        query +=                                 ("WHERE Parcel_ID = " + parcelID);
        query +=                                 "AND DESCRIPTION LIKE '%Garage%'),";
        query +=                                "(SELECT COUNT(*) FROM Sub_Area"
        query +=                                ("WHERE Parcel_ID = " + parcelID);
        query +=                                 "AND DESCRIPTION LIKE '%POOL%'),";
        query +=                                "(SELECT COUNT(*) FROM Sub_Area";
        query +=                                "WHERE Parcel_ID = " + parcelID;
        query +=                                 "AND DESCRIPTION LIKE '%FIREPLACE%')";
        query +=                         "FROM Sub_Area";
        query +=                         ("WHERE Parcel_ID = " + parcelID);
        query +=                         "FETCH FIRST 1 ROWS ONLY),";
        // Gets the parcel id, sale price, square footage, lot size, number of bathrooms, and sale date for the comparable properties                                        
        query += "Comparables (a, Si, SFi, Li, Bi, chardate) AS (SELECT P.Parcel_ID, Price, Gross_Area, Land_Sq_Ft, Bldg_Bathrooms, to_char(sale_date, 'YYYY-MM')";
        query +=                                         "FROM Sale S, Parcel P, Building B, Subject";
        query +=                                         "WHERE P.Parcel_ID = B.Parcel_ID AND P.Parcel_ID = S.Parcel_ID";
        query +=                                         "AND Land_SQ_FT BETWEEN (0.8*Subject.L) AND (1.2*Subject.L)";
        query +=                                         "AND Gross_Area BETWEEN (0.8*Subject.SF) AND (1.2*Subject.SF)";
        query +=                                         "AND Bldg_Actyrblt BETWEEN (Subject.yrblt-5) AND (Subject.yrblt+5)";
        query +=                                         "AND Site_Zip = Subject.Zip";
        query +=                                         "AND Price > 0)";
        // The actual query itself                                
        query += "SELECT (SUM(Si - 37*(SF-SFi) + 0.14*(L-Li) + (0.10*Si)*(B-Bi) + 1000*(15*G +11*P + 3*F))/Count(*)) as Value, chardate";
        query += "FROM Comparables, Subject, SubjectSub";
        query += "GROUP BY chardate";
        query += "ORDER BY chardate ASC;";
        
    }
    else if (req.url == "/Sinkhole"){
        h1 = "Sinkhole Damages";
        h2 = "How does the prescence of a sinkhole affect the sale price of nearby properties?";

        // The average sale prices and dates of sales where the property itself does not have a sinkhole, but another property in the neighborhood does
        query = "WITH Neighborhood(mu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM')";
        query +=        "from Parcel NATURAL JOIN Land NATURAL JOIN Sale";
        query +=                "where sinkhole_status is NULL";
        query +=                "and neighborhood_code IN (select distinct neighborhood_code";
        query +=                                          "from parcel NATURAL JOIN Land";
        query +=                                          "where sinkhole_status is not NULL)";
        query +=                "GROUP BY to_char(sale_date, 'YYYY-MM')),";
        // The average price in the zip code, regardless of sinkhole status
        query += "ZipCode (nu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM')"; 
        query +=                   "from Parcel NATURAL JOIN Land NATURAL JOIN Sale";
        query +=                   "GROUP BY to_char(sale_date, 'YYYY-MM'))";

        // The percent difference between sale prices in the affected neighborhood and the zipcode in general     
        query += "select (1-((mu - nu)/mu)) as Percent Difference,cdate as Date";
        query += "from Neighborhood NATURAL JOIN ZipCode";
        query += "order by cdate;";

    }

    // Code to connect to the oracle db    
        const { outFormat } = require('oracledb');
        const oracledb = require('oracledb');

        try {
        //oracledb.initOracleClient({libDir:'/oracle/instantclient_21_3'});
        //console.log("Successful");
        async function run(){
            let connection;
            try {
            connection = await oracledb.getConnection({
                user:"Barber.J", password: "RedCedar3", connectionString:"oracle.cise.ufl.edu/orcl"
            });
            console.log("Connected to oracle database");

            // query goes here            
            let result = await connection.execute(query, []);
            //console.log(result);
         

        // Write everything to an html file

        // Sort the query data into strings 
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

        var content = '<!DOCTYPE html> <html lang = "en"> <head> <meta charset = "UTF-8"> <meta name="viewport" content="width=device-width, initial-scale = 1.0">';
        content += '<meta http-equiv="X-UA-Compatible" content="ie=edge"> <script src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.6.0/chart.min.js"></script>';
        content += '<link rel = "stylesheet" href = "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">';
        content += '<title>Document</title> </head> <body> <h1>';
        content += h1;
        content += '</h1><div class = "container"> <canvas id = "myChart"></canvas> </div>';
        content += '<script> let myChart = document.getElementById(\'myChart\').getContext(\'2d\'); ';
        content += 'let massPopChart = new Chart(myChart,{type:\'bar\', data:{labels:[';
        content += yAxis;
        content += '], datasets:[{label:\'Population\', data:[';
        content += xAxis;
        content += ']}],backgroundColor:\'rgba(255,99,132,0.6)\'},options:{}});</script></body></html>';

        fs.writeFile('middle.html', content, err => {
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

    // pipe to html
    var myReadStream = fs.createReadStream(__dirname + '/middle.html', 'utf8');
    myReadStream.pipe(res);
})

server.listen(1337);