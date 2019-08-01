define([
  'plugins/numeral',
  'plugins/moment.min.js',
], function (numeral, moment) {
  return {
    /**
     * 行数据对应的单位转换
     * @param {*} model  行数据
     * @param {*} entity  实体类数据单位
     * @param {*} fieldMap 字段映射别名
     */
    convertModel: function (model, entity, fieldMap, dateType) {
      var m = {};
      var isDay = false;
      var digitsMap = entity.digitsMap || {};
      for (var key in model) {
        var unitMap = this.getUnitMap(entity[key]);
        var unit = unitMap.unit;
        var digits =
          unitMap.digits || unitMap.digits === 0 ? unitMap.digits : digitsMap[unit];
        var convertValue = this.convertUnit(model[key] || 0, unit, digits);
        // if (key === "nbzjscyzgmYdxt") {
        //   console.log("nbzjscyzgmYdxt: ", convertValue, model[key], digits, unit);
        // }
        var field = fieldMap && fieldMap[key] ? fieldMap[key] : key;
        m[field] = convertValue.value;
        if (key === "tday") {
          isDay = true;
          model[key] = model[key] + "";
        }
      }
      if (isDay) {
        m.month = model["tday"].substring(0, 6);
        m.year = model["tday"].substring(0, 4);
        m.tday = model["tday"] + "";
      }
      return m;
    },
    getUnitMap: function (keyMap) {
      if (keyMap) {
        if (typeof keyMap === "string") {
          return {
            unit: keyMap
          };
        }
        return keyMap;
      }
      return {
        unit: ""
      };
    },
    /**
     * 单位换算, 默认转换成亿元
     * 单位为个,保留整数
     * @param {*} num
     * @param {*} unit 万,亿,默认 为亿
     */
    convertUnit: function (num, unit, digits) {
      var tempUnit = unit || "亿"; // 默认转换成亿元
      var dividend = 100000000; // 默认亿
      var patrn = /^(\-|\+)?\d+(\.\d+)?$/;
      var moneyUnits = [{
          unit: "万",
          divide: 10000
        },
        {
          unit: "亿",
          divide: 100000000
        }
      ];

      var curentNum = num;
      var m = {
        old: num,
        value: num,
        unit: ""
      };

      if (num && patrn.test(num) && tempUnit.indexOf("!") <= -1) {
        // 是合法数字,转换
        //转换数字
        var curentUnit = tempUnit;
        var unitObj = [];
        var moneyUnitLen = moneyUnits.length;
        for (var i = 0; i < moneyUnitLen; i++) {
          if (moneyUnits[i].unit == tempUnit) {
            unitObj.push(moneyUnits[i]);
          }
        }
        dividend = unitObj && unitObj.divide ? unitObj.divide : dividend; // 默认亿
        if (unit === "个") {
          curentNum = this.toFloat(curentNum).toFixed(0);
        } else if (unit === "%") {
          curentNum = this.toFloat(curentNum) * 100;
          curentNum = this.toFixed(curentNum, digits);
          // if ((curentNum + "").indexOf(".") > -1) {
          //   curentNum = this.toFixed(curentNum, digits);
          // } else {
          //   curentNum = curentNum.toFixed(0);
          // }
        } else {
          // 元
          //转换单位 亿
          curentNum = curentNum / dividend;
          curentNum = this.toFixed(curentNum, digits);
        }
        m.value = curentNum;
        m.unit = curentUnit;
      } else {
        // 不用单位换算的数据,但需要保底小数位数
        if (digits == 0 || digits) {
          m.value = this.toFixed(curentNum, digits);
        }
      }

      return m;
    },
    /**
     * 计量单位全部统一显示：
     * 保留2位小数；
     * @param value
     * @param unit
     * @param deg
     */
    toFixed: function (value, digits) {
      if (digits === undefined || digits === null) {
        digits = 2;
      }
      var val = value;
      /* eslint-disable */
      var num = Number(value);
      if (!isNaN(num)) {
        if ((Number(value || 0) % 1) !== 0) {
          if (digits === 0) {
            val = Math.round(value || 0);
          } else {
            // 如果不是整型数据
            val = Number(value || 0).toFixed(digits); // 保留两位小数
          }
        } else {
          // 整型数据,也要保留位数
          val = Number(value || 0).toFixed(digits); // 保留两位小数
        }
      }
      return val;
    },
    toFloat: function (number) {
      return parseFloat(Number(number || 0) || 0);
    },
    /**
     * 千分位
     * @param {} value
     */
    addKamma: function (value, digits) {
      var pattern = "0,0";
      if (!Number.isInteger(value)) {
        if (digits > 1) {
          pattern += "." + new Array(digits).fill(0).join("");
        } else {
          if (value.toString().indexOf(".") > -1) {
            var d = value.toString().substring(value.toString().indexOf(".") + 1)
              .length;
            pattern += "." + new Array(d).fill(0).join("");
          } else {
            pattern += ""; //".0";
          }
        }
      }
      return numeral(value).format(pattern);
    },
    /**
     * 获取时间段，每隔5分钟一个节点
     * @param {*} param0
     */
    getTimeRange: function () {
      var interval = 5;
      var startHour = 9;
      var endHour = 18;
      var values = [];
      for (var i = startHour; i < endHour; i++) {
        var m = 0;
        for (var j = 0; j < 60 / interval; j++) {
          var date = moment()
            .hours(i)
            .minutes(m);
          if (m === 0) {
            values.push(date.format("HH"));
          } else {
            values.push(date.format("HH:mm"));
          }
          m = m + interval;
        }
      }
      return values;
    }
  }

});