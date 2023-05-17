// d3.csv doesn't work with ";" separator : https://stackoverflow.com/questions/65417698/d3js-data-format
var dsv = d3.dsvFormat(";");

d3.request("ventes.csv") //Importer les data à pd du fichier
    .mimeType("text/plain")
    .response(function(data) { return dsv.parse(data.response) })
    .get(function(data) {
        // ... do something with data here
        var allClients = [];
        allClients = data.filter(element => {
            if (allClients.find(client => element["client secteur1"] == client) === undefined) {
                allClients.push(element["client secteur1"]);
                return true;
            }
            return false;
        })

        var datalist = d3.select("#div_input").append("datalist")
            .attr("id", "clients");
        allClients.map(client =>
            datalist.append("option").attr("value", client["client secteur1"]));

        //console.log(allClients);

        // créer un élément 'select' avec un événement lors du changement de valeur de l'option choisie
        var input = d3.select("#input")
            .append("input")
            .attr("id","input_id_client")
            .attr("type", "text")
            .attr("list", "clients")
            .attr("autocomplete", "off")
            .on("input", function() {
                var inputValue = input.property("value");

                var indexOfValueInData = data.find(element => element["client secteur1"] == inputValue); // trouver la pos du client à pd des data
                if (indexOfValueInData != undefined) { // on a trouver bien la pos à pd des data

                    d3.select("#client").html(inputValue);





                    d3.select("#svg1").selectAll("*").remove();
                    /*-------------------------------Graphiques------------------------------------------*/
                    var dataCopy = [...data]; //C'est de préparer à trouver tous les articles de client

                    dataCopy = dataCopy.filter(element => element["client secteur1"] == inputValue);

                    dataCopy = dataCopy.sort(function (element1, element2) {    // On trier ces data par décroissant
                        return parseInt(element1["Quantite"]) > parseInt(element2["Quantite"]) ? -1 : 1;
                    });

                    //dataCopy = dataCopy.slice(0, 99); //Définir le nb de quantités des articles

                    // somme
                    //On a déjà chaque quantité de chaque client indiquée, donc on prend la colonne "Quantite" et on calcule la somme.
                    var som=0;
                    for (const element of dataCopy ) {
                        som += parseInt(element["Quantite"]);
                    }

                    d3.select("#som").html("La somme de quantités du "+inputValue+" est : "+som);


                    //Définir la taille de la fenêtre
                    var svg = d3.select("#svg1");
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
                        .domain(dataCopy.map(function(d){ return d["article"];})) //L'article choisi de chaque ligne 'd'
                        .range(['#26a65b']);

                    var root = d3.hierarchy({children: dataCopy})
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

                }

            });
    });
