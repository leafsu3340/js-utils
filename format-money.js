/**
 * 金额千分位格式化函数
 * @param {Number} val - 需要进行金额千分位的数值;
 * @param {Number} metric - 计量单位数值;
 */
define([], function () {
  var formatter = function (val, metric) {
    if(val == '--'){
      return val;
    }
    if((val != 0 && !val) || val === ''){
      return '--';
    }
    //将金额精确到两位小数
    val = (Math.round(parseFloat(val) * 100 / metric) / 100).toFixed(2).toString();
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
  return formatter;
});