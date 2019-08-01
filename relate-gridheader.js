/**
 * easyui-datagrid-寻找所有父级表头名称，输出级联所有表头的路径名称
 * 输出的表头字段中
 * @param {Array} headerList - easyui表头字段(二维数组)
 * 属性：pathName - 表头路径名，包含该表头的所有父级表头名称，使用“>>”分隔；
 * colStart - 表头单元格的位置列坐标(始端)；
 * colEnd   - 表头单元格的位置列坐标(末端)；
 * rowStart - 表头单元格的位置行坐标(始端)；
 * rowEnd   - 表头单元格的位置行坐标(末端)；
 */
define([], function () {
  return {
    computeRelation: function (headerList) {
      var list = headerList;
      if(!list){
        // undefined
        return list;
      }
      for (var i = 0, iLen = list.length; i < iLen; i++) {
        for (var j = 0, jLen = list[i].length; j < jLen; j++) {
          var item = list[i][j]; // 当前遍历的表头字段
          // 第一行
          if (i == 0) {
            // 行始端坐标为0
            item.rowStart = 0;
            // 行始端坐标为该字段的行高
            item.rowEnd = item.rowspan;
            // 表头路径名为该字段的字段名
            item.pathName = item.title;
            if (j == 0) {
              // 第一列
              item.colStart = 0;
              item.colEnd = item.colspan;
            } else {
              // 其他列，由该行的上列计算该列坐标
              item.colStart = list[i][j - 1].colEnd || 0;
              item.colEnd = (list[i][j - 1].colEnd || 0) + item.colspan;
            }
          } else {
            /**
             * 其他行的坐标计算，通过遍历上一行的表头单元格，若其rowEnd小于等于当前行索引可视为该表头单元格不跨行。
             */
            for (var k = 0, kLen = list[i - 1].length; k < kLen; k++) {
              var preItem = list[i - 1][k]; // 上一行的表头字段
              if (i >= preItem.rowEnd) {
                // 排除跨行项
                if (j == 0 || (list[i][j - 1].colEnd <= preItem.colStart)) {
                  // 第一列或当前单元格与上列单元格不属于同一父级，基于父级单元格计算单元格列坐标
                  item.rowStart = preItem.rowEnd;
                  item.rowEnd = preItem.rowEnd + item.rowspan;
                  item.colStart = preItem.colStart || 0;
                  item.colEnd = (preItem.colStart || 0) + item.colspan;
                  item.pathName = preItem.pathName + '>>' + item.title;
                  break;
                } else if ((list[i][j - 1].colEnd < preItem.colEnd) &&
                  (list[i][j - 1].colEnd > preItem.colStart)) {
                  // 当前单元格与上列单元格属于同一父级，基于上列单元格计算单元格列坐标
                  item.rowStart = preItem.rowEnd;
                  item.rowEnd = preItem.rowEnd + item.rowspan;
                  item.colStart = list[i][j - 1].colEnd || 0;
                  item.colEnd = (list[i][j - 1].colEnd || 0) + item.colspan;
                  item.pathName = preItem.pathName + '>>' + item.title;
                  break;
                }
              }
            }
          }
        }
      }
      return list;
    }
  }
});