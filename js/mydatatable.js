
function handleFiles() {
    gtag('event', 'load data', {'event_category': '按鈕點擊','event_label': 'load data'});
    let file = this.files[0];

    importDataFileName = URL.createObjectURL(file);
    $('#filepath').html("<b>File: "+file.name+"</b>");
    importDataFileExtension = getFileExtension(file.name);
    var sep = ",";
    if(importDataFileExtension == "csv")
        sep = ",";
    else
        sep = "\t";
    document.getElementById("chooseInput_2").checked=true;
    openModal();
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        if (csvs.indexOf(file.type) === -1 && tsvs.indexOf(file.type) === -1) {
            alert("Please only upload CSV files.")
        } else {
        	$.blockUI();
  
            var csvString = "";
            var reader = new FileReader();
            reader.onload = function() {
                csvString = reader.result;
                var n = csvString.indexOf("\n");
                var firstRow = csvString.substring(0,n).split(sep);
                var header = "var0";
                for(var i=1; i<firstRow.length; i++)
                {
                    header = header.concat(sep) + "var" + i;
                }
                csvString = header+ "\n" +csvString;

                Papa.parse(csvString, {
                    //"download": true,
                    "header": true,
                    "delimitersToGuess": [',', '\t'],
                    "skipEmptyLines": true,
                    "dynamicTyping": false,
                    //"worker": true,
                    "fastMode": true,
                    "complete": results => {
                        if ($.fn.DataTable.isDataTable("#example")) {
                            example.destroy();
                            $('#example').empty();
                        }
                        example = $("#example").DataTable({
                            "responsive": true,
                            "aaSorting": [],
                            "scrollX": '600px',
                            "scrollX": true,
                            "info": false,
                            "bPaginate":false,
                            "sScrollY":"285px",
                            "searching": false,  
                            "paging": false,
                            "ordering": false,  
                            "bProcessing": true,
                            //"decimal": "\t",
                            //"fixedHeader": true,                   
                            "columns": results.meta.fields.map(c => ({
                                "title": c,
                                "data": c,
                                "visible": c.toLowerCase() !== "id",
                                "default": ""
                            })),
                            "data": results.data,
                            "drawCallback": function(settings) {
                                $.unblockUI();
                            }
                            /*"rowCallback" : function(nRow, aData, iDisplayIndex) {
                                $.unblockUI();
                                if (aData != null && aData != "") {
                                      $('td', nRow).eq(1).css({color: "#f91212"});
                                }
                                $('#example td:nth-child(3)').css('background-color', '#f6a828');
                            }*/
                        });
                        //importRowCount = example.data().count();
                        importRowCount = results.data.length;
                        importColCount = example.columns().header().length;
                        $("#row_num").text(example.data().count());
                        $("#col_num").text(example.columns().header().length);

                        //console.log(example.data().count());
                        //console.log(results.data[0]);
                    }
                });
            };

            reader.readAsText(file);

        }
    }
}

function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}
