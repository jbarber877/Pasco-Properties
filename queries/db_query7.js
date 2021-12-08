const oracledb = require('oracledb');
const fs = require('fs');
const db_query7 = function () {
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
                `SELECT ((SELECT COUNT(*) FROM Parcel) +
                (SELECT COUNT(*) FROM Building) +
                (SELECT COUNT(*) FROM Land) +
                (SELECT COUNT(*) FROM Sale))as TotalNumTuples
                FROM Sale
                FETCH FIRST 1 ROWS ONLY`
                );
                
                console.log(result.rows[0][0]);
                
                
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
module.exports = db_query7;

//db_query7();