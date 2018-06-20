$( document ).ready(function() {
    document.getElementById('file-input').addEventListener('change', readSingleFile, false);
    document.getElementById('drop_dom_element').addEventListener('drop', handleDrop, false);
});

var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        alert('loading a file');
        var contents = e.target.result;
        // displayContents(contents);
        readXLSX(contents);
    };
    if(rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
    // reader.readAsText(file);
}

function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.textContent = contents;
}

function handleDrop(e) {
    e.stopPropagation(); e.preventDefault();
    var files = e.dataTransfer.files, f = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        readXLSX(data);
    };
    if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
}

function readXLSX(data) {
    if(!rABS) data = new Uint8Array(data);
    var workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
    process_wb(workbook);
}

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if(roa.length > 0){
            result[sheetName] = roa;
        }
    });
    return result;
}

function process_wb(wb) {
    var output_json = to_json(wb);
    var output = JSON.stringify(output_json, 2, 2);
    displayContents(output);
    if(typeof console !== 'undefined') console.log("output", new Date());
}