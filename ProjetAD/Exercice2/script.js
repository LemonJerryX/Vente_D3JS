// d3.csv doesn't work with ";" separator : https://stackoverflow.com/questions/65417698/d3js-data-format
var dsv = d3.dsvFormat(";");

d3.request("ventes.csv")
    .mimeType("text/plain")
    .response(function(data) { return dsv.parse(data.response) })
    .get(function(data) {
        // ... do something with data here

        // créer un élément select avec un événement lors du changement de valeur de l'option choisie
        var selector = d3.select("#select")
            .append("select")
            .attr("id","dropdown")
            .on("change", function(dChange)
            {
                d3.select("#svg1").selectAll("*").remove();

                /*-------------------------------Graphiques------------------------------------------*/
                var critere = document.getElementById("dropdown").value;
                var dataCopy = [...data];
                var newData = dataCopy.sort(function(element1, element2)
                {
                    return parseInt(element1[critere]) > parseInt(element2[critere]) ? -1 : 1;
                }).splice(0, 10);


                d3.select("#select").data(newData);

                // décrlatation des marges et récupération des dimensions du svg: largeur et hauteur
                var margin = {top: 20, right: 20, bottom: 40, left: 55},
                    width = d3.select("#svg1").node().getBoundingClientRect().width-margin.left-margin.right,
                    height = d3.select("#svg1").node().getBoundingClientRect().height-margin.bottom-margin.top;

                // append the svg object to the body of the page
                var svg = d3.select("#svg1")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                // Add X axis
                var x = d3.scaleLinear()
                    .domain([0, d3.max(newData, function(d){ return +d[critere];})])
                    .range([0, width]);

                var abscisse = svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");

                // Y axis
                var y = d3.scaleBand()
                    .range([ 0, height ])
                    .domain(newData.map(function(d) { return " "+d["article"]; }))
                    .padding(.1);

                var ordonnees = svg.append("g")
                    .call(d3.axisLeft(y))

                // ajout du labelle de l'axe abscisse
                d3.select('svg').append("text")
                    .attr("transform", `translate(${width+60}, ${height+margin.top+30})`)
                    .style("text-anchor", "end")
                    .text(critere);

                // ajout du labelle de l'axe ordonnée
                d3.select('svg').append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 25)
                    .attr("x", -margin.top+10)
                    .style("text-anchor", "end")
                    .text("ID");

                //Bars
                var bars = svg.selectAll("rect")
                    .data(newData)
                    .enter()
                    .append("rect")
                    .attr("x", x(0) + 1.2)
                    .attr("y", function(d) { return y(" "+d["article"]); })
                    .attr("width", function(d) { return x(d[critere]); })
                    .attr("height", y.bandwidth() )
                    .attr("fill", "#69b3a2")
            });

        // création des option du select avec les en-têtes des boissons
        selector.selectAll("option")
            .data(["Quantite", "PU net"])
            .enter().append("option")
            .attr("value", function(d){
                return d;
            })
            .text(function(d){
                return d;
            });

        selector.dispatch("change");

    });
