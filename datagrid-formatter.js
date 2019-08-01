/**
 * easyui-treegrid/datagrid组件的通用单元格格式化函数
 */
define([
  'utils/format-money',
  'utils/format-number',
  'utils/format-date'
], function (formatMoney, formatNumber, formatDate) {
  var formatters = {
    // 基础格式化样式
    baseFormat: function (data, metric, hightLightFields, pageSize, pageNumber) {
      if (!data) return;
      for (var i = 0, j = data.length; i < j; i++) {
        $.each(data[i], function (idx, item) {
          // 单元格格式
          item.formatter = function (val, row, index) {
            // 行序号
            if (item['field'] == 'rownumbers') {
              return (pageSize * (pageNumber - 1)) + (index + 1);
            }

            if ((!val && val !== 0) || val == '--') {
              return '<span>--</span>';
            }
            if (typeof (val) == 'string' && val.trim() == 'NULL') {
              return '<span>--</span>';
            }
            var cellValue = null;
            var spanHtml = '<span title="$title$">$value$</span>'
            switch (item['field_type']) {
              case '2':
                // 字段类型为整数类型
                cellValue = formatNumber(val);
                break;
              case '3':
                // 字段类型为日期类型
                if (new Date(val).getFullYear() >= 2999) {
                  cellValue = '--'
                } else {
                  cellValue = formatDate(new Date(val), 'YYYY-MM-dd');
                }
                break;
              case '4':
                // 字段类型为金额
                cellValue = formatMoney(val, metric);
                break;
              case '5':
                // 字段类型为百分数
                cellValue = (val * 100).toFixed(2) + '%';
                break;
              case '10':
                // 资金调控-资金管理概览-资金运作表格同比上下三角
                cellValue = val;
                var title = parseFloat(val).toFixed(2);
                spanHtml = '<span title="' + title + '">$value$</span>'
                break;
              default:
                cellValue = val;
                break;
            }
            return spanHtml.replace(/\$value\$/g, cellValue)
              .replace(/\$title\$/g, (cellValue + '').replace(/\"/g, '\''));
          }
        });
      }
    },
    // 带data-field的格式化，一般用于指定某些列数据高亮
    fieldFormat: function (data, metric, hightLightFileds, pageSize, pageNumber) {
      if (!data) return;
      for (var i = 0, j = data.length; i < j; i++) {
        $.each(data[i], function (idx, item) {
          // 单元格格式化
          item.formatter = function (val, row, index) {
            // 行序号
            if (item['field'] == 'rownumbers') {
              return (pageSize * (pageNumber - 1)) + (index + 1);
            }

            if ((!val && val !== 0) || val == '--') {
              return '<span class="value-span" data-field="' + item['field'] + '">--</span>';
            }
            if (typeof (val) == 'string' && val.trim() == 'NULL') {
              return '<span>--</span>';
            }
            var hightLightClass = '';
            if (hightLightFileds.indexOf(item['field']) >= 0) {
              hightLightClass = ' normal-hight-light';
            }
            var cellValue = null;
            var spanHtml = '<span class="value-span' + hightLightClass + '" data-field="' + item['field'] + '" title="$title$">$value$</span>'
            switch (item['field_type']) {
              case '2':
                // 字段类型为整数类型
                cellValue = formatNumber(val);
                break;
              case '3':
                // 字段类型为日期类型
                if (new Date(val).getFullYear() >= 2999) {
                  cellValue = '--'
                } else {
                  cellValue = formatDate(new Date(val), 'YYYY-MM-dd');
                }
                break;
              case '4':
                // 字段类型为金额
                cellValue = formatMoney(val, metric);
                break;
              case '5':
                // 字段类型为百分数
                cellValue = (val * 100).toFixed(2) + '%';
                break;
              case '8':
                // 字段类型为日期类型 转成时间秒类型
                if (new Date(val).getFullYear() >= 2999) {
                  cellValue = '--'
                } else {
                  cellValue = formatDate(new Date(val), 'YYYY-MM-dd HH:mm:ss');
                }
                break;
                // 汇率
              case '7':
                cellValue = (parseFloat(val)).toFixed(4);
                break;
              default:
                cellValue = val;
                break;
            }
            return spanHtml.replace(/\$value\$/g, cellValue)
              .replace(/\$title\$/g, (cellValue + '').replace(/\"/g, '\''));
          }
        });
      }
    },
  };
  return formatters;
});