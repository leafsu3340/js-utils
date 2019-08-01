/**
 * 整数千分位格式化函数
 * @param {Number} val - 整数值;
 */
define([], function () {
  var formatter = function (val) {
    if(val==0){
      return '0';
    }
    //千分位
    var pren = val.toString();
    var count = 0;
    var result = '';
    for (var i = pren.length - 1; i >= 0; i--) {
      count++;
      result = pren.charAt(i) + result;
      if (!(count % 3) && (i != 0 & pren.charAt(i - 1) != '-')) {
        result = ',' + result;
      }
    }
    return result;
  };
  return formatter;
});