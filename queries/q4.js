let q4 = function(zip, from, to) {
    return `select BLDG_ACTYRBLT as Year, median(LAND_SQ_FT) as Median_Lot_Size from
    BUILDING natural join PARCEL
    where BLDG_ACTYRBLT >= ${from} and BLDG_ACTYRBLT <= ${to}
    and SITE_ZIP = ${zip}
    and BLDG_ACTYRBLT is not null
    group by BLDG_ACTYRBLT
    order by BLDG_ACTYRBLT`
}

module.exports = {
    get: q4
}


 // The average sale prices and dates of sales where the property itself does not have a sinkhole, but another property in the neighborhood does
        let new_query = "WITH Neighborhood (mu, cdate) AS (select avg(price), to_char(sale_date, 'YYYY-MM') \n";
        new_query +=                                     " from Parcel NATURAL JOIN Land NATURAL JOIN Sale \n";
        new_query +=                                     " where sinkhole_status is NULL \n";
        new_query +=                                     ("AND SALE_DATE BETWEEN to_date('01/01/" + startYear + "', 'DD/MM/YYYY') and to_date('01/01/" + endYear + "', 'DD/MM/YYYY') \n");
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



query = "WITH ";
          // Gets the square footage, lot size, year built, and zip code for the subject property
          // Only 1 row will be returned, but the "Fetch first" statement is important for the join later
          query += "Subject (SF, L, B, Yrblt, ZIP) AS (SELECT Gross_Area, Land_SQ_FT, BLDG_Bathrooms, BLDG_ActyrbLT, site_Zip \n";
          query +=                                     "FROM Parcel P, Building B \n";
          query +=                                     "WHERE P.Parcel_ID = B.PARCEL_ID\n";
          query +=                                     ("AND P.Parcel_ID = " + Parcel_ID + '\n');
          query +=                                      "FETCH FIRST 1 ROWS ONLY),\n";
          // Gets the number of garages, pools and fireplaces for the subject property
          // Only 1 row will be returned, but the "Fetch first statement is important for the join later
          query += "SubjectSub (G, P, F) AS (SELECT (SELECT COUNT(*) FROM Sub_Area\n";
          query +=                                  ("WHERE Parcel_ID = " + Parcel_ID + '\n');
          query +=                                  "AND DESCRIPTION LIKE '%Garage%'),\n";
          query +=                                 "(SELECT COUNT(*) FROM Sub_Area\n";
          query +=                                  ("WHERE Parcel_ID = " + Parcel_ID + '\n');
          query +=                                  "AND DESCRIPTION LIKE '%POOL%'),\n";
          query +=                                "(SELECT COUNT(*) FROM Sub_Area\n";
          query +=                         ("WHERE Parcel_ID = " + Parcel_ID + '\n');
          query +=                         "AND DESCRIPTION LIKE '%FIREPLACE%')\n";
          query +=                 "FROM Sub_Area\n";
          query +=                 ("WHERE Parcel_ID = " + Parcel_ID + '\n');
          query +=                 "FETCH FIRST 1 ROWS ONLY),\n";
          //  Gets the parcel id, sale price, square footage, lot size, number of bathrooms, and sale date for the comparable properties                                        
          query += "Comparables (a, Si, SFi, Li, Bi, charDate) AS (SELECT P.Parcel_ID, Price, Gross_Area, Land_Sq_Ft, Bldg_Bathrooms, to_char(sale_date, 'YYYY-MM')\n";
          query +=                                 "FROM Sale S, Parcel P, Building B, Subject\n";
          query +=                                 "WHERE P.Parcel_ID = B.Parcel_ID AND P.Parcel_ID = S.Parcel_ID\n";
          query +=                                 "AND Land_SQ_FT BETWEEN (0.8*Subject.L) AND (1.2*Subject.L)\n";
          query +=                                 "AND Gross_Area BETWEEN (0.8*Subject.SF) AND (1.2*Subject.SF)\n";
          query +=                                 "AND Bldg_Actyrblt BETWEEN (Subject.yrblt-5) AND (Subject.yrblt+5)\n";
          query +=                                 "AND Site_Zip = Subject.Zip\n"
          query +=                                 "AND Price > 0)\n";                                       
                                                
          query +=      "SELECT (SUM(Si - 37*(SF-SFi) + 0.14*(L-Li) + (0.10*Si)*(B-Bi) + 1000*(15*G +11*P + 3*F))/Count(*)) as Value, charDate\n";
          query +=      "FROM Comparables, Subject, SubjectSub\n"
          query +=      "GROUP BY charDate\n";
          query +=      "ORDER BY charDate ASC\n";
