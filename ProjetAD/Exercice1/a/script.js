// d3.csv doesn't work with ";" separator : https://stackoverflow.com/questions/65417698/d3js-data-format
var dsv = d3.dsvFormat(";");

// Importer le fichier "ventes.csv"
d3.request("ventes.csv")
    .mimeType("text/plain")
    .response(function(data) { return dsv.parse(data.response) })
    .get(function(data) {
        // Le data sera sous forme : article || date || client secteur1 || Quantite || PU net

        data = data.sort(function (element1, element2) {    // On trier ces data par décroissant
            return parseInt(element1["Quantite"]) > parseInt(element2["Quantite"]) ? -1 : 1;
        });

        //Définir la taille de la fenêtre
        var svg = d3.select("svg");
        var width = +svg.attr("width");
        var height = +svg.attr("height");

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var pack = d3.pack()
            .size([width, height])
            .padding(1.5);

        // traitement des data
        var color = d3.scaleOrdinal()
            .domain(data.map(function(d){ return d["article"];})) //L'article choisi de chaque ligne 'd'
            .range(['#26a65b']);

        var root = d3.hierarchy({children: data})
            .sum(function(d) { return d["Quantite"]; })
            .sort(function(a, b) { return b["Quantite"] - a["Quantite"]; });

        var node = svg.selectAll(".node")
            .data(pack(root).leaves())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("circle")
            .attr("id", function(d) { return d.id; })
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.data["article"]); })


            .on("mouseover", function(d) {

                div.style("opacity", 1);

                //Affichage des articles et leurs quantités
                div.html("Article n°" + d.data["article"] + "<br>Nb ventes : "+d.data["Quantite"]  )
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })

            .on("mouseout", function(d) {
                div.style("opacity", 0);
            });




    });