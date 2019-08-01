define([], function () {
  return {
    /**
     * 获取根据organid排序后的对象数组
     * @param {Array} organIds - organid数组集合
     * @param {Array} organNames - organname数组集合
     */
    arrayToObjArray: function (organIds, organNames) {
      var arr = [];
      $.each(organIds, function (idx, item) {
        var newObj = {
          id: item,
          name: organNames[idx]
        };
        arr.push(newObj);
      })
      // 根据organ-code本地排序
      return arr.sort(function (obj1, obj2) {
        var val1 = obj1['id'];
        var val2 = obj2['id'];
        if (val1 == '9999') {
          return -1;
        }
        if (val2 == '9999') {
          return 1;
        }
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1);
          val2 = Number(val2);
        }
        if (val1 < val2) {
          return -1;
        } else if (val1 > val2) {
          return 1;
        } else {
          return 0;
        }
      });
    },
    /**
     * 获取默认organid
     * @method
     */
    getDefaultOrgan: function () {
      var loginContent = JSON.parse(MAT.utils.getItem('loginContent'));
      if(loginContent.rolecodes.indexOf('ROLE_ADMIN')>-1){
    	  return {
    		  id: 'admin',
    		  name: '系统管理员'
    	  }
      }
      var organNames = loginContent.organizationnames;
      var orIds = loginContent.organizationcodes;
      var arr = this.arrayToObjArray(orIds, organNames);
      return arr[0];
    },
    /**
     * 获取默认organ映射
     * @method
     */
    getOrganMap: function () {
      var loginContent = JSON.parse(MAT.utils.getItem('loginContent'));
      var organNames = loginContent.organizationnames;
      var orIds = loginContent.organizationcodes;
      var map = {};
      $.each(orIds, function (idx, id) {
        map[id] = organNames[idx];
      })
      return map;
    }
  }
});