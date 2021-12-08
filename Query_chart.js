const chart = require('chart.js');
const Query_chart = function (option, xAxis, yAxis, queryNumber) {
    
    labels = [
        `Median Lot Size (acres) for ${option}`,
        `Percentage of total Pasco County sales in zip code ${option}`,
        `Sale Prices of Non-homesteaded Properties in ${option}`,
        `Percent Difference`,
        `Selling Price of Similar House`,
        `` // TODO: add label for sixth query
    ];
    
    let html =
    `<!DOCTYPE html>
    <html lang="en">
        <head>
        </head>
        <body>
            <h1>Query Results</h1>
            <li id="return">Return</li>
            <div >
                <canvas id="myChart" responsive="true"></canvas>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
                document.getElementById("return").onclick = () => {
                    location.search = '';
                }
                const labels = [${xAxis}];
                const data = {
                labels: labels,
                datasets: [{
                    label: '${labels[queryNumber]}',
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: [${yAxis}]
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

    return html;
}
module.exports = Query_chart;