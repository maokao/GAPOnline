var dataFileName = "";
var importDataFileName = "";
var cellSize = 24;
var cellOriWidth = 24;
var cellOriHeight = 6;
var cellWidth = 24;
var cellHeight = 6;
var xcov_cellWidth = 24;    //equal cellWidth
var xcov_cellHeight = 12;
var ycov_cellWidth = 12;
var ycov_cellHeight = 6;    //equal cellHeight
var colorSpecHeight = 24;
var max_value;
var min_value;
var rp_max_value;
var rp_min_value;
var cp_max_value;
var cp_min_value;
var svg;
var row_number = 0;
var col_number = 0;
var data = [];
var rowProxData = [];
var colProxData = [];
var row_name = [];
var col_name = [];
var isRowProxfirst = true;
var isColProxfirst = true;
var hasRowName = true;
var hasColName = true;
var yN = 1;
var firstRunRowTree = true;
var firstRunColTree = true;
var rowIsSimilarity = false;
var colIsSimilarity = false;
var treeRowData;
var treeColData;
var row_output_left_array;
var row_output_right_array;
var row_output_hgt_array;
var row_output_order_array;
var col_output_left_array;
var col_output_right_array;
var col_output_hgt_array;
var col_output_order_array;
var row_r2e_order = [];
var col_r2e_order = [];
var rowOrderId = "sortinit_row";
var colOrderId = "sortinit_col";
var rowFlipId = "null";
var colFlipId = "null";
var rowCurrentOrder = [];
var colCurrentOrder = [];
var yd = 1;
var xd = 0;
var yc = 0;
var xc = 0;
var yCov = 0;
var xCov = 0;
var ydData = [];
var ycData = [];
var xdData = [];
var xcData = [];
var yd_X = 0;
var yc_X = 0;
var xd_Y = 0;
var xc_Y = 0;
var yd_max_value = [];
var yd_min_value = [];
var yd_cate_col = [];
var yc_max_value = [];
var yc_min_value = [];
var xd_max_value = [];
var xd_min_value = [];
var xd_cate_col = [];
var xc_max_value = [];
var xc_min_value = [];
var data_max_value = [];
var data_min_value = [];
var data_row_max_value = [];
var data_row_min_value = [];
var viewerPosTop = 200;
var viewerPosLeft = 100;
var optionTargetDataMap = "rawdata";
var isNodeLinkfirst = true;
var importRowCount = 0;
var importColCount = 0;
var importYdiscrCount = 0;
var importYcontiCount = 0;
var importXdiscrCount = 0;
var importXcontiCount = 0;
var importOldYCount = 0;
var importOldXCount = 0;

//#########################################################
function heatmap_display(url, heatmapId, paletteName, delimiter) {


    //==================================================
    var tooltip = d3.select(heatmapId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");

    //==================================================
    // http://bl.ocks.org/mbostock/3680958
    function zoom() {
    	//svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        svg.attr('transform', 'translate(' + (viewerPosLeft+d3.event.transform.x) + ',' + (viewerPosTop+d3.event.transform.y-100) + ') scale(' + d3.event.transform.k + ')');
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    //var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
    var zoomListener = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    //==================================================
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height()-70;
    //var viewerPosTop = 200;
    //var viewerPosLeft = 100;

    //legendElementWidth = cellWidth;

    // http://bl.ocks.org/mbostock/5577023
    //var colors = colorbrewer[paletteName][classesNumber];
    //var rawdata = d3.dsvFormat(",");
    //rawdata.parse(url, function(dataset) {
    //d3.csv(url)
    d3.dsv(delimiter, url)
        .then(function(dataset) {

        //setup data size
        row_number = dataset.length;

        if(!hasColName)
            row_number = row_number + 1;   

        if(xc>0)
        {
            row_number = row_number - xc;
            xc_Y = -10-xc*xcov_cellHeight; 
            //console.log("yc_X:"+yc_X);  
        }
            
        if(xd>0)
        {
            row_number = row_number - xd;
            xd_Y = xc_Y -10-xd*xcov_cellHeight;
            //console.log("yd_X:"+yd_X);  
        }

        xCov = xd + xc; 

        if(hasRowName)
        {
            col_number = dataset.columns.length-1;
            yN = 1;
        }
        else
        {
            col_number = dataset.columns.length;
            yN = 0;
        }

        if(yc>0)
        {
            col_number = col_number - yc;
            yc_X = -10-yc*ycov_cellWidth; 
            //console.log("yc_X:"+yc_X);  
        }
            
        if(yd>0)
        {
            col_number = col_number - yd;
            yd_X = yc_X -10-yd*ycov_cellWidth;
            //console.log("yd_X:"+yd_X);  
        }

        yCov = yd + yc;

        console.log("row_number: "+row_number);
        console.log("col_number: "+col_number);
        
        //put data to variables
        for( i=0 ;i< row_number; i++)
        {
            row_name.push(dataset[i+xCov].name);
        }
        for( i=0 ;i< col_number; i++ )
        {
            //col_name.push(Object.keys(dataset[0])[i]);

            col_name.push(dataset.columns[i+yCov+yN]);
            console.log(dataset.columns[i+yCov+yN]);
        }
        
        for( i=0 ;i< row_number; i++)
        {
            tempdata = [];
            for( j=0 ;j< col_number; j++ )
            {
                tempdata.push(Object.values(dataset[i+xCov])[j+yCov+yN]);
            } 
            data.push(tempdata);  
        }

        if(xd>0)
        {
            for( i=0 ;i< xd; i++ )
            {
                tempdata = [];
                for( j=0 ;j< col_number; j++)
                {
                    tempdata.push(Object.values(dataset[i])[j+yCov+yN]);
                }   
                xdData.push(tempdata);   
            }
            for( i=0 ;i< xd; i++ )
            {
                xd_max_value[i]=xdData[i][0];
                xd_min_value[i]=xdData[i][0];
                for( j=0 ;j< col_number; j++)
                {
                    if(xd_max_value[i]<xdData[i][j])
                    {
                        xd_max_value[i]=xdData[i][j];   
                    }
                    if(xd_min_value[i]>xdData[i][j])
                    {
                        xd_min_value[i]=xdData[i][j];   
                    }                   
                }
            } 

            for(j=0; j<xd; j++) 
            {
                var temp_xd_cate_col = [];
                for(i=xd_min_value[j]; i<=xd_max_value[j]; i++)   
                {
                    temp_xd_cate_col.push(i);

                }
                //console.log(xd_min_value[j]+","+xd_max_value[j]+","+temp_xd_cate_col);
                xd_cate_col.push(temp_xd_cate_col);
            }
        }

        if(xc>0)
        {
            for( i=0 ;i< xc; i++ )
            {
                tempdata = [];
                for( j=0 ;j< col_number; j++)
                {
                    tempdata.push(Object.values(dataset[i+xd])[j+yCov+yN]);
                }   
                xcData.push(tempdata);   
            }
            for( i=0 ;i< xc; i++ )
            {
                xc_max_value[i]=xcData[i][0];
                xc_min_value[i]=xcData[i][0];
                for( j=0 ;j< col_number; j++)
                {
                    if(xc_max_value[i]<xcData[i][j])
                    {
                        xc_max_value[i]=xcData[i][j];   
                    }
                    if(xc_min_value[i]>xcData[i][j])
                    {
                        xc_min_value[i]=xcData[i][j];   
                    }                   
                }
                console.log("xc min and max: "+xc_min_value[i]+","+xc_max_value[i]);
            } 
        }

        if(yd>0)
        {
            for( i=0; i<row_number; i++)
            {
                tempdata = [];
                for( j=0; j<yd; j++ )
                {
                    tempdata.push(Object.values(dataset[i+xCov])[j+yN]);
                } 
                ydData.push(tempdata);  
            }     

            for( j=0; j<yd; j++)
            {
                yd_max_value[j]=ydData[0][j];
                yd_min_value[j]=ydData[0][j];
                for( i=0 ;i< row_number; i++)
                {
                    if(yd_max_value[j]<ydData[i][j])
                    {
                        yd_max_value[j]=ydData[i][j];   
                    }
                    if(yd_min_value[j]>ydData[i][j])
                    {
                        yd_min_value[j]=ydData[i][j];   
                    }
                }
            } 
            for(j=0; j<yd; j++) 
            {
                var temp_yd_cate_col = [];
                for(i=yd_min_value[j]; i<=yd_max_value[j]; i++)   
                {
                    //yd_cate_col[j].push(i);
                    temp_yd_cate_col.push(i);

                }
                //console.log(yd_min_value[j]+","+yd_max_value[j]+","+temp_yd_cate_col);
                yd_cate_col.push(temp_yd_cate_col);
            }
               
        }

        if(yc>0)
        {
            for( i=0 ;i< row_number; i++)
            {
                tempdata = [];
                for( j=0 ;j< yc; j++ )
                {
                    tempdata.push(Object.values(dataset[i+xCov])[j+yd+yN]);
                } 
                ycData.push(tempdata);  
            }        


            for( j=0 ;j< yc; j++)
            {
                yc_max_value[j]=ycData[0][j];
                yc_min_value[j]=ycData[0][j];
                for( i=0 ;i< row_number; i++)
                {
                    if(yc_max_value[j]<ycData[i][j])
                    {
                        yc_max_value[j]=ycData[i][j];   
                    }
                    if(yc_min_value[j]>ycData[i][j])
                    {
                        yc_min_value[j]=ycData[i][j];   
                    }
                }
            }
        }

        max_value = d3.max(data, function(row) { return d3.max(row) });
        min_value = d3.min(data, function(row) { return d3.min(row) });

        for( j=0 ;j< col_number; j++)
        {
            data_max_value[j]=data[0][j];
            data_min_value[j]=data[0][j];
            for( i=0 ;i< row_number; i++)
            {
                if(data_max_value[j]<data[i][j])
                {
                    data_max_value[j]=data[i][j];   
                }
                if(data_min_value[j]>data[i][j])
                {
                    data_min_value[j]=data[i][j];   
                }
            }
        }

        for( i=0 ;i< row_number; i++)
        {
            data_row_max_value[i]=data[i][0];
            data_row_min_value[i]=data[i][0];
            for( j=0 ;j< col_number; j++)
            {
                if(data_row_max_value[i]<data[i][j])
                {
                    data_row_max_value[i]=data[i][j];   
                }
                if(data_row_min_value[i]>data[i][j])
                {
                    data_row_min_value[i]=data[i][j];   
                }
            }
        }

        //console.log(max_value);
        for( i=0 ;i< row_number; i++)
            rowCurrentOrder[i] = i;
        for( i=0 ;i< col_number; i++)
            colCurrentOrder[i] = i;

        var colorScale = d3.scaleSequential()
            .domain([max_value, min_value])
            .interpolator(d3.interpolateSpectral);

        svg = d3.select(heatmapId).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
	    .call(zoomListener)
            .append("g")
            .attr("id", "gap")
            .attr("transform", "translate(" + viewerPosLeft + "," + (viewerPosTop-100) + ")");

        svg.append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)
            .append('path')
            .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
            .attr('stroke', '#000000')
            .attr('stroke-width', 1);

        var rowSortOrder = false;
        var colSortOrder = false;        

        var rowLabels = svg.append("g")
            .attr("class", "rowLabels")
            .selectAll(".rowLabel")
            //.data(data.index)
            .data(row_name)
            .enter().append("text")
            .text(function(d) {
                //return d.count > 1 ? d.join("/") : d;
                return d;
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * cellHeight);
            })
            .style("text-anchor", "end")
            .attr("transform", function(d, i) {
                if(yc>0)
                {
                    if(yd>0)
                        return "translate("+(-3+yd_X)+"," + cellHeight / 1.5 + ")";
                    else
                        return "translate("+(-3+yc_X)+"," + cellHeight / 1.5 + ")";
                }
                else
                {
                    if(yd>0)
                        return "translate("+(-3+yd_X)+"," + cellHeight / 1.5 + ")";
                    else
                        return "translate(-3," + cellHeight / 1.5 + ")";
                }
            })
            .attr("class", "rowLabel mono")
            .attr("id", function(d, i) {
                return "rowLabel_" + i;
            })
            .on('mouseover', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", true);
            })
            .on('mouseout', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", false);
            })
            .on("click", function(d, i) {
                rowSortOrder = !rowSortOrder;
                sortByValues("r", i, rowSortOrder);
                d3.select("#order").property("selectedIndex", 0);
                //$("#order").jqxComboBox({selectedIndex: 0});
            });

        var colLabels = svg.append("g")
            .attr("class", "colLabels")
            .selectAll(".colLabel")
            //.data(data.columns)
            .data(col_name)
            .enter().append("text")
            .text(function(d) {
                //d.shift();
                //return d.count > 1 ? d.reverse().join("/") : d.reverse();
                return d;
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * cellWidth);
            })
            .style("text-anchor", "left")
            .attr("transform", function(d, i) {
                if(xc>0)
                {
                    if(xd>0)
                        return "translate(" + cellWidth / 2 + ", "+(-3+xd_Y)+") rotate(-90) rotate(45, 0, " + (i * cellWidth) + ")";
                    else
                        return "translate(" + cellWidth / 2 + ", "+(-3+xc_Y)+") rotate(-90) rotate(45, 0, " + (i * cellWidth) + ")";
                }
                else
                {
                    if(xd>0)
                        return "translate(" + cellWidth / 2 + ", "+(-3+xd_Y)+") rotate(-90) rotate(45, 0, " + (i * cellWidth) + ")";
                    else
                        return "translate(" + cellWidth / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellWidth) + ")";
                }
                //return "translate(" + cellWidth / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellWidth) + ")";
            })
            .attr("class", "colLabel mono")
            .attr("id", function(d, i) {
                return "colLabel_" + i;
            })
            .on('mouseover', function(d, i) {
                d3.select('#colLabel_' + i).classed("hover", true);
            })
            .on('mouseout', function(d, i) {
                d3.select('#colLabel_' + i).classed("hover", false);
            })
            .on("click", function(d, i) {
                colSortOrder = !colSortOrder;
                sortByValues("c", i, colSortOrder);
                d3.select("#order").property("selectedIndex", 0);
            });


        setupHeatmap2(data,"mv",0,0,0, heatmapId, d3.interpolateSpectral);
        
        if(yc>0)
        {
            //yc_X = -5-yc*cellWidth; 
            setupHeatmap2(ycData,"mv12",yc_X,0,12, heatmapId, d3.interpolateSpectral);
            $("#optionDataMap").append($("<option></option>").attr("value", "yc").text("Yconti. covariates"));
        }
        if(yd>0)
        {
            //yd_X = yc_X -5-yd*cellWidth;
            setupHeatmap2(ydData,"mv11",yd_X,0,11, heatmapId, d3.schemeSet1);
            $("#optionDataMap").append($("<option></option>").attr("value", "yd").text("Ydisc. covariates"));
        }
        if(xc>0)
        {
            //yc_X = -5-yc*cellWidth; 
            setupHeatmap2(xcData,"mv14",0,xc_Y,14, heatmapId, d3.interpolateSpectral);
            $("#optionDataMap").append($("<option></option>").attr("value", "xc").text("Xconti. covariates"));
        }
        if(xd>0)
        {
            //yd_X = yc_X -5-yd*cellWidth;
            setupHeatmap2(xdData,"mv13",0,xd_Y,13, heatmapId, d3.schemeSet1);
            $("#optionDataMap").append($("<option></option>").attr("value", "xd").text("Xdisc. covariates"));
        }

        rowProxData = new Array(row_number);
        for(i = 0; i < row_number; i++) {
            rowProxData[i] = new Array(row_number);
            for(j = 0; j < row_number; j++) {
                rowProxData[i][j] = 0;
            }
        }
        colProxData = new Array(col_number);
        for(i = 0; i < col_number; i++) {
            colProxData[i] = new Array(col_number);
            for(j = 0; j < col_number; j++) {
                colProxData[i][j] = 0;
            }
        }
        
        
        
        
/*
        var legend_text = [];
        for(i=0 ; i <classesNumber ; i++)
        {
            temp_value = parseFloat(((max_value-min_value)/classesNumber)*i)+parseFloat(min_value);
            legend_text.push(temp_value);
        }
        //console.log(legend_text);
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(500,-300)")
            .selectAll(".legendElement")
            //.data([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.9])
            .data(legend_text)
            .enter().append("g")
            .attr("class", "legendElement");

        legend.append("svg:rect")
            .attr("x", function(d, i) {
                return legendElementWidth * i;
            })
            .attr("y", viewerPosTop)
            .attr("class", "cellLegend bordered")
            .attr("width", legendElementWidth)
            .attr("height", cellSize / 2)
            .style("fill", function(d, i) {
                return colors[classesNumber-i-1];
            });

        legend.append("text")
            .attr("class", "mono legendElement")
            .text(function(d) {
                return "≥" + Math.round(d * 100) / 100;
            })
            .attr("x", function(d, i) {
                return legendElementWidth * i;
            })
            .attr("y", viewerPosTop + cellSize);
*/
        //==================================================
        // Change ordering of cells
        function sortByValues(rORc, i, sortOrder) {
            //var svg = d3.select(heatmapId).select("svg").select("#gap").select("#mv");
            var t = svg.transition().duration(1000);
            var values = [];
            var sorted;
            d3.selectAll(".c" + rORc + i)
                .filter(function(d) {
                    if (d != null) values.push(d);
                    else values.push(-999); // to handle NaN
                });
            //console.log(values);		
            if (rORc == "r") { // sort on cols
                sorted = d3.range(col_number).sort(function(a, b) {
                    if (sortOrder) {
                        return values[b] - values[a];
                    } else {
                        return values[a] - values[b];
                    }
                });
                t.select("#mv").selectAll(".cell")
                    .attr("x", function(d) {
                        var col = parseInt(d3.select(this).attr("col"));
                        return sorted.indexOf(col) * cellWidth;
                    });
                if(t.select("#mv3"))
                {
                    t.select("#mv3").selectAll(".cell")
                        .attr("x", function(d) {
                            var col = parseInt(d3.select(this).attr("col"));
                            return sorted.indexOf(col) * cellWidth;
                        });  
                    t.select("#mv3").selectAll(".row")
                        .attr("y", function(d) {
                            var row = parseInt(d3.select(this).attr("id"));
                            return sorted.indexOf(row) * cellWidth;
                        })
                        .attr("transform", function(d, i) {
                            var row = parseInt(d3.select(this).attr("id"));
                            var temp_x = $("#mv3")[0].getAttribute("x");
                            var temp_y = sorted.indexOf(row) * cellWidth-5-col_number*cellWidth;
                            return "translate(" + temp_x + "," + temp_y + ")";
                        });
                    t.selectAll(".colLabel")
                        .attr("y", function(d, i) {
                            return sorted.indexOf(i) * cellWidth;
                        })
                        .attr("transform", function(d, i) {
                            var temp_y = -5-col_number*cellWidth+cellWidth / 1.5;
                            return "translate("+ (-3+5+col_number*cellWidth) + "," + temp_y + ")";
                            //return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (sorted.indexOf(i) * cellSize) + ")";
                        });
                }    
                else{
                    t.selectAll(".colLabel")
                        .attr("y", function(d, i) {
                            return sorted.indexOf(i) * cellWidth;
                        })
                        .attr("transform", function(d, i) {
                            return "translate(" + cellWidth / 2 + ", -3) rotate(-90) rotate(45, 0, " + (sorted.indexOf(i) * cellWidth) + ")";
                        });
                }
            } else { // sort on rows
                sorted = d3.range(row_number).sort(function(a, b) {
                    if (sortOrder) {
                        return values[b] - values[a];
                    } else {
                        return values[a] - values[b];
                    }
                });

                t.select("#mv").selectAll(".row")
                    .attr("y", function(d) {
                        var row = parseInt(d3.select(this).attr("id"));
                        return sorted.indexOf(row) * cellHeight;
                    })
                    .attr("transform", function(d, i) {
                        var row = parseInt(d3.select(this).attr("id"));
                        return "translate(0," + sorted.indexOf(row) * cellHeight + ")";
                    });
                if(t.select("#mv2"))
                {
                    //console.log("yes");
                    t.select("#mv2").selectAll(".cell")
                        .attr("x", function(d) {
                            var col = parseInt(d3.select(this).attr("col"));
                            return sorted.indexOf(col) * cellHeight;
                        });  
                    t.select("#mv2").selectAll(".row")
                        .attr("y", function(d) {
                            var row = parseInt(d3.select(this).attr("id"));
                            return sorted.indexOf(row) * cellHeight;
                        })
                        .attr("transform", function(d, i) {
                            var row = parseInt(d3.select(this).attr("id"));
                            var temp_x = $("#mv2")[0].getAttribute("x");
                            return "translate(" + temp_x + "," + sorted.indexOf(row) * cellHeight + ")";
                        });

                }
                if(t.select("#mv11"))
                {
                    t.select("#mv11").selectAll(".row")
                        .attr("y", function(d) {
                            var row = parseInt(d3.select(this).attr("id"));
                            //console.log(sorted.indexOf(row));
                            return sorted.indexOf(row) * cellHeight;
                        })
                        .attr("transform", function(d, i) {
                            var row = parseInt(d3.select(this).attr("id"));
                            var temp_x = $("#mv11")[0].getAttribute("x");
                            return "translate(0," + sorted.indexOf(row) * cellHeight + ")";
                        });

                }
                if(t.select("#mv12"))
                {
                    t.select("#mv12").selectAll(".row")
                        .attr("y", function(d) {
                            var row = parseInt(d3.select(this).attr("id"));
                            //console.log(sorted.indexOf(row));
                            return sorted.indexOf(row) * cellHeight;
                        })
                        .attr("transform", function(d, i) {
                            var row = parseInt(d3.select(this).attr("id"));
                            var temp_x = $("#mv12")[0].getAttribute("x");
                            return "translate(0," + sorted.indexOf(row) * cellHeight + ")";
                        });

                }
                t.selectAll(".rowLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellHeight;
                    })
                    .attr("transform", function(d, i) {
                        if(yc>0)
                        {
                            if(yd>0)
                                return "translate("+(-3+yd_X)+"," + cellHeight / 1.5 + ")";
                            else
                                return "translate("+(-3+yc_X)+"," + cellHeight / 1.5 + ")";
                        }
                        else
                        {
                            if(yd>0)
                                return "translate("+(-3+yd_X)+"," + cellHeight / 1.5 + ")";
                            else
                                return "translate(-3," + cellHeight / 1.5 + ")";
                        }
                    });
            }
        }
        //==================================================
        d3.select("#rowprox").on("change", function() { 
          /*  rowProxData = new Array(row_number);
            for(i = 0; i < row_number; i++) {
                rowProxData[i] = new Array(row_number);
                for(j = 0; j < row_number; j++) {
                    rowProxData[i][j] = Math.random();
                }
            }*/
            var colorID;
            if (this.selectedIndex == 1){
               for(i = 0; i < row_number; i++) {
                    for(j = 0; j < row_number; j++) {
                        rowProxData[i][j] = EuclideanDistance(data,i,j,col_number, 0);
                    }
                } 
                colorID = d3.interpolateSpectral;
                rowIsSimilarity = false;
            }
            else if(this.selectedIndex == 2){
               for(i = 0; i < row_number; i++) {
                    for(j = 0; j < row_number; j++) {
                        rowProxData[i][j] = pearsonCorrelation(data,i,j,col_number, 0);
                    }
                } 
                colorID = d3.interpolateRdBu;
                rowIsSimilarity = true;
            }
            
            $("#roworder").prop("disabled",false);
            //console.log("a:"+rowProxData[0][1]);
            if(isRowProxfirst)
            {
                setupHeatmap2(rowProxData,"mv2", col_number*cellWidth+10, 0, 1, heatmapId, colorID);
                $("#optionDataMap").append($("<option></option>").attr("value", "rp").text("Row Proximity Matrix"));
                //drawColorLegend("rp_colorspec", viewerPosTop, colorID, "Row Proximity Matrix");
                isRowProxfirst = false;
            }
            else
                changeProx(rowProxData,"mv2", heatmapId, 1, colorID);
        });

        //==================================================
        d3.select("#colprox").on("change", function() { 
            /*
            colProxData = new Array(col_number);
            for(i = 0; i < col_number; i++) {
                colProxData[i] = new Array(col_number);
                for(j = 0; j < col_number; j++) {
                    colProxData[i][j] = Math.random();
                }
            }
            */
            var colorID;
            if (this.selectedIndex == 1){
                for(i = 0; i < col_number; i++) {
                    for(j = 0; j < col_number; j++) {
                        colProxData[i][j] = EuclideanDistance(data,i,j,row_number,1);
                    }
                }
                colorID = d3.interpolateSpectral;
                colIsSimilarity = false;
            }
            else if (this.selectedIndex == 2){
                for(i = 0; i < col_number; i++) {
                    for(j = 0; j < col_number; j++) {
                        colProxData[i][j] = pearsonCorrelation(data,i,j,row_number,1);
                    }
                }
                colorID = d3.interpolateRdBu;
                colIsSimilarity = true;
            }
            $("#colorder").prop("disabled",false);

            if(isColProxfirst)
            {
                var colProxY = -10-col_number*cellWidth;
                if(xc>0)
                {
                    if(xd>0)
                        colProxY = colProxY + (-5+xd_Y);
                    else
                        colProxY = colProxY + (-5+xc_Y);
                }
                else
                {
                    if(xd>0)
                        colProxY = colProxY + (-5+xd_Y);
                }
                setupHeatmap2(colProxData,"mv3", 0, colProxY, 2, heatmapId ,colorID);
                changeColLabelsPosition(heatmapId, col_number);
                $("#optionDataMap").append($("<option></option>").attr("value", "cp").text("Column Proximity Matrix"));
                //drawColorLegend("cp_colorspec", viewerPosTop, colorID, "Col. Proximity Matrix");
                isColProxfirst = false;
            }
            else
                changeProx(colProxData,"mv3", heatmapId, 2, colorID);

        });

        //==================================================
        d3.select("#optionDataMap").on("change", function() {
           optionTargetDataMap = d3.select("#optionDataMap").property("value");    
        });

        //==================================================
        d3.select("#order").on("change", function() {
	       var newOrder = d3.select("#order").property("value");	
            changeOrder(newOrder, heatmapId);
        });

        //==================================================
        d3.select("#roworder").on("change", function() {
            var previousOrderIsR2E = false;
            if(rowOrderId == "r2e")
                previousOrderIsR2E = true;
            else
                previousOrderIsR2E = false;
            rowOrderId = d3.select("#roworder").property("value");   
            console.log(rowOrderId);
            if (rowOrderId == "singlelinkage" || rowOrderId == "averagelinkage" || rowOrderId == "completelinkage") 
            { 
                if(previousOrderIsR2E)
                {
                    $("#rowflip").prop('selectedIndex', 1);
                    rowFlipId = "r2e";
                }
            }
            else if(rowOrderId == "r2e")
            {
                $("#rowflip").prop('selectedIndex', 0);   
                rowFlipId = "null";
            }
            else if(rowOrderId == "sortinit_row")
            {
                $("#rowflip").prop('selectedIndex', 0);   
                rowFlipId = "null";
            }
            changeRowOrder(rowOrderId, heatmapId);
        });

        //==================================================
        d3.select("#colorder").on("change", function() {
            var previousOrderIsR2E = false;
            if(colOrderId == "r2e")
                previousOrderIsR2E = true;
            else
                previousOrderIsR2E = false;
            colOrderId = d3.select("#colorder").property("value");   
            console.log(colOrderId);
            if (colOrderId == "singlelinkage" || colOrderId == "averagelinkage" || colOrderId == "completelinkage") 
            { 
                if(previousOrderIsR2E)
                {
                    $("#colflip").prop('selectedIndex', 1);
                    colFlipId = "r2e";
                }
            }
            else if(colOrderId == "r2e")
            {
                $("#colflip").prop('selectedIndex', 0);   
                colFlipId = "null";
            }
            else if(colOrderId == "sortinit_col")
            {
                $("#colflip").prop('selectedIndex', 0);   
                colFlipId = "null";
            }
            changeColOrder(colOrderId, heatmapId);
        });

        //==================================================
        d3.select("#rowflip").on("change", function() {

            rowFlipId = d3.select("#rowflip").property("value");   
            console.log(rowFlipId);
            changeRowFlip(rowFlipId, heatmapId);
        });

        //==================================================
        d3.select("#colflip").on("change", function() {

            colFlipId = d3.select("#colflip").property("value");   
            console.log(colFlipId);
            changeColFlip(colFlipId, heatmapId);
        });

        //==================================================
        d3.select("#palette")
            .on("keyup", function() {
        		var newPalette = d3.select("#palette").property("value");
                var newCondition = d3.select("#displaycondition").property("value");
        		if (newPalette != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
                    changePalette(newCondition, newPalette, heatmapId);
            })
            .on("change", function() {
		        var newPalette = d3.select("#palette").property("value");
                var newCondition = d3.select("#displaycondition").property("value");
                changePalette(newCondition, newPalette, heatmapId);
            });

        //==================================================
        d3.select("#displaycondition")
            .on("keyup", function() {
                var newCondition = d3.select("#displaycondition").property("value");
                var newPalette = d3.select("#palette").property("value");
                if (newCondition != null)                     // when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
                    changePalette(newCondition, newPalette, heatmapId);
            })
            .on("change", function() {
                var newCondition = d3.select("#displaycondition").property("value");
                var newPalette = d3.select("#palette").property("value");
                changePalette(newCondition, newPalette, heatmapId);
            });

        //==================================================
        d3.select("#widthZoomRange").on("mouseup", function() {

            var widthZoomRange = d3.select("#widthZoomRange").property("value");   
            //console.log(widthZoomRange);
            changeWidth(widthZoomRange, heatmapId);
        });

        //==================================================
        d3.select("#heightZoomRange").on("mouseup", function() {

            var heightZoomRange = d3.select("#heightZoomRange").property("value");   
            changeHeight(heightZoomRange, heatmapId);
        });
    });


    //==================================================
}
