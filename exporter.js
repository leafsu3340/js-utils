(function ($) {
  var excelExporter = function (excelName, params) {
    var content = params.content, table = params.table, worksheetName = params.worksheetName;

    var _cssMaker = function ($table) {
      var _domCssMaker = function ($dom) {
        var style = $dom.attr("style") || "";
        style += 'mso-number-format: "\@";';    //excel 内部样式，代表文本单元格
        $dom.attr("style", style);
      };
      _domCssMaker($table);
      return $table.html();
    };

    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var fromCharCode = String.fromCharCode;
    var INVALID_CHARACTER_ERR = (function () {
      "use strict";
      // fabricate a suitable error object
      try {
        document.createElement('$');
      } catch (error) {
        return error;
      }
    }());

    var _format = function (s, c) {
      return s.replace(new RegExp("{(\\w+)}", "g"), function (m, p) {
        return c[p];
      });
    };
    var uri = { excel: 'data:application/vnd.ms-excel;base64,' };
    var template = { excel: '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>' };

    var _c = content;
    if (table) {
      // 样式合并处理
      var $clone = table.clone(false);
      $('body').append($clone);
      _c = _cssMaker($clone);
      $clone.remove();
    }
    // var _base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) };
    var ctx = { worksheet: worksheetName || 'sheet1', table: _c };
    var hrefvalue = uri.excel + _format(template.excel, ctx);
    // window.location.href = uri.excel + _base64(_format(template.excel, ctx));
    var $a = $('<a>');
    var href = URL.createObjectURL(new Blob([hrefvalue]));
    $a.attr('href', href).attr(
      'download', excelName);
    // 此处使用download属性来指定文件名，该属性仅在chrome和firefox浏览器内可用
    $('body').append($a);
    $a[0].click();
    $a.remove();
  };

  var excelExportTable = function (excelName, datastring) {
    var $table = $("<table>");
    var tbody = $("<tbody>");
    var datatr = datastring.split("\n");
    $.each(datatr, function (i, r) {
      var $tr = $("<tr>");
      var datatd = r.split(",");
      $.each(datatd, function (i, d) {
        d = d.replace(";", "");
        var $td = $("<td>");
        $tr.append($td);
        $td.append(d.replace("\"", ""));
      });
      tbody.append($tr);
    });
    $table.append(tbody);
    excelExporter(excelName, { table: $table }, "");
  }

  $.exporter = {
    /**
     *
     * @param {string} excelName
     * @param {object} params
     * @param {html片段} params.content
     * @param {jQuery对象} params.table
     * @param {string} params.worksheetName
     */
    csv2Excel: excelExportTable,
    excel: excelExporter
  };
})(jQuery);
