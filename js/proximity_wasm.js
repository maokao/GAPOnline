//emcc hctree.cpp r2e.cpp list.cpp ordering.cpp proximity.cpp -s ALLOW_MEMORY_GROWTH=1 -s "EXPORTED_FUNCTIONS=['_hctree_sort','_ellipse_sort','_computeProximity']" -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall','cwrap']" -o seriation.js
//emcc hctree.cpp r2e.cpp list.cpp ordering.cpp proximity.cpp -s "EXPORTED_FUNCTIONS=['_hctree_sort','_ellipse_sort','_computeProximity']" -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall','cwrap']" -o seriation.js

var runProximityWASM = Module.cwrap("computeProximity", null, ["number", "number", "number", "number", "number", "number", "number"]); // void function

function runProximity(proxType, side, isContainMissingValue) {
  

        var len = row_number * col_number; 

        var inputRawData = new Float64Array(len);


        for(var i = 0; i < row_number; i++)
        {
          for(var j = 0; j < col_number; j++)
          {
              inputRawData[i*col_number+j] = data[i][j]; 
              //console.log((i*col_number+j)+":"+inputRawData[i*col_number+j]);
          }         
        }

        var bytes_per_element = inputRawData.BYTES_PER_ELEMENT;   // 8 bytes each element
        console.log("bytes_per_element:"+inputRawData.BYTES_PER_ELEMENT);
    
        var start = 0;
        var end = 0;
        start = new Date().getTime();
        // 要測試的 function 開始 =======

        // alloc memory
        var input_ptr = Module._malloc(len * bytes_per_element);
        var output_prox_ptr;
        var prox_len = 0;
        if(side == 0)
        {
          output_prox_ptr = Module._malloc(row_number * row_number * 8 );
          prox_len = row_number * row_number;
        }
        else
        {
          output_prox_ptr = Module._malloc(col_number * col_number * 8 );
          prox_len = col_number * col_number;
        }

        Module.HEAPF64.set(inputRawData, input_ptr / bytes_per_element); // write WASM memory calling the set method of the Float64Array

        runProximityWASM(input_ptr, output_prox_ptr, row_number, col_number, proxType, side, isContainMissingValue);
        /*
        Module.ccall(
          "hctree_sort", //c function name
          null,   //output type
          ["number", "number", "number", "number", "number", "number", "number", "number"], //input type
          [input_ptr, output_left_ptr, output_right_ptr, output_hgt_ptr, output_order_ptr, row_number, row_number, 0]       //input value
        );
*/

        var output_prox_array = new Float64Array(Module.HEAPF64.buffer, output_prox_ptr, prox_len); // extract data to another JS array
 
        // 要測試的 function 結束 =======
        end = new Date().getTime();
        // 計算花多久時間
        console.log((end - start) / 1000 + "sec");

        
        freeHeap(input_ptr);
        freeHeap(output_prox_ptr);



  return output_prox_array;
  
}
