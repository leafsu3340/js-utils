/**
 * js-cookie操作
 */

define([], function () {
  return {
    // 设置cookie
    setCookie: function (cname, cvalue, maxAge) {
      document.cookie = cname + '=' + cvalue + ';max-age=' + maxAge + ';';
    },
    // 获取cookie
    getCookie: function (cname) {
      var name = cname + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i += 1) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(name) !== -1) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    }
  }
});