//var output_array = [];
// 釋放一塊wasm記憶體
// Accepts a pointer (number) or a typed-array view on the WASM heap.
// (The old version always used .byteOffset, which is undefined for the
//  pointers passed everywhere, so nothing was ever freed -> memory leak.)
function freeHeap(heapBytes) {
  Module._free(typeof heapBytes === "number" ? heapBytes : heapBytes.byteOffset);
}

// Replace missing (NaN) entries of an n x n proximity matrix before seriation.
// mode "max": largest observed off-diagonal value (keeps unknown pairs apart, for HCT distances)
// mode "mean": mean observed off-diagonal value (neutral, for R2E)
function imputeMissingProx(arr, n, mode) {
  var sum = 0, cnt = 0, mx = -Infinity, diag = 0, hasMissing = false;
  for (var a = 0; a < n; a++) {
    for (var b = 0; b < n; b++) {
      var v = arr[a*n+b];
      if (isNaN(v)) { hasMissing = true; continue; }
      if (a == b) { diag = v; continue; }
      sum += v; cnt++; if (v > mx) mx = v;
    }
  }
  if (!hasMissing) return arr;
  var fill = cnt == 0 ? 0 : (mode == "max" ? mx : sum / cnt);
  for (var a = 0; a < n; a++)
    for (var b = 0; b < n; b++)
      if (isNaN(arr[a*n+b])) arr[a*n+b] = (a == b) ? diag : fill;
  console.log("imputeMissingProx: filled missing proximities with " + fill);
  return arr;
}

var runR2EWASM = Module.cwrap("ellipse_sort", null, ["number", "number", "number", "number", "number"]); // void function

function runR2E(sortedTarget) {

    if(sortedTarget == 0)
    {
        var len = row_number * row_number; 

        var inputRowProx = new Float64Array(len);
        for(i = 0; i < row_number; i++)
        {
          for(j = 0; j < row_number; j++)
          {
            inputRowProx[i*row_number+j] = (rowProxData[i][j] == null) ? NaN : rowProxData[i][j]; 
          }
        }

        imputeMissingProx(inputRowProx, row_number, "mean");
        var bytes_per_element = inputRowProx.BYTES_PER_ELEMENT;   // 8 bytes each element
         console.log("bytes_per_element:"+inputRowProx.BYTES_PER_ELEMENT);
    
        var start = 0;
        var end = 0;
        start = new Date().getTime();
        // 要測試的 function 開始 =======

        // alloc memory
        var input_ptr = Module._malloc(len * bytes_per_element);
        var output_ptr = Module._malloc(row_number * 4);

        Module.HEAPF64.set(inputRowProx, input_ptr / bytes_per_element); // write WASM memory calling the set method of the Float64Array

        runR2EWASM(input_ptr, output_ptr, row_number, row_number, 0);

        var output_array = new Int32Array(Module.HEAP32.buffer, output_ptr, row_number).slice(); // copy before the heap block is freed // extract data to another JS array

        // 要測試的 function 結束 =======
        end = new Date().getTime();
        // 計算花多久時間
        console.log((end - start) / 1000 + "sec");
        //console.log(output_array);
        //console.log(output_ptr);
        freeHeap(input_ptr);
        freeHeap(output_ptr);

    }
    else
    {
        var len = col_number * col_number; 

        var inputColProx = new Float64Array(len);
        for(i = 0; i < col_number; i++)
        {
          for(j = 0; j < col_number; j++)
          {
            inputColProx[i*col_number+j] = (colProxData[i][j] == null) ? NaN : colProxData[i][j]; 
          }
        }

        imputeMissingProx(inputColProx, col_number, "mean");
        var bytes_per_element = inputColProx.BYTES_PER_ELEMENT;   // 8 bytes each element
         console.log("bytes_per_element:"+inputColProx.BYTES_PER_ELEMENT);
    
        var start = 0;
        var end = 0;
        start = new Date().getTime();
        // 要測試的 function 開始 =======

        // alloc memory
        var input_ptr = Module._malloc(len * bytes_per_element);
        var output_ptr = Module._malloc(col_number * 4);

        Module.HEAPF64.set(inputColProx, input_ptr / bytes_per_element); // write WASM memory calling the set method of the Float64Array

        runR2EWASM(input_ptr, output_ptr, col_number, col_number, 0);

        var output_array = new Int32Array(Module.HEAP32.buffer, output_ptr, col_number).slice(); // copy before the heap block is freed // extract data to another JS array

        // 要測試的 function 結束 =======
        end = new Date().getTime();
        // 計算花多久時間
        console.log((end - start) / 1000 + "sec");
        //console.log(output_array);
        //console.log(output_ptr);
        freeHeap(input_ptr);
        freeHeap(output_ptr);
    }
        
    return output_array;

}