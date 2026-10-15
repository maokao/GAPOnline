//emcc hctree.cpp r2e.cpp list.cpp ordering.cpp proximity.cpp -s ALLOW_MEMORY_GROWTH=1 -s "EXPORTED_FUNCTIONS=['_hctree_sort','_ellipse_sort','_computeProximity']" -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall','cwrap']" -o seriation.js
//emcc hctree.cpp r2e.cpp list.cpp ordering.cpp proximity.cpp -s "EXPORTED_FUNCTIONS=['_hctree_sort','_ellipse_sort','_computeProximity']" -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall','cwrap']" -o seriation.js

var runProximityWASM = Module.cwrap("computeProximity", null, ["number", "number", "number", "number", "number", "number", "number"]); // void function

// Run the WASM proximity routine on an nr x nc row-major Float64Array.
// Returns a COPY of the result (the heap block is freed before returning).
function wasmProximity(flat, nr, nc, proxType, side) {
    var nOut = (side == 0) ? nr : nc;
    var input_ptr = Module._malloc(flat.length * 8);
    var output_ptr = Module._malloc(nOut * nOut * 8);
    Module.HEAPF64.set(flat, input_ptr / 8);
    runProximityWASM(input_ptr, output_ptr, nr, nc, proxType, side, 0);
    var out = new Float64Array(Module.HEAPF64.buffer, output_ptr, nOut * nOut).slice();
    Module._free(input_ptr);
    Module._free(output_ptr);
    return out;
}

// Proximity between rows (side 0) or columns (side 1) of the global `data`.
// Missing values (null / NaN) are handled with pairwise deletion: for every pair
// that involves a missing value, the proximity is recomputed by the same WASM
// routine using only the positions observed in both vectors. Pairs with fewer
// than 2 common observations get NaN (shown as missing).
// (The WASM flag `isContainMissingValue` has no effect, so it is not used.)
function runProximity(proxType, side, isContainMissingValue) {
    var start = new Date().getTime();
    var nr = row_number, nc = col_number;
    var flat = new Float64Array(nr * nc);
    var missing = new Uint8Array(nr * nc);
    var hasMissing = false;
    for (var r = 0; r < nr; r++) {
        for (var c = 0; c < nc; c++) {
            var v = data[r][c];
            if (v === null || v === undefined || isNaN(v)) {
                missing[r*nc+c] = 1; hasMissing = true; flat[r*nc+c] = 0;
            } else {
                flat[r*nc+c] = v;
            }
        }
    }

    var prox = wasmProximity(flat, nr, nc, proxType, side);

    if (hasMissing) {
        var n = (side == 0) ? nr : nc;     // number of objects
        var m = (side == 0) ? nc : nr;     // length of each vector
        var get = (side == 0) ? function(obj, k) { return obj*nc + k; }
                              : function(obj, k) { return k*nc + obj; };
        var objHasMissing = new Uint8Array(n);
        for (var o = 0; o < n; o++)
            for (var k = 0; k < m; k++)
                if (missing[get(o, k)]) { objHasMissing[o] = 1; break; }

        // reusable buffers: one 2 x m matrix per pair
        var input_ptr = Module._malloc(2 * m * 8);
        var output_ptr = Module._malloc(4 * 8);
        var pair = new Float64Array(2 * m);
        var nRecomputed = 0;
        for (var a = 0; a < n; a++) {
            for (var b = a; b < n; b++) {
                if (!objHasMissing[a] && !objHasMissing[b]) continue;
                var cnt = 0;
                for (var k = 0; k < m; k++) {
                    var ia = get(a, k), ib = get(b, k);
                    if (missing[ia] || missing[ib]) continue;
                    pair[cnt] = flat[ia];
                    pair[m + cnt] = flat[ib];      // temporarily at offset m
                    cnt++;
                }
                var value = NaN;
                if (cnt >= 2) {
                    // pack as a contiguous 2 x cnt matrix
                    for (var k = 0; k < cnt; k++) pair[cnt + k] = pair[m + k];
                    Module.HEAPF64.set(pair.subarray(0, 2 * cnt), input_ptr / 8);
                    runProximityWASM(input_ptr, output_ptr, 2, cnt, proxType, 0, 0);
                    value = Module.HEAPF64[output_ptr / 8 + 1];
                }
                prox[a*n+b] = value;
                prox[b*n+a] = value;
                nRecomputed++;
            }
        }
        Module._free(input_ptr);
        Module._free(output_ptr);
        console.log("runProximity: " + nRecomputed + " pair(s) recomputed with pairwise-complete data");
    }

    // Kendall's tau: the WASM routine leaves the LAST diagonal entry uninitialised
    // (random values such as 2 or 13 were observed). tau(x, x) = 1, or undefined
    // when x has fewer than two distinct observed values.
    if (proxType == 2) {
        var n = (side == 0) ? nr : nc, m = (side == 0) ? nc : nr;
        for (var o = 0; o < n; o++) {
            var first = null, distinct = false;
            for (var k = 0; k < m; k++) {
                var idx = (side == 0) ? o*nc + k : k*nc + o;
                if (missing[idx]) continue;
                if (first === null) first = flat[idx];
                else if (flat[idx] !== first) { distinct = true; break; }
            }
            prox[o*n+o] = distinct ? 1 : NaN;
        }
    }

    console.log((new Date().getTime() - start) / 1000 + "sec");
    return prox;
}
