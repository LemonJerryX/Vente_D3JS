// d3.csv doesn't work with ";" separator : https://stackoverflow.com/questions/65417698/d3js-data-format
var dsv = d3.dsvFormat(";");

d3.request("ventes.csv")
    .mimeType("text/plain")
    .response(function(data) { return dsv.parse(data.response) })
    .get(function(data) {
        // traitement des date
        data.sort(function(a, b) {
            // transformation du format "DD/MM/YYYY" au format "YYYY/MM/DD"
            function formatDate(dateStr) {
                const [day, month, year] = dateStr.split("/");
                return `${year}/${month}/${day}`;
            }

            // Transformation de String date en Date date
            var dateA = new Date(formatDate(a["date"]));
            var dateB = new Date(formatDate(b["date"]));

            // 比较日期并返回结果
            return dateA - dateB;
        });


        // décrlatation des marges et récupération des dimensions du svg: largeur et hauteur
        var margin = {top: 20, right: 20, bottom: 40, left: 40},
            width = d3.select("#svg1").node().getBoundingClientRect().width-margin.left-margin.right,
            height = d3.select("#svg1").node().getBoundingClientRect().height-margin.bottom-margin.top;

        // déclaration de la fonction de passage à l'échelle pour l'abscisse
        var xScale= d3.scaleBand().domain(data.map(d => d["date"])).range([margin.left, width]);
        // déclaration de la fonction de passage à l'échelle pour l'ordonnée
        var yScale= d3.scaleLinear().domain([0, d3.max(data, d => +d["Quantite"])]).range([height, margin.top]);

        // définition du constructeur de l'axe abscisse
        var xAxis= g => g
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        // définition du constructeur de l'axe ordonnée
        var yAxis= g => g
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        // appels aux constructeurs d'axes
        d3.select('svg').append("g").call(xAxis);
        d3.select('svg').append("g").call(yAxis);

        // ajout du labelle de l'axe abscisse
        d3.select('svg').append("text")
            .attr("transform", `translate(${width}, ${height+margin.top+15})`)
            .style("text-anchor", "end")
            .text("Mois/Année");

        // ajout du labelle de l'axe ordonnée
        d3.select('svg').append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 15)
            .attr("x", -margin.top)
            .style("text-anchor", "end")
            .text("Quantité");

        // sélection vide, association de données, créaction des bars, dimensionnement et positionnement des barres selon les échelles prédéfinies
        d3.select('svg').selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .style("fill", "blue")
            .attr("y", function(d){
                return yScale(+d["Quantite"]);
            })
            .attr("height",  function(d){
                return yScale(0) - yScale(+d["Quantite"]);
            })
            .attr("width", xScale.bandwidth()-1)
            .attr("x", function(d, i) {
                return xScale(d["date"]);
            });
});
