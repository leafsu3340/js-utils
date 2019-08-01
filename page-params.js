/**
 * 目前需要保存的全局页面参数有：
 * metric-计量单位；tday：查询日期；organId-选择的组织机构；rootOrgan：组织结构树根节点id
 */
define([
  './handle-loginContent',
  './format-date'
], function (handleContent, formatDate) {
  var manage = {
    /**
     * 获取localstorage中的页面参数
     */
    getPageParam: function () {
      var initDate = ''; // 日期
      var rootOrgan = ''; // 组织结构树根节点
      var organId = ''; // 组织结构树选择节点
      var initMetric = 1; // 计量单位
      var hideEdtDateTip = false; // 空白页提示开关
      var landingDate = '';  // 首页数据更新时间
      var initPageParams = MAT.utils.getItem('initPageParams');
      // 获取默认organid
      var defaultOrgan = handleContent.getDefaultOrgan() || {};
      // 若无organid，提示错误
      if (!defaultOrgan.id) {
        MAT.utils.notific('无组织机构，请联系管理员', 'error');
        return;
      } else if (defaultOrgan.id == 'admin'){
    	return defaultOrgan;
      }
      if (!initPageParams) {
        // tday取前一天时间值
        initDate = formatDate(new Date(new Date() - 24 * 60 * 60 * 1000), 'YYYY-MM-dd');
        // 默认根节点和选择节点
        rootOrgan = defaultOrgan.id;
        organId = defaultOrgan.id;
        // 默认计量单位为亿元
        initMetric = 100000000;
        // 设置页面参数
        var pageParam = {
          metric: initMetric,
          organId: defaultOrgan.id,
          tday: initDate,
          rootOrgan: defaultOrgan.id,
          hideEdtDateTip: false,
          landingDate: ''
        };
        MAT.utils.setItem('initPageParams', JSON.stringify(pageParam));
      } else {
        var initObj = JSON.parse(initPageParams);
        initMetric = initObj.metric;
        initDate = initObj.tday;
        organId = initObj.organId ? initObj.organId : defaultOrgan.id;
        rootOrgan = initObj.rootOrgan ? initObj.rootOrgan : defaultOrgan.id;
        hideEdtDateTip = initObj.hideEdtDateTip ? initObj.hideEdtDateTip : false;
        landingDate = initObj.landingDate ? initObj.landingDate : ''
      };
      return {
        initDate: initDate,
        initMetric: initMetric,
        rootOrgan: rootOrgan,
        organId: organId,
        hideEdtDateTip: hideEdtDateTip,
        landingDate: landingDate
      }
    },
    // 设置localstorage页面参数
    setPageParams: function (valObj) {
      var initPageParams = MAT.utils.getItem('initPageParams');
      var initObj = JSON.parse(initPageParams) || {};
      for (var key in valObj) {
        initObj[key] = valObj[key];
      };
      MAT.utils.setItem('initPageParams', JSON.stringify(initObj));
    }
  };

  return manage;

});