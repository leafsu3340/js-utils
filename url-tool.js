define([], function () {
  var urlTool = {
    // 设置url参数
    setParam: function (search, param, value) {
      var query = search.substring(1);
      var p = new RegExp("(^|)" + param + "=([^&]*)(|$)");
      if (p.test(query)) {
        var firstParam = query.split(param)[0];
        var secondParam = query.split(param)[1];
        if (secondParam.indexOf("&") > -1) {
          var lastPraam = secondParam.substring(secondParam.indexOf('&') + 1);
          return '?' + firstParam + param + '=' + value + '&' + lastPraam;
        } else {
          if (firstParam) {
            return '?' + firstParam + param + '=' + value;
          } else {
            return '?' + param + '=' + value;
          }
        }
      } else {
        if (query == '') {
          return '?' + param + '=' + value;
        } else {
          return '?' + query + '&' + param + '=' + value;
        }
      }
    },
    // 获取url-query
    getRequest: function () {
      const url = window.location.search; // 获取url中"?"符后的字串
      const theRequest = {};
      if (url.indexOf('?') !== -1) {
        const str = url.substr(1);
        const strs = str.split('&');
        for (var i = 0; i < strs.length; i += 1) {
          theRequest[strs[i].split('=')[0]] = unescape(decodeURI(strs[i].split('=')[1]));
        }
      }
      return theRequest;
    },
    // 生成参数
    genSearch: function (params) {
      var search = '';
      for (var key in params) {
        search += '&' + key + '=' + params[key];
      }
      return '?' + search.substring(1)
    }
  }
  return urlTool;
})