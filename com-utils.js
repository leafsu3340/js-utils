/**
 * @file 数据转换方法集合.
 * @desc 已有方法：1.数据处理formatNum; 2.颜色处理colorDeal; 3.数据初始化处理initializaData; 4.日期转换格式formatDate
 * 相关函数：1.金额千分位格式化函数formatMoney
 */
define(['plugins/moment.min.js'], function (moment) {
  /**
   * 金额千分位格式化函数.
   * @param {Number} val - 需要进行金额千分位的数值;
   * @param {Number} metric - 计量单位数值;
   */
  var formatMoney = function (val, metric) {
    if (val == '--') {
      return val;
    }
    if ((val != 0 && !val) || val === '') {
      return '--';
    }
    //将金额精确到两位小数
    val = keepTwoDecimalFull(parseFloat(val) / metric).toString();
    //从小数点处分割
    var vals = val.split('.');
    //定义需要格式化的部分
    var pren = vals[0];
    //小数位
    var post = vals[1];
    //千分位
    var count = 0;
    var result = '';
    for (var i = pren.length - 1; i >= 0; i--) {
      count++;
      result = pren.charAt(i) + result;
      if (!(count % 3) && (i != 0 & pren.charAt(i - 1) != '-')) {
        result = ',' + result;
      }
    }
    return result + '.' + post;
  };
  /**
   * 强制保留两位小数(四舍五入),默认为两位小数,toFixed是五舍六入
   * @param {Number} num - 目标数
   * @param {Number} accuracy - 精确度
   */
  var keepTwoDecimalFull = function (num, accuracy) {
    var result = parseFloat(num);
    if (isNaN(result)) {
      alert('传递参数错误，请检查！');
      return false;
    }
    result = Math.round(num * 100) / 100;
    var s_x = result.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
      pos_decimal = s_x.length;
      s_x += '.';
    }
    accuracy = accuracy ? accuracy : 2;
    while (s_x.length <= pos_decimal + accuracy) {
      s_x += '0';
    }
    return s_x;
  }
  var formatData = {
    /**
     * 数据处理   1、字符串   2、金额千分位  3、百分比  4、保留两位小数
     * @param {Object} val - 需转化的数据
     * @param {Number} type - 需要进行的转化操作
     * @param {Number} metric - 计量单位数值
     * @returns {Object} 
     */
    formatNum: function (val, type, metric) {
      //非值处理
      if (val == '--' || (val != 0 && !val) || val === '') {
        return '--';
      }

      var ret = '';
      switch (type) {
        case 1:
          ret = val;
          break;
        case 2:
          ret = formatMoney(val, metric);
          break;
        case 3:
          ret = keepTwoDecimalFull(val * 100) + '%';
          break;

        default:
          break;
      }
      return ret;
    },

    /**
     * 颜色处理，判断数字大于零或小于零.
     * @param {Number} val - 数字
     * @returns {Boolean}
     */
    colorDeal: function (val) {
      if (val >= 0 || val === '--') {
        return true;
      } else {
        return false;
      }
    },

    /**
     * 数据初始化处理，将对象或数组中所有数据初始化为'--'.
     * @param {Array, Object} val - 对象或数组或两者兼有
     */
    initializaData: function (val) {
      if (val instanceof Array) {
        var valLen = val.length;
        for (var i = 0; i < valLen; i++) {
          if (val[i] instanceof Array || val[i] instanceof Object) {
            this.initializaData(val[i]);
          } else {
            val[i] = '--';
          }
        }
      } else if (val instanceof Object) {
        for (var key in val) {
          if (val.hasOwnProperty(key)) {
            if (val[key] instanceof Array || val[key] instanceof Object) {
              this.initializaData(val[key]);
            } else {
              val[key] = '--';
            }
          }
        }
      }
    },

    /**
     * 日期格式化
     * @param {Date} date - 需要转换的时间
     * @param {String} formatStr - 需要获取的日期格式
     * @returns {String} 
     */
    formatDate: function (date, formatStr) {
      var fmt = "";
      if (!formatStr) {
        fmt = 'YYYY-MM-dd HH:mm:ss';
      } else {
        fmt = formatStr;
      }
      var hour = date.getHours();
      var map = {
        '[Mm]+': date.getMonth() + 1, // 月份
        '[Dd]+': date.getDate(), // 日
        'H+': hour, // 小时
        'h+': hour % 12 || 12, // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds(), // 毫秒
        a: hour >= 12 ? 'pm' : 'am',
        A: hour >= 12 ? 'PM' : 'AM',
      };
      var str = fmt.replace(/[Yy]+/g, JSON.stringify(date.getFullYear()));
      Object.keys(map).forEach(function (key) {
        var value = map[key].toString();
        var replaceStr = (str.length === 1 ? value : ("00" + value).slice(value.length));
        str = str.replace(new RegExp(key), replaceStr);
      });
      return str;
    },

    /**
     * 获取当前日期 yyyy年MM月dd日
     */
    getLastDate: function () {
      var newDate = new Date();
      var ret = newDate.getFullYear() + '年' + (newDate.getMonth() + 1) + '月' + newDate.getDate() + '日';
      return ret;
    },

    /**
     * 获取本日初时间戳
     * 
     * @param {String} now - 当前时间
     */
    getBeginOfToday: function (now) {
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        nowDate.setHours(0);
        nowDate.setMinutes(0);
        nowDate.setSeconds(0);
        return nowDate.valueOf();
      }
      return now;
    },

    /**
     * 获取本日初时间字符
     * 
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getBeginOfTodayStr: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        return this.formatDate(new Date(now), formatStr) + " 00:00:00";
      }
      return now;
    },

    /**
     * 获取本日末时间戳
     * 
     * @param {String} now - 当前时间
     */
    getEndOfToday: function (now) {
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Data(now);
        nowDate.setHours(23);
        nowDate.setMinutes(59);
        nowDate.setSeconds(59);
        return nowDate.valueOf();
      }
      return now;
    },

    /**
     * 获取本日末时间字符
     * 
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getEndOfTodayStr: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        return this.formatDate(new Date(now), formatStr) + " 23:59:59";
      }
      return now;
    },

    /**
     * 获取本月初时间戳
     * 
     * @param {String} now - 当前时间
     */
    getBeginOfMonth: function (now) {
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var beginOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
        beginOfMonth.setHours(0);
        beginOfMonth.setMinutes(0);
        beginOfMonth.setSeconds(0);
        return beginOfMonth.valueOf();
      }
      return now;
    },

    /**
     * 获取本月初时间字符
     * 
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getBeginOfMonthStr: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var beginOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
        return this.formatDate(beginOfMonth, formatStr) + " 00:00:00";
      }
      return now;
    },

    /**
     * 获取本月初日期
     * 
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getBeginDateOfMonth: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var beginOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
        return this.formatDate(beginOfMonth, formatStr);
      }
      return now;
    },

    /**
     * 获取本年初时间戳
     * 
     * @param {String} now - 当前时间
     */
    getBeginOfToYear: function (now) {
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        // 时间类型
        var timeStr = new Date(now).getFullYear() + "-01-01 00:00:00";
        return new Date(timeStr).valueOf();
      }
      return now;
    },

    /**
     * 获取本年初时间字符
     * 
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getBeginOfToYearStr: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var newDate = new Date(nowDate.getFullYear() + "-01-01");
        return this.formatDate(newDate, formatStr) + " 00:00:00";
      }
      return now;
    },

    /**
     * 获取本月末时间戳
     * @param {String} now - 当前时间
     */
    getEndOfMonth: function (now) {
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var endOfMonth = new Date(nowDate.getFullYear(), (nowDate.getMonth() + 1), 0);
        endOfMonth.setHours(23);
        endOfMonth.setMinutes(59);
        endOfMonth.setSeconds(59);
        return endOfMonth.valueOf();
      }
      return now;
    },

    /**
     * 获取本月末时间字符
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getEndOfMonthStr: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var endOfMonth = new Date(nowDate.getFullYear(), (nowDate.getMonth() + 1), 0);
        return this.formatDate(endOfMonth, formatStr) + " 23:59:59";
      }
      return now;
    },

    /**
     * 获取本月末日期
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getEndDateOfMonth: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var endOfMonth = new Date(nowDate.getFullYear(), (nowDate.getMonth() + 1), 0);
        return this.formatDate(endOfMonth, formatStr);
      }
      return now;
    },

    /**
     * 获取上月末时间戳
     * @param {String} now - 当前时间
     */
    getEndOfLastMonth: function (now) {
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var lastendMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
        lastendMonth.setHours(23);
        lastendMonth.setMinutes(59);
        lastendMonth.setSeconds(59);
        return lastendMonth.valueOf();
      }
      return now;
    },

    /**
     * 获取上月末时间字符
     * @param {String} now - 当前时间
     * @param {String} format - 格式化字符
     */
    getEndOfLastMonthStr: function (now, format) {
      var formatStr = format ? format : 'YYYY/MM/dd';
      if (isNaN(now) && !isNaN(Date.parse(now))) {
        var nowDate = new Date(now);
        var lastendMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
        return this.formatDate(lastendMonth, formatStr) + " 23:59:59";
      }
      return now;
    },

    /**
     * 一组对象的某个属性进行排序
     */
    sortObject: function (array, arrt, type) {
      array = array.sort(function (a, b) {
        var x = a[arrt];
        var y = b[arrt];
        if (type == 'desc') {
          return ((x > y) ? -1 : (x < y) ? 1 : 0)
        } else {
          return ((x > y) ? 1 : (x < y) ? -1 : 0)
        }
      });
    },
    /**
     * 强制保留小数(四舍五入),toFixed是五舍六入(默认2位)
     * @param {Number} num - 目标数
     * @param {Number} accuracy - 精确度
     */
    keepTwoDecimalFull: function (num, accuracy) {
      var result = parseFloat(num);
      if (isNaN(result)) {
        return '--';
      }
      result = Math.round(num * 100) / 100;
      var s_x = result.toString();
      var pos_decimal = s_x.indexOf('.');
      if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
      }
      accuracy = accuracy ? accuracy : 2;
      while (s_x.length <= pos_decimal + accuracy) {
        s_x += '0';
      }
      return s_x;
    },

    /**
     * 获取当前时间前一天日期.
     * @param {String} formatStr - 返回日期的格式，默认为yyyy-MM-dd
     */
    getPreCurDate: function (formatStr) {
      var forStr = formatStr || 'yyyy-MM-dd';
      var date = new Date();
      var preDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
      var resDate = new Date(preDate).Format(forStr);
      return resDate;
    },

    /**
     * 计量单位全部统一显示：
     * 保留2位小数；
     * @param value
     * @param digits
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

    /**
     * 浮点格式
     */
    toFloat: function (number) {
      return parseFloat(Number(number || 0) || 0);
    },

    /**
     * 前几个月的日期数组
     * @param {Date}  currentDate - 当前计算的日期
     * @param {Number} num  数字
     * 如：num=6, 前6个月的月份数据
     * num=12, 前12个月的月份数据
     * @param {Boolean} isContain - 是否不包含当前月
     * @param {String} format - 输出日期格式
     */
    getLastMonthsByNum: function (currentDate, num, isContain, format) {
      var formatStr = format || 'YYYYMM';
      if (num) {
        var date = currentDate;
        // 是否不包含当前月
        if (isContain === false) {
          date = new Date(currentDate.getTime());
          date.setMonth(date.getMonth() - 1);
        }
        var months = [];
        for (var i = num - 1; i >= 0; i--) {
          months.push(
            moment(date).subtract(i, "months")
            .format(formatStr)
          );
        }
        return months;
      }
      return [];
    },

    /**
     * 前几个月的最后一天(本月选择当天)
     * @param {Date}  currentDate - 当前计算的日期
     * @param {Number} num  数字
     * 如：num=6, 前6个月的月份数据
     * num=12, 前12个月的月份数据
     * @param {Boolean} isContain - 是否不包含当前月 true包含 当前月不取最后一天,取当前日期
     * @param {String} format - 输出日期格式
     */
    getLastDayMonthsByNum: function (currentDate, num, isContain, format) {
      var formatStr = format || 'YYYYMMDD';
      if (isContain) {
        num = num - 1;
      }
      if (num) {
        var date = currentDate;
        // 是否不包含当前月
        var months = [];
        for (var i = num; i > 0; i--) {
          months.push(
            this.getEndDateOfMonth(moment(date).subtract(i, "months").format('YYYY/MM/DD'), formatStr)
          );
        }
        if (isContain) {
          months.push(moment(date).format(formatStr))
        }
        return months;
      }
      return [];
    },

    /**
     * 获取当前月的所有日期
     * @param {Date} currentDate - 当前日期 
     */
    getFullDateOfMonth: function (currentDate, format) {
      var date = currentDate || new Date();
      var lastDay = new Date(date.getFullYear(), (date.getMonth() + 1), 0);
      var dayNum = lastDay.getDate();
      var formatStr = format || 'YYYYMM';
      var days = [];
      for (var i = dayNum - 1; i >= 0; i--) {
        days.push(
          moment(lastDay)
          .subtract(i, "days")
          .format(formatStr)
        );
      }
      return days;
    },

    /**
     * 判断变量类型函数
     * @param {*}  - 变量
     * @return {String} - 类型
     */
    typeOfVal: function (val) {
      var typeStr = Object.prototype.toString.apply(val).toLocaleLowerCase();
      switch (typeStr) {
        case '[object object]':
          return 'object';
        case '[object array]':
          return 'array';
        case '[object number]':
          return 'number';
        case '[object string]':
          return 'string';
        case '[object boolean]':
          return 'boolean';
        case '[object date]':
          return 'date';
        case '[object null]':
          return 'null';
        case '[object function]':
          return 'function';
        case '[object undefined]':
          return 'undefined';
        default:
          return 'undefined';
      }
    }
  };

  return formatData;
})