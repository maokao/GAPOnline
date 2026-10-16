function createTreeJSON(currentNode, leftnode, rightnode, hgt, order, nrow)
{
    var children=[];
    var ent={};
    ent.name=currentNode;


    if(currentNode<nrow)
        ent.height=0;
    else
    {
        ent.height=hgt[currentNode-nrow];
        //console.log(currentNode+","+(currentNode-nrow)+":"+hgt[currentNode-nrow]);
    }

    if(currentNode>=nrow) 
    {
        children.push(createTreeJSON(leftnode[currentNode-nrow], leftnode, rightnode, hgt, order, nrow));
        children.push(createTreeJSON(rightnode[currentNode-nrow], leftnode, rightnode, hgt, order, nrow));
        ent.children=children;
    }

    if(currentNode<nrow)
        ent.order=order[currentNode];
    else
        ent.order=children[0].order;

    return ent;
    //JSON.Stringify(ent);  

}


function drawRowTree(data2, nowID, rowTreeX, rowTreeY, mode, heatmapId) {
    //var nowID = "rowTree";
    //var rowTreeX = 1000;
    //var rowTreeY = 0;
    //
    // ************** Generate the tree diagram  *****************
    var height = row_number*cellHeight,
        width = height/3;

    //
    /*
    var svg = d3.select('#container').append('svg')
      .attr('width', width + 300)
      .attr('height', height + 60)
      .append('g')
        .attr('transform', 'translate(30,30)');*/
    var svg = d3.select("#heatmap").select("svg").select("#gap");

     //var root_node = d3.hierarchy(colorCluster.tree());
     //console.log(colorCluster.tree());
    var root_node = d3.hierarchy(data2);
    console.log("root_node");
    console.log(root_node);
    var cluster = d3.cluster()
      .size([height, width])
      .separation(function separation(a, b) {
        return a.parent == b.parent ? 1 : 1;
    });


    //function update(source) {
      //var nodes = cluster(root_node.sum(function(d) { return d.value; })
       // .sort(function(a, b) { return b.height - a.height || b.value - a.value; }));
    var nodes = cluster(root_node
        .sort(function(a, b) { return d3.ascending(a.data.order, b.data.order); }));
    var links = nodes.links();
    /*
        console.log("clustered nodes");
        console.log(nodes);
        console.log("clustered nodes (leaves)");
        console.log(nodes.leaves());
        console.log("clustered nodes (ancestors)"); // from root
        console.log(nodes.ancestors());
        console.log("clustered nodes (descendants)"); // from root
        console.log(nodes.descendants());
        console.log("clustered links");
        console.log(links);
    */
    var x = d3.scaleLinear()
        .domain(d3.extent(nodes.descendants(), function(d) { return d.data.height; }))
        .range([width, 0]);

      // http://bl.ocks.org/mbostock/2429963
    var elbow = function (d, i) {
        return "M" + (width-x(d.source.data.height)) + "," + d.source.x
          + "V" + d.target.x + "H" + (width-x(d.target.data.height));
    };

    if(!firstRunRowTree && mode == 0)
        d3.selectAll("#"+nowID).remove();

    var rowTreeSvg = svg.append("g")
        .attr("id", nowID)
        .attr("class", nowID)
        .attr("x", rowTreeX)
        .attr("y", rowTreeY)
        .attr("transform", function(d, i) {
            return "translate(" + rowTreeX + "," + rowTreeY + ")"; 
        });
                //.selectAll('.link')
    var link = rowTreeSvg.selectAll('.link')
        .data(links)
        .enter().append('path')
          .attr('class', 'link')
          .attr('id', function(d) { return "path_"+d.source.data.name; })
          .attr('stroke', '#AAA')
          .attr('stroke-width', '1.0px')
          .attr('d', elbow);

    /*  var node = svg.append("g")
                .attr("id", nowID)
                .attr("class", nowID)
                .attr("x", 500)
                .attr("y", 500)
                .selectAll('.node')    */
    var node = rowTreeSvg.selectAll('.node')
        .data(nodes.descendants())
        .enter().append('g')
          .attr('class', 'node')
          .attr('transform', function(d) { return 'translate('+(width-x(d.data.height))+','+d.x+')'; });

    registerTree(mode, root_node, width, height, x, rowTreeSvg);

    node.append('circle')
        .style('stroke', 'none')
        .style('fill', '#777')
        .attr('r', function(d) { return d.children ? 1.5 : 0 })
        .on('mouseover', function () {
          d3.select(this)
            .style('fill', '#f00');
        })
        .on('mouseleave', function () {
          d3.select(this)
            .style('fill', '#777');
        })
        .on('dblclick', function (d) {;
          var subtree = d.children[0];
          d.children[0] = d.children[1];
          d.children[1] = subtree;
          update();
        })
        .on('click', function (d) {
          selectSubTree(d, mode);
          //update();
        });
    /*
      node.append('text')
        .attr('dx', -18)
        .attr('dy', 2)
        .text(function(d) { return d.children ? '' : d.data.name; });
        */
    //}

    function update() {

          //nodes = null;
        nodes = cluster(root_node);

          //links = nodes.links();
        var node_update = d3.select("#rowTree").selectAll('.node');
          //var t = svg1.transition().duration(1000);

        var x_update = d3.scaleLinear()
            .domain(d3.extent(nodes.descendants(), function(d) { return d.data.height; }))
            .range([width, 0]);

          // http://bl.ocks.org/mbostock/2429963
        var elbow_update = function (d, i) {
            return "M" + (width-x(d.source.data.height)) + "," + d.source.x
              + "V" + d.target.x + "H" + (width-x(d.target.data.height));
        };
        node_update.data(nodes.descendants())
            .attr('transform', function(d) { console.log(d.data.name+":"+(width-x_update(d.data.height))+','+d.x); return 'translate('+(width-x_update(d.data.height))+','+d.x+')'; });
          
        var link1 = d3.select("#rowTree").selectAll('.link')
        link1.data(links)
            .attr('d', elbow);

        var circle1 = node_update.selectAll('circle')
          //.attr('r', function(d) { return d.children ? 10.5 : 15 });
          
        circle1.remove();
          
        node_update.append('circle')
            .style('stroke', 'none')
            .style('fill', function(d) { return d.position ? 'rgb('+d.position.join(',')+')' : '#777'; })
            .attr('r', function(d) { return d.children ? 1.5 : 0 })
            .on('mouseover', function () {
              d3.select(this)
                .style('fill', function(d) { return d.position ? 'rgb('+d.position.join(',')+')' : '#f00'; });
            })
            .on('mouseleave', function () {
              d3.select(this)
                .style('fill', function(d) { return d.position ? 'rgb('+d.position.join(',')+')' : '#777'; });
            })
            .on('dblclick', function (d) {
              var subtree = d.children[0];
              d.children[0] = d.children[1];
              d.children[1] = subtree;
              
              update();
            })
            .on('click', function (d) {
              selectSubTree(d, mode);
              //update();
            });
        
      /*
      var text_update = node_update.selectAll('text')
      text_update.remove();
      
      node_update.append('text')
        .attr('dx', -18)
        .attr('dy', 2)
        .text(function(d) { return d.children ? '' : d.data.name; });
        */

        applyTreeCut(mode);

        console.log("clustered nodes");
        console.log(nodes);
        console.log("clustered nodes (leaves)");
        console.log(nodes.leaves());
        console.log("clustered nodes (ancestors)"); // from root
        console.log(nodes.ancestors());
        console.log("clustered nodes (descendants)"); // from root
        console.log(nodes.descendants());
        console.log("clustered links");
        console.log(links);
    }

}

function drawColTree(data2, nowID, colTreeX, colTreeY, mode, heatmapId) {

    // ************** Generate the tree diagram  *****************
    var height = col_number*cellWidth,
        width = height/3;

    var svg = d3.select("#heatmap").select("svg").select("#gap");

    var root_node = d3.hierarchy(data2);
    console.log("root_node");
    console.log(root_node);
    var cluster = d3.cluster()
      .size([height, width])
      .separation(function separation(a, b) {
        return a.parent == b.parent ? 1 : 1;
    });

    var nodes = cluster(root_node
        .sort(function(a, b) { return d3.ascending(a.data.order, b.data.order); }));
    var links = nodes.links();

    var x = d3.scaleLinear()
        .domain(d3.extent(nodes.descendants(), function(d) { return d.data.height; }))
        .range([width, 0]);

    var elbow = function (d, i) {
        return "M" + (width-x(d.source.data.height)) + "," + d.source.x
          + "V" + d.target.x + "H" + (width-x(d.target.data.height));
    };

    if(!firstRunColTree && mode == 1)
        d3.selectAll("#"+nowID).remove();

    var colTreeSvg = svg.append("g")
        .attr("id", nowID)
        .attr("class", nowID)
        .attr("x", colTreeX)
        .attr("y", colTreeY)
        .attr("transform", function(d, i) {
            return "translate(" + colTreeX + "," + colTreeY + ")"; 
        });
                //.selectAll('.link')
    var link = colTreeSvg.selectAll('.link')
        .data(links)
        .enter().append('path')
          .attr('class', 'link')
          .attr('id', function(d) { return "path_"+d.source.data.name; })
          .attr('stroke', '#AAA')
          .attr('stroke-width', '1.0px')
          .attr('d', elbow);

    /*  var node = svg.append("g")
                .attr("id", nowID)
                .attr("class", nowID)
                .attr("x", 500)
                .attr("y", 500)
                .selectAll('.node')    */
    var node = colTreeSvg.selectAll('.node')
        .data(nodes.descendants())
        .enter().append('g')
          .attr('class', 'node')
          .attr('transform', function(d) { return 'translate('+(width-x(d.data.height))+','+d.x+')'; });

    registerTree(mode, root_node, width, height, x, colTreeSvg);

    node.append('circle')
        .style('stroke', 'none')
        .style('fill', '#777')
        .attr('r', function(d) { return d.children ? 1.5 : 0 })
        .on('mouseover', function () {
          d3.select(this)
            .style('fill', '#f00');
        })
        .on('mouseleave', function () {
          d3.select(this)
            .style('fill', '#777');
        })
        .on('dblclick', function (d) {;
          var subtree = d.children[0];
          d.children[0] = d.children[1];
          d.children[1] = subtree;
          update();
        })
        .on('click', function (d) {
          selectSubTree(d, mode);
          //update();
        });


    function update() {

        nodes = cluster(root_node);

        var node_update = d3.select("#colTree").selectAll('.node');

        var x_update = d3.scaleLinear()
            .domain(d3.extent(nodes.descendants(), function(d) { return d.data.height; }))
            .range([width, 0]);

        var elbow_update = function (d, i) {
            return "M" + (width-x(d.source.data.height)) + "," + d.source.x
              + "V" + d.target.x + "H" + (width-x(d.target.data.height));
        };
        node_update.data(nodes.descendants())
            .attr('transform', function(d) { console.log(d.data.name+":"+(width-x_update(d.data.height))+','+d.x); return 'translate('+(width-x_update(d.data.height))+','+d.x+')'; });
          
        var link1 = d3.select("#colTree").selectAll('.link')
        link1.data(links)
            .attr('d', elbow);

        var circle1 = node_update.selectAll('circle')
          //.attr('r', function(d) { return d.children ? 10.5 : 15 });
          
        circle1.remove();
          
        node_update.append('circle')
            .style('stroke', 'none')
            .style('fill', function(d) { return d.position ? 'rgb('+d.position.join(',')+')' : '#777'; })
            .attr('r', function(d) { return d.children ? 1.5 : 0 })
            .on('mouseover', function () {
              d3.select(this)
                .style('fill', function(d) { return d.position ? 'rgb('+d.position.join(',')+')' : '#f00'; });
            })
            .on('mouseleave', function () {
              d3.select(this)
                .style('fill', function(d) { return d.position ? 'rgb('+d.position.join(',')+')' : '#777'; });
            })
            .on('dblclick', function (d) {
              var subtree = d.children[0];
              d.children[0] = d.children[1];
              d.children[1] = subtree;
              
              update();
            })
            .on('click', function (d) {
              selectSubTree(d, mode);
              //update();
            });
        
      /*
      var text_update = node_update.selectAll('text')
      text_update.remove();
      
      node_update.append('text')
        .attr('dx', -18)
        .attr('dy', 2)
        .text(function(d) { return d.children ? '' : d.data.name; });
        */

        applyTreeCut(mode);

        console.log("clustered nodes");
        console.log(nodes);
        console.log("clustered nodes (leaves)");
        console.log(nodes.leaves());
        console.log("clustered nodes (ancestors)"); // from root
        console.log(nodes.ancestors());
        console.log("clustered nodes (descendants)"); // from root
        console.log(nodes.descendants());
        console.log("clustered links");
        console.log(links);
    }

}

function selectSubTree(d, mode) {
    if(mode == 0)
    {
        recolorTreeLinks(0);
        changeRowPathColor(d);   
    }
    else
    {
        recolorTreeLinks(1);
        changeColPathColor(d);    
    }

    
}

function changeRowPathColor(d) {

    var children = d.children;
    //console.log(d); 
    if(children){
        d3.select("#rowTree").selectAll('path#path_'+d.data.name)
            //d3.selectAll('path#'+d.data.name+".link")
            //d3.selectAll('#'+d.data.name)
            //svg.selectAll('path').selectAll(d.data.name)
            .attr('stroke', function(a) { return a.source.data.name==d.data.name ? '#f00' : '#AAA';});             
    }
    else
        console.log(d.data.name); 
    
    if (children) children.forEach(changeRowPathColor);

}

function changeColPathColor(d) {

    var children = d.children;
    //console.log(d); 
    if(children){
        d3.select("#colTree").selectAll('path#path_'+d.data.name)
            //d3.selectAll('path#'+d.data.name+".link")
            //d3.selectAll('#'+d.data.name)
            //svg.selectAll('path').selectAll(d.data.name)
            .attr('stroke', function(a) { return a.source.data.name==d.data.name ? '#f00' : '#AAA';});             
    }
    else
        console.log(d.data.name); 
    
    if (children) children.forEach(changeColPathColor);

}




//#########################################################
// HCT tree cut: the user picks a cut height (slider, k, or by dragging the
// dashed line on the tree). Every subtree below the cut is a cluster and is
// coloured with the GAP rainbow palette (clusters numbered top -> bottom).
//#########################################################
var treeCut = [ { enabled: false, h: null, k: 2 },     // 0 = row tree
                { enabled: false, h: null, k: 2 } ];   // 1 = column tree
var gapTrees = [ null, null ];
var treeClusters = [ null, null ];   // per side: { leafIndex: clusterNo (1..k) }
var CUT_SIDES = [ "row", "col" ];

function treeIsShown(mode) {
    var T = gapTrees[mode];
    return !!(T && T.g && T.g.node() && document.body.contains(T.g.node()));
}

function registerTree(mode, root, width, height, xScale, g) {
    var hs = root.descendants().map(function(d) { return d.data.height; });
    gapTrees[mode] = { root: root, width: width, height: height, x: xScale, g: g,
                       minH: d3.min(hs), maxH: d3.max(hs),
                       internalHeights: root.descendants().filter(function(d) { return d.children; })
                                            .map(function(d) { return d.data.height; })
                                            .sort(function(a, b) { return b - a; }) };
    // a new tree (new proximity / linkage / zoom): keep the requested number of clusters
    treeCut[mode].h = heightForK(mode, treeCut[mode].k);
    applyTreeCut(mode);
}

// cut height that yields k clusters (midway between consecutive merge heights)
function heightForK(mode, k) {
    var T = gapTrees[mode];
    if (!T) return null;
    var H = T.internalHeights, n = H.length + 1;
    k = Math.max(1, Math.min(n, Math.round(k)));
    if (k == 1) return T.maxH;
    var upper = H[k - 2], lower = (k - 1 < H.length) ? H[k - 1] : T.minH;
    return (upper + lower) / 2;
}

function clusterColor(i, k) {
    var interp = d3.piecewise(d3.interpolateRgb, GAP_Rainbow);   // dark blue -> dark red
    return interp(k <= 1 ? 0 : i / (k - 1));
}

// compute clusters for the current cut and store their colours on the nodes
function computeClusters(mode) {
    var T = gapTrees[mode], st = treeCut[mode];
    T.root.each(function(d) { d.clusterColor = null; d.clusterNo = null; });
    treeClusters[mode] = null;
    if (!st.enabled || st.h === null) return 0;
    var clusters = [];
    (function walk(n) {
        if (!n.children || n.data.height <= st.h) clusters.push(n);
        else n.children.forEach(walk);
    })(T.root);
    clusters.sort(function(a, b) {
        return d3.min(a.leaves(), function(l) { return l.x; }) - d3.min(b.leaves(), function(l) { return l.x; });
    });
    var k = clusters.length, membership = {};
    clusters.forEach(function(c, i) {
        var col = clusterColor(i, k);
        c.each(function(d) { d.clusterColor = col; d.clusterNo = i + 1; });
        c.leaves().forEach(function(l) { membership[l.data.name] = i + 1; });
    });
    treeClusters[mode] = membership;
    return k;
}

function recolorTreeLinks(mode) {
    if (!treeIsShown(mode)) return;
    gapTrees[mode].g.selectAll('.link')
        .attr('stroke', function(l) { return l.target.clusterColor || '#AAA'; })
        .attr('stroke-width', function(l) { return l.target.clusterColor ? '1.5px' : '1.0px'; });
}

function applyTreeCut(mode) {
    refreshClusterLines();
    if (!treeIsShown(mode)) { updateCutControls(mode); return; }
    var T = gapTrees[mode], st = treeCut[mode];
    var k = computeClusters(mode);
    recolorTreeLinks(mode);

    var cut = T.g.select('.treeCut');
    if (!st.enabled) {
        cut.remove();
        updateCutControls(mode);
        return;
    }
    if (cut.empty()) {
        cut = T.g.append('g').attr('class', 'treeCut').style('cursor', 'ew-resize');
        cut.append('line').attr('class', 'treeCutLine')
            .attr('stroke', '#333').attr('stroke-width', 1.2).attr('stroke-dasharray', '4,3');
        cut.append('line').attr('class', 'treeCutHit')          // wide invisible handle for dragging
            .attr('stroke', 'transparent').attr('stroke-width', 9);
        cut.append('text').attr('class', 'treeCutLabel')
            .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#333');
        cut.call(d3.drag()
            .on('start', function() { if (d3.event.sourceEvent) d3.event.sourceEvent.stopPropagation(); })
            .on('drag', function() {
                var TT = gapTrees[mode];
                var pos = Math.max(0, Math.min(TT.width, d3.event.x));
                treeCut[mode].h = TT.x.invert(TT.width - pos);
                applyTreeCut(mode);
            }));
    }
    var px = T.width - T.x(Math.max(T.minH, Math.min(T.maxH, st.h)));
    cut.selectAll('line').attr('x1', px).attr('x2', px).attr('y1', -4).attr('y2', T.height + 4);
    cut.select('.treeCutLabel').attr('x', px).attr('y', -7).text('k = ' + k);
    cut.raise();
    updateCutControls(mode, k);
}

function updateCutControls(mode, k) {
    var side = CUT_SIDES[mode], st = treeCut[mode], shown = treeIsShown(mode);
    var $en = $('#' + side + 'CutEnable'), $k = $('#' + side + 'CutK'), $h = $('#' + side + 'CutHeight');
    $en.prop('disabled', !shown).prop('checked', st.enabled);
    $k.prop('disabled', !shown || !st.enabled);
    $h.prop('disabled', !shown || !st.enabled);
    if (!shown) {
        $('#' + side + 'CutInfo').text('Run a linkage ordering first.');
        return;
    }
    var T = gapTrees[mode];
    $k.attr('max', T.internalHeights.length + 1);
    if (st.enabled && st.h !== null) {
        var frac = (T.maxH > T.minH) ? (st.h - T.minH) / (T.maxH - T.minH) : 1;
        $h.val(Math.round(Math.max(0, Math.min(1, frac)) * 1000));
        if (k !== undefined) { $k.val(k); st.k = k; }
        $('#' + side + 'CutInfo').text('height = ' + (+st.h).toFixed(4) + ', ' + (k !== undefined ? k : '') + ' cluster(s)');
    } else {
        $('#' + side + 'CutInfo').text('Tree height: ' + (+T.minH).toFixed(3) + ' - ' + (+T.maxH).toFixed(3));
    }
}

// reset when a new data file is loaded
function resetTreeCuts() {
    sufficientOn = false;
    for (var m = 0; m < 2; m++) {
        gapTrees[m] = null; treeClusters[m] = null;
        treeCut[m].h = null;
        updateCutControls(m);
    }
}

// "Export -> Clusters": one text file per tree that has been cut (in display order)
function exportClusters(filename) {
    var base = (typeof exportBaseName === 'function') ? exportBaseName(filename) : 'GAP';
    var done = 0;
    [[0, row_name, 'row'], [1, col_name, 'col']].forEach(function(t) {
        var m = t[0], names = t[1], memb = treeClusters[m];
        if (!memb || !treeIsShown(m)) return;
        var order = (m == 0) ? rowCurrentOrder : colCurrentOrder;
        var lines = ['name\tcluster'];
        for (var i = 0; i < order.length; i++) {
            var idx = order[i];
            lines.push(names[idx] + '\t' + memb[idx]);
        }
        saveTextAsFile(lines.join('\n') + '\n', base + '_' + t[2] + '_clusters.txt');
        done++;
    });
    if (done == 0) alert('No clusters to export: run a linkage ordering and turn on the tree cut under "Clusters" first.');
}

$(function() {
    CUT_SIDES.forEach(function(side, mode) {
        $('#' + side + 'CutEnable').on('change', function() {
            treeCut[mode].enabled = this.checked;
            if (this.checked) treeCut[mode].h = heightForK(mode, +$('#' + side + 'CutK').val() || 2);
            applyTreeCut(mode);
        });
        $('#' + side + 'CutK').on('change', function() {
            var k = +this.value;
            if (!(k >= 1)) return;
            treeCut[mode].k = k;
            treeCut[mode].h = heightForK(mode, k);
            applyTreeCut(mode);
        });
        $('#' + side + 'CutHeight').on('input change', function() {
            var T = gapTrees[mode];
            if (!T) return;
            treeCut[mode].h = T.minH + (T.maxH - T.minH) * (+this.value) / 1000;
            applyTreeCut(mode);
        });
    });
    $('#saveClusters').on('click', function(e) {
        e.preventDefault();
        exportClusters(typeof exportFileName !== 'undefined' ? exportFileName : '');
    });
});


//#########################################################
// Cluster separator lines on the heatmaps
// When a row/column tree is cut, a thin line is drawn between neighbouring
// clusters on every heatmap that shares that ordering:
//   row clusters    -> data matrix, row proximity (both directions), Y covariates
//   column clusters -> data matrix, column proximity (both directions), X covariates
//#########################################################
var clusterLineStyle = { show: true, color: "#FF00FF", width: 0.5 };   // default rgb(255,0,255), 0.5px
var _clusterLineTimer = null;

// deferred so that it runs after the current reordering / redraw has finished
function refreshClusterLines() {
    if (_clusterLineTimer) clearTimeout(_clusterLineTimer);
    _clusterLineTimer = setTimeout(function() { _clusterLineTimer = null; drawClusterLines(); }, 0);
}

// positions (1..n-1) in the current display order where a new cluster starts
function clusterBoundaries(mode) {
    var memb = treeClusters[mode];
    if (!memb || !treeIsShown(mode) || !treeCut[mode].enabled) return [];
    var order = (mode == 0) ? rowCurrentOrder : colCurrentOrder;
    var n = (mode == 0) ? row_number : col_number;
    if (!order || order.length != n) return [];
    var b = [], seen = {}, prev = memb[order[0]];
    seen[prev] = true;
    for (var p = 1; p < n; p++) {
        var c = memb[order[p]];
        if (c === undefined) return [];
        if (c !== prev) {
            if (seen[c]) return [];          // clusters not contiguous in this order (e.g. sorted by a label)
            seen[c] = true; b.push(p); prev = c;
        }
    }
    return b;
}

function drawClusterLines() {
    var gap = d3.select("#heatmap").select("svg").select("#gap");
    if (gap.empty()) return;
    if (typeof scheduleSufficient === "function") scheduleSufficient();
    gap.select("#clusterLines").remove();
    if (!clusterLineStyle.show) return;
    var rowB = clusterBoundaries(0), colB = clusterBoundaries(1);
    if (rowB.length == 0 && colB.length == 0) return;

    var g = gap.append("g").attr("id", "clusterLines").style("pointer-events", "none");
    function origin(id) {
        var m = gap.select("#" + id);
        if (m.empty()) return null;
        return [parseFloat(m.attr("x")) || 0, parseFloat(m.attr("y")) || 0];
    }
    function hline(o, y, len) {
        g.append("line").attr("x1", o[0]).attr("x2", o[0] + len).attr("y1", o[1] + y).attr("y2", o[1] + y);
    }
    function vline(o, x, len) {
        g.append("line").attr("x1", o[0] + x).attr("x2", o[0] + x).attr("y1", o[1]).attr("y2", o[1] + len);
    }
    var o;
    // row clusters: horizontal lines
    if (rowB.length) {
        rowB.forEach(function(p) {
            if ((o = origin("mv")))   hline(o, p * cellHeight, col_number * cellWidth);
            if ((o = origin("mv2")))  { hline(o, p * cellHeight, row_number * cellHeight);
                                        vline(o, p * cellHeight, row_number * cellHeight); }
            if (yd > 0 && (o = origin("mv11"))) hline(o, p * cellHeight, yd * ycov_cellWidth);
            if (yc > 0 && (o = origin("mv12"))) hline(o, p * cellHeight, yc * ycov_cellWidth);
        });
    }
    // column clusters: vertical lines
    if (colB.length) {
        colB.forEach(function(p) {
            if ((o = origin("mv")))   vline(o, p * cellWidth, row_number * cellHeight);
            if ((o = origin("mv3")))  { vline(o, p * cellWidth, col_number * cellWidth);
                                        hline(o, p * cellWidth, col_number * cellWidth); }
            if (xd > 0 && (o = origin("mv13"))) vline(o, p * cellWidth, xd * xcov_cellHeight);
            if (xc > 0 && (o = origin("mv14"))) vline(o, p * cellWidth, xc * xcov_cellHeight);
        });
    }
    g.selectAll("line")
        .attr("stroke", clusterLineStyle.color)
        .attr("stroke-width", clusterLineStyle.width);
}

$(function() {
    $('#clusterLineShow').on('change', function() {
        clusterLineStyle.show = this.checked;
        drawClusterLines();
    });
    $('#clusterLineColor').on('input change', function() {
        clusterLineStyle.color = this.value;
        d3.select("#clusterLines").selectAll("line").attr("stroke", this.value);
    });
});


//#########################################################
// "Sufficient" display
// When the row and/or column tree is cut, every block (row cluster x column
// cluster) of the data matrix and of the proximity matrices is painted with the
// colour of its mean value. "Restore" puts the original cell colours back.
//   data matrix      : row clusters x column clusters (a side without a cut keeps single rows / columns)
//   row proximity    : row clusters x row clusters
//   column proximity : column clusters x column clusters
// Diagonal blocks of a proximity matrix are averaged without the diagonal
// (self-proximities), except for one-member clusters.
// The current colour settings (palette, reverse, Range sliders, Display
// Condition) are used; for "Range: Row / Column" each cell is first normalised
// with its own row / column range, then averaged.
//#########################################################
var sufficientOn = false;
var _sufficientTimer = null;

// called from drawClusterLines(); the second pass runs after colour transitions (500 ms) finish
function scheduleSufficient() {
    applySufficient();
    if (_sufficientTimer) clearTimeout(_sufficientTimer);
    _sufficientTimer = setTimeout(function() { _sufficientTimer = null; applySufficient(); }, 650);
}

function _suffSettings(map) {
    if (map == "rawdata") return { palette: rdPalette, rev: rdPaletteReverse,
        lo1: rdminInputRange1, hi1: rdmaxInputRange1, lo2: rdminInputRange2, hi2: rdmaxInputRange2 };
    if (map == "rp") return { palette: rpPalette, rev: rpPaletteReverse,
        lo1: rpminInputRange1, hi1: rpmaxInputRange1, lo2: rpminInputRange2, hi2: rpmaxInputRange2 };
    return { palette: cpPalette, rev: cpPaletteReverse,
        lo1: cpminInputRange1, hi1: cpmaxInputRange1, lo2: cpminInputRange2, hi2: cpmaxInputRange2 };
}

// t in [0,1] for the interpolator, same mapping as changePalette(): domain [hi, lo] (or [lo, hi] when reversed)
function _suffT(v, lo, hi, rev) {
    if (!(hi > lo)) return 0.5;
    var t = rev ? (v - lo) / (hi - lo) : (hi - v) / (hi - lo);
    return Math.max(0, Math.min(1, t));
}

function _groupsOf(mode, n) {
    // cluster number per original index (or the index itself when that side is not cut)
    var memb = (treeIsShown(mode) && treeCut[mode].enabled) ? treeClusters[mode] : null;
    var g = new Array(n);
    for (var i = 0; i < n; i++) g[i] = memb ? ("c" + memb[i]) : ("s" + i);
    return { key: g, isCut: !!memb };
}

function _paintBlocks(matrixId, values, rowKey, colKey, settings, perCellRange, isProx) {
    var cells = d3.select("#gap").select("#" + matrixId).selectAll(".cell");
    if (cells.empty()) return;
    var interp = getColorID(settings.palette);
    // 1) accumulate the normalised value (t) of every cell in its block
    var sum = {}, cnt = {}, diagSum = {}, diagCnt = {};
    for (var r = 0; r < values.length; r++) {
        for (var c = 0; c < values[r].length; c++) {
            var v = values[r][c];
            if (v === null || v === undefined || isNaN(v)) continue;
            var lo = settings.lo2, hi = settings.hi2;
            if (perCellRange) { var rg = perCellRange(r, c); lo = rg[0]; hi = rg[1]; }
            var t = _suffT(v, lo, hi, settings.rev);
            var key = rowKey[r] + "|" + colKey[c];
            if (isProx && r == c) { diagSum[key] = (diagSum[key] || 0) + t; diagCnt[key] = (diagCnt[key] || 0) + 1; continue; }
            sum[key] = (sum[key] || 0) + t; cnt[key] = (cnt[key] || 0) + 1;
        }
    }
    // 2) paint
    cells.each(function() {
        var r = +this.getAttribute("row"), c = +this.getAttribute("col");
        var key = rowKey[r] + "|" + colKey[c];
        var t = null;
        if (cnt[key]) t = sum[key] / cnt[key];
        else if (diagCnt[key]) t = diagSum[key] / diagCnt[key];
        var fill = (t === null) ? "url(#diagonalHatch)" : interp(t);
        var cur = this.style.fill;
        // remember the original colour unless the cell still shows our own colour
        if (!this.__suff || cur !== this.__suffFill) this.__origFill = cur;
        this.style.fill = fill;
        this.__suff = true;
        this.__suffFill = this.style.fill;   // normalised by the browser
    });
}

function _restoreBlocks(matrixId) {
    d3.select("#gap").select("#" + matrixId).selectAll(".cell").each(function() {
        if (this.__suff) {
            if (this.style.fill === this.__suffFill) this.style.fill = this.__origFill;
            this.__suff = false;
        }
    });
}

function applySufficient() {
    var gap = d3.select("#heatmap").select("svg").select("#gap");
    if (gap.empty()) return;
    var rowCut = treeIsShown(0) && treeCut[0].enabled && treeClusters[0];
    var colCut = treeIsShown(1) && treeCut[1].enabled && treeClusters[1];
    if (!sufficientOn || (!rowCut && !colCut)) {
        if (!rowCut && !colCut) sufficientOn = false;   // no clusters any more -> back to normal display
        ["mv", "mv2", "mv3"].forEach(_restoreBlocks);
        updateSufficientControls();
        return;
    }
    var rg = _groupsOf(0, row_number), cg = _groupsOf(1, col_number);
    var cond = d3.select("#displaycondition").property("value");
    var perCell = null;
    if (cond == "RangeRow" || cond == "RangeCol") {
        var s = _suffSettings("rawdata");
        perCell = function(r, c) {
            var mn = (cond == "RangeRow") ? data_row_min_value[r] : data_min_value[c];
            var mx = (cond == "RangeRow") ? data_row_max_value[r] : data_max_value[c];
            return [Math.max(mn, s.lo2), Math.min(mx, s.hi2)];
        };
    }
    _paintBlocks("mv", data, rg.key, cg.key, _suffSettings("rawdata"), perCell, false);
    if (rowCut && rowProxData && rowProxData.length == row_number) _paintBlocks("mv2", rowProxData, rg.key, rg.key, _suffSettings("rp"), null, true);
    else _restoreBlocks("mv2");
    if (colCut && colProxData && colProxData.length == col_number) _paintBlocks("mv3", colProxData, cg.key, cg.key, _suffSettings("cp"), null, true);
    else _restoreBlocks("mv3");
    updateSufficientControls();
}

function updateSufficientControls() {
    var available = (treeIsShown(0) && treeCut[0].enabled) || (treeIsShown(1) && treeCut[1].enabled);
    $('#sufficientBtn').prop('disabled', !available).toggleClass('active', sufficientOn && available);
    $('#restoreBtn').prop('disabled', !sufficientOn);
    $('#sufficientInfo').text(!available ? 'Cut a row or column tree first.'
        : (sufficientOn ? 'Showing block means.' : 'Showing original values.'));
}

$(function() {
    $('#sufficientBtn').on('click', function(e) {
        e.preventDefault();
        sufficientOn = true;
        applySufficient();
    });
    $('#restoreBtn').on('click', function(e) {
        e.preventDefault();
        sufficientOn = false;
        applySufficient();
    });
    updateSufficientControls();
});
