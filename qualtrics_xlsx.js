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
        // alert('loading a file');
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

    var tableHTML = createTablesHTML(output_json);
    document.getElementById('tables_html').textContent = tableHTML;

    document.getElementById('table').innerHTML = tableHTML;

    displayContents(output);
    console.log(output_json);
    // if(typeof console !== 'undefined') console.log("output", new Date());
}

function createTablesHTML(json) {

    var attrs = json['Design Matrix 2'][0];

    var option_set = new Set();
    for (var a in attrs) {
        if (attrs[a].indexOf('.') > -1) {
            var option_id = attrs[a].split('.')[0];
            option_set.add(option_id);
        }
    }

    console.log('option_set');
    console.log(option_set);

    console.log('option_set[0]');
    var option_list = Array.from(option_set);
    console.log(option_list[0]);

    var attr_strs = [];
    var attrs_with_selection_vars = {

    };


    for (var a in attrs) {
        console.log(attrs[a], option_list[0] + '.');
        if (attrs[a].startsWith(option_list[0] + '.')) {

            var cleaned = attrs[a].replace(option_list[0] + '.', '');
            attr_strs.push(cleaned);

            // attrs_with_selection_vars['populated_attrs'].push(cleaned);

            attrs_with_selection_vars[cleaned] = {};
            for (var op in option_list) {
                attrs_with_selection_vars[cleaned][option_list[op]] = ''
            }

        }
    }

    document.getElementById('options_json').textContent = JSON.stringify(attrs_with_selection_vars, 2, 2);

    console.log('attr_strs');
    console.log(attr_strs);

    var tableHTML = "<span> Scenario 1 out of 5 </span>\n" +
    "<font size=\"3\">\n" +
    "<table class=\"table-sm table-bordered table-striped \">";

    tableHTML += "<thead class=\"thead-light\">\n";
    tableHTML += "<tr>\n<th><b><br></b></th>\n";
    for (var option_idx in option_list) {
        tableHTML += "<th>Option "+ option_list[option_idx] + "</th>\n";
    }
    tableHTML += "</tr>";
    tableHTML += "</thead>\n";


    for (var attr_idx in attr_strs) {
        tableHTML += "<tr>\n<td><b>" + attr_strs[attr_idx] + "</b></td>";

        for (var op in option_list) {
            tableHTML += "<td>${e://Field/file." + attr_strs[attr_idx] + "." + option_list[op] + "}</td>\n";
        }

        tableHTML += "</tr>\n";
    }


    tableHTML += "  </tbody></table>\n" +
        "</font>";

    return tableHTML;
}