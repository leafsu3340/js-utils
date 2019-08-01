/**
 * @file 日期格式化
 * @param {Date} date - 需要转换的时间
 * @param {String} formatStr - 需要获取的日期格式
 */
define([], function () {
  var format = function (date, formatStr) {
    var fmt = "";
    if(!formatStr){
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
    Object.keys(map).forEach(function(key){
      var value = map[key].toString();
      var replaceStr = str.length === 1 ? value : ("00" + value).slice(value.length);
      str = str.replace(new RegExp(key), replaceStr);
    });
    return str;
  }

  return format;
})