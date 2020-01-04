function createNodeLink(){
  function zoom() {
        /*svg.attr('transform', 'translate(' + (width-width/d3.event.transform.x)/2 + ',' + (height-height/d3.event.transform.y)/2 + ') scale(' + d3.event.transform.k + ')')
          .attr("width", width/d3.event.transform.k)
          .attr("height", height/d3.event.transform.k);*/
        svg.attr('transform', 'scale(' + d3.event.transform.k + ')')
        //svg.attr('transform', 'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')');
    
  }
  var zoomListener = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

  var width = $("#nl_content").width();
  var height = $("#drag").height()-$("#title").height()-14;

  var svg = d3.select("#nl_content").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", (-width/2)+" "+ (-height/2)+ " "+width*2+" "+height*2)
            .call(zoomListener);
            

  var color = d3.scaleLinear()
      .domain([1,4])
      .range(["#08306b","#deebf7"]);

  var attractForce = d3.forceManyBody().strength(400).distanceMax(100)
                       .distanceMin(40);
  var repelForce = d3.forceManyBody().strength(-500).distanceMax(100)
                     .distanceMin(40);

  var simulation = d3.forceSimulation()
   .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(20))
   .force("attractForce",attractForce)
      .force("repelForce",repelForce)
      .force("center", d3.forceCenter(width / 2, height / 2));

  d3.json("miserables.json").then(function(data) {

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
  simulation
     .nodes(nodes)
     .on("tick", ticked);

   simulation.force("link")
     .links(links);

  links.forEach(function(link){
      // initialize a new property on the node
      if (!link.source["linkCount"]) link.source["linkCount"] = 0; 
      if (!link.target["linkCount"]) link.target["linkCount"] = 0;

      if (!link.source["linkCount2"]) link.source["linkCount2"] = 0; 

      // count it up
      //link.source["linkCount"]=link.source["linkCount"]+link.value;
      //link.target["linkCount"]=link.target["linkCount"]+link.value; 
      link.source["linkCount"]++; 
      link.target["linkCount"]++; 

      link.source["linkCount2"]++;  
    });

  var link = svg.append("g")
    .selectAll("line")
   .data(links)
   .enter().append("line")
    //.attr("stroke-width", function(d) { return Math.sqrt(d.value)*d.value; })
    .attr("class", "nl_link")
    .attr("opacity", function(d) { return d.value==0 ? 0.7 : 0.7; })
    .attr("stroke", function(d) { return d.value==0 ? "#999" : "#666611"; });


  var node = svg.selectAll(".node")
              .data(nodes)
              .enter().append("g")
              .attr("class", "nl_node")
               .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
              
  node.append("circle")
        .attr("r", function(d){
          return d.group>0 ? 4 :  d.linkCount+3; //<-- some function to determine radius
        })
        .attr("fill", function(d) { return d.group==0 ? "rgb(79, 110, 154)" : d.type==1 ? "#d6616b" : d.type==2 ? "#ffaa33" : d.type==3 ? "#ffff00" : "#99dd66"; });
        //.attr("fill", function(d) { return d.group>0 ? color(d.linkCount) : "#d6616b"; });

   var text = node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .attr("font-size", function(d) { return d.group==1 ? "8px" : "8px"; })
        .attr("font-weight", function(d) { return d.group==1 ? "normal" : "normal"; })
        .attr("font-style", function(d) { return d.group==1 ? "italic" : "normal"; })
        .text(function(d) { return d.group==0 ? d.id : ""; }); 
        //.text(function(d) { return d.group==1 ? d.linkCount>=1 ? "" : d.id : d.id; }); 


  node.append("title")
        .text(function(d) { return d.id; });


   function ticked() {
     link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });
     }
   });

   function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    }

   function dragged(d) {
     d.fx = d3.event.x;
     d.fy = d3.event.y;
   }

   function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
   }
}