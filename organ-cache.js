/**
 * 组织机构缓存机制
 */
define(['js/gwzjjk-const'], function (ZJJK_CONST) {
  return {
    /**
     * 获取organList，取缓存或ajax取值
     * @param {Index}     me - 调用函数的作用域this
     * @param {String}    rootOrgan - 根节点ID
     * @param {String}    defaultOrgan - 选择的节点ID
     * @param {Function}  fallback - 回调函数
     * @param {Number}    organType - 目前 0 - 国网； 1 - 山东
     * @param {Object}    extendOrg - 传递参数
     */
    getOrganList: function (me, rootOrgan, defaultOrgan, fallback, organType, extendOrg) {
      var orgCacheId = rootOrgan + '-' + organType;
      var organList = MAT.utils.getItem('gwzjjk-organList');
      if ((!organList) || (!JSON.parse(organList)[orgCacheId]) || (!JSON.parse(organList)[orgCacheId].length)) {
        var url = rootOrgan == ZJJK_CONST.gwOrganId ? '/gwzjjk/common/organ/getAllOrganList' : '/gwzjjk/common/organ/getOrganList';
        if (organType === 1) {
          url = '/gwzjjk/common/organ/getOrganList';
        }
        var param = {
          organId: rootOrgan,
          type: organType // 0 - 国网组织机构； 1 - 山东组织机构表
        };
        MAT.utils.getUrl(url, param, function (res) {
          var resData = res.obj || [];
          var orgObj = {};
          orgObj[orgCacheId] = resData;
          MAT.utils.setItem('gwzjjk-organList', JSON.stringify(orgObj));
          fallback(me, rootOrgan, defaultOrgan, resData, extendOrg)
        })
      } else {
        var resData = JSON.parse(organList)[orgCacheId];
        fallback(me, rootOrgan, defaultOrgan, resData, extendOrg)
      }
    }
  }
});