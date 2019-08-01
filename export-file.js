define([], function () {
  return {
    /**
     * 导出excel文件
     * @param {String} param - 请求报表参数json对象转换的字符串值
     */
    exportExcel: function (param, url, option) {
    	var fileOption = option || {};
    	// 下载成功后回调函数
    	var cb = function(){
    		$('.export-btn').removeClass('mini-loading');
    	}
    	$('.export-btn').addClass('mini-loading');
    	var params = 'params=' + encodeURI(encodeURI(JSON.stringify(param)));
    	var url = url ? (url + '?' + params) : ('/gwzjjk/common/report/exportExcel?' + params);
    	MAT.utils.downloadFile(url, fileOption, cb);
    },
    /**
     * 山东安全检查项目-导出excel文件
     * @param {String} param - 请求报表参数json对象转换的字符串值
     */
    sdExportExcel: function (param, url) {
     var  url = url?url:'/rest/gwzjjk/security/survey/exportExcel';
      $('#export-file-form').remove();
      var form = $("<form id='export-file-form' action='" + url + "' method='post'></form>")
      form.append("<input type='hidden' name='params' value='" + param + "'>");
      $(document.body).append(form);
      form.submit();
    }
  }
});