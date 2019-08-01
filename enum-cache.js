/**
 * 前端枚举接口.<br>
 * 根据枚举ID查找：
 * 1、优先浏览器缓存查找，有则返回枚举对象.<br>
 * 2、缓存没有则查询后台枚举对象，并缓存到本地.<br>
 * 
 * @author hjq
 * @time 2018年9月12日 16:08:17
 */
define([], function () {
  var cacheObj = {
    /**
     * 获取枚举对象
     * 
     * @param {Array} filtersData - 枚举数组内容
     * @param {Array} enumList - 枚举配置常量list
     * @param {String} tday - 时间
     * @returns {Object} 枚举对象
     */
    getEnumObj: function (filtersData, enumList, tday) {
      var that = this;
      var unEnumArr = [];
      var enumId = "";
      var cacheObj = {};
      $.each(enumList, function (index, item) {
        var enumObj = {};
        enumId = enumList[index].eumId;
        // 本地缓存查找枚举ID，是否包含枚举对象.
        cacheObj = MAT.utils.getItem("enumList");
        if (!cacheObj) {
          unEnumArr.push(item);
        } else {
          enumListtemp = JSON.parse(cacheObj);
          enumObj = enumListtemp[enumId];

          if (enumObj) {
            var newObj = {};
            newObj.phyName = item.phyName;
            newObj.filterTitle = item.eumVal;
            newObj.filterArray = enumObj;
            filtersData.push(newObj);
          } else {
            // 如果没有 再次push进unEnumArr
            unEnumArr.push(item);
          }
        }
      });
      if (unEnumArr.length > 0) {
        that.getEnumList(filtersData, tday, unEnumArr);
      }
    },
    /**
     * java请求获取枚举对象
     * 
     * @param {Array} filtersData - 枚举数组内容
     * @param {String} tday - 时间
     * @param {Array} unEnumArr - localstorage没有缓存的枚举list
     * @returns {Object} 枚举对象
     */
    getEnumList: function (filtersData, tday, unEnumArr) {
      var eumIds = [];
      $.each(unEnumArr, function (index, item) {
        eumIds.push(item.eumId);
      });
      var url = "/gwzjjk/common/enum/getEnumList";
      var params = {
        "enums": eumIds,
        "date": tday
      }; //date---> Controlller-@Params("date")
      var enumList = JSON.parse(MAT.utils.getItem("enumList"));
      if (!enumList) {
        enumList = {};
      }
      MAT.utils.postUrl(url, params, function (data) {
        var enumMap = data.obj;
        if (enumMap) {
          var enumId = "";
          $.each(unEnumArr, function (index, item) {
            var enumObj = {};
            enumId = item.eumId;
            // 枚举ID
            enumObj.phyName = item.phyName;
            // 枚举名称
            enumObj.filterTitle = item.eumVal;
            // 枚举数据
            enumObj.filterArray = enumMap[enumId];
            filtersData.push(enumObj);
            enumList[enumId] = enumMap[enumId];
          });
          MAT.utils.setItem("enumList", enumList);
        }
      });
    }
  };
  return cacheObj;
});