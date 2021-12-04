select BLDG_ACTYRBLT as Year, median(LAND_SQ_FT) as Median_Lot_Size from
BUILDING natural join PARCEL
where BLDG_ACTYRBLT is not null
group by BLDG_ACTYRBLT
order by BLDG_ACTYRBLT