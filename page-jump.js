define([], function () {
  return {
    /**
     * 分页穿透
     * @param {String} url - 请求报表参数地址
     */
    pageJump: function (url) {
      if (url) {
        window.open(url);
      }
    },
    /**
     * 分页穿透
     * @param {String} url - 请求报表参数地址
     * @param {Object} urlParams - 请求的参数
     */
    pageJumpByParam: function (url, urlParams) {
      if (url) {
        var encodeUrl = window.encodeURI(JSON.stringify(urlParams));
        window.open(url + '?urlParams=' + encodeUrl);
      }
    },
    /**
     * 分页穿透（新窗口）
     * @param {String} url - 页面url地址
     * @param {String} name - 新窗口的名字
     * @param {Object} urlParams - 请求的参数
     */
    pageJumpOnNewWin: function (url, urlParams, name) {
      var pageName = '_blank' || name;
      if (url) {
        var encodeUrl = window.encodeURI(JSON.stringify(urlParams));
        window.open((url + '?urlParams=' + encodeUrl), pageName, 'location=no, width=1800, height=800');
      }
    }
  }
});