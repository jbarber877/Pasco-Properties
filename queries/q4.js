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
