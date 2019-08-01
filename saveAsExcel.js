/**
 * saveAsExcel-echarts图表导出excel文件.
 */
define([], function () {
    var idTmr;
    var execute = function (theadData, tbodyData, fileName) {
        // 表头
        var thead = "<thead><tr>";
        var size = theadData.length; // 表头列大小
        for (var i = 0; i < size; i++) {
            thead += "<th>" + theadData[i] + "</th>";
        }
        thead += "</tr></thead>";
        // 添加数据
        var row;
        var tbody = "<tbody>";
        size = tbodyData.length; // 记录条数
        for (var i = 0; i < size; i++) {
            tbody += "<tr>";
            row = tbodyData[i];
            for (var key in row) {
                tbody += "<td>" + row[key] + "</td>";
            }
            tbody += "</tr>";
        }
        tbody += "</tbody>";
        var table = thead + tbody;
        exportExcel(table, fileName);
    };

    var exportExcel = function (table, name) {
        var uri = "data:application/vnd.ms-excel;base64,";
        var template = "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\"" +
            " xmlns:x=\"urn:schemas-microsoft-com:office:excel\"" +
            " xmlns=\"http://www.w3.org/TR/REC-html40\">" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<!--[if gte mso 9]>" +
            "<xml>" +
            "<x:ExcelWorkbook>" +
            "<x:ExcelWorksheets>" +
            "<x:ExcelWorksheet>" +
            "<x:Name>{worksheet}</x:Name>" +
            "<x:WorksheetOptions>" +
            "<x:DisplayGridlines/>" +
            "</x:WorksheetOptions>" +
            "</x:ExcelWorksheet>" +
            "</x:ExcelWorksheets>" +
            "</x:ExcelWorkbook>" +
            "</xml>" +
            "<![endif]-->" +
            "</head>" +
            "<body><table>{table}</table></body></html>";
        var base64 = function base64(s) {
            return window.btoa(unescape(encodeURIComponent(s)));
        };
        var format = function format(s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            });
        };
        var ctx = {
            worksheet: name,
            table: table
        };
        saveAs(name, uri + base64(format(template, ctx)));
    };

    // 下载操作
    var saveAs = function (title, imgUrl) {
        var base64ToBlob = function (code) {
            var parts = code.split(';base64,');
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;
            var uInt8Array = new Uint8Array(rawLength);
            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], {type: contentType});
        };
        var $a = document.createElement("a");
        var blob = base64ToBlob(imgUrl);
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", true, true);
        $a.download = title;
        $a.href = URL.createObjectURL(blob);
        $a.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    };

    //导出excel包含多个sheet
    //tables:tableId的数组;wsbames:sheet的名字数组;wbname:工作簿名字;appname:Excel
    var tablesToExcel = function (tables, wsnames, wbname) {

        var uri = 'data:application/vnd.ms-excel;base64,';
        var tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
            + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>'
            + '<Styles>'
            + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'
            + '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'
            + '</Styles>'
            + '{worksheets}</Workbook>';
        var tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>';
        var tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>';
        var base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        };
        var format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            })
        };

        var ctx = "";
        var worksheetsXML = "";
        var rowsXML = "";

        for (var i = 0; i < tables.length; i++) {
            /*控制要导出的行数*/
            for (var j = 0; j < tables[i].length; j++) {
                rowsXML += '<Row>';
                $.map(tables[i][j], function (item, index) {
                    ctx = {
                        attributeStyleID: ''
                        ,
                        nameType: 'String'
                        ,
                        data: item
                        ,
                        attributeFormula: ''
                    };
                    rowsXML += format(tmplCellXML, ctx);
                });
                rowsXML += '</Row>'
            }
            ctx = {rows: rowsXML, nameWS: wsnames[i] || 'Sheet' + i};
            worksheetsXML += format(tmplWorksheetXML, ctx);
            rowsXML = "";
        }

        ctx = {created: (new Date()).getTime(), worksheets: worksheetsXML};
        workbookXML = format(tmplWorkbookXML, ctx);

        /*查看后台的打印输出*/
        // console.log(workbookXML);
        var link = document.createElement("A");
        link.href = uri + base64(workbookXML);
        link.download = wbname || 'Workbook.xls';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return exportExcel;
});