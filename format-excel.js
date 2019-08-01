/**
 * @file 日期格式化
 * @param {Date} date - 需要转换的时间
 * @param {String} formatStr - 需要获取的日期格式
 */
define([], function () {
    var formatExcel = {
        // 格式化单元格数据
        fmtCellData: function (value) {
            var celldata = [];
            var that = this;
            if (String(value).indexOf("%") != -1) {
                // 格式化带有百分比的数值
                celldata.push(value.replace("%", "") / 100);
                celldata.push("0.00%");
            } else if (String(value).indexOf(".") != -1) {
                // 格式化不带百分比的数值
                var val = String(value).replaceAll(",", "");
                celldata.push(val);
                var length = String(val).split(".")[0].length;
                if (length > 3) {
                    var z = that.formatterQianfen(length);
                    celldata.push(z + '.00');
                } else {
                    celldata.push('0.00');
                }
            } else {
                celldata.push(value);
                var length = String(value).length;
                // 为数量类型数据加上千分符
                if (length > 3) {
                    var z = that.formatterQianfen(length);
                    celldata.push(z);
                }
                celldata.push('0');
            }
            return celldata;
        },
        
        // 格式化千分符
        formatterQianfen: function (length) {
            var z = length % 3 == 0 ? '' : '0,';
            var l = (length - length % 3) / 3;
            for (var i = 0; i < l; i++) {
                if (i == 0) {
                    z += "000";
                    continue;
                }
                z += ",000";
            }
            return z;
        },

        // 通过在xAxis或者series定义的方法格式化对应的数据
        formatterData: function (formatter, data, metric) {
            var UnitConst = {
                "元": 1,
                "万元": 10000,
                "亿元": 100000000
            };
            if (formatter != undefined && formatter.length != 0) {
                var l = formatter.length;
                for (var i = 0; i < l; i++) {
                    if (metric != undefined) {
                        data = formatter[i](data, UnitConst[metric]);
                    } else {
                        data = formatter[i](data);
                    }
                }
            }
            return data;
        }
    }

    return formatExcel;
})