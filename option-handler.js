/**
 * 数据视图表格
 */
define([
  'echarts',
  'utils/format-money',
  'utils/format-excel',
  'utils/saveAsExcel',
  'css!../../src/css/option-handler.css'
], function (echarts, formatMoney, formatExcel, saveAsExcel) {
  var dataViewTable = {

    // 加载下载组件
    loadtoolbox: function (id, echartIds) {
      var that = this;
      // 设置下载Excel和图片的图标的点击事件以及移入移出事件
      $("#" + id).addClass("toolbox_excel_pic");
      $("#" + id).html("<div class='download_excel' title='下载Excel'></div><div class='download_pic' title='下载图片'></div>");
      $("#" + id + " .download_excel").hover(
        function () {
          $(this).css({
            'background-position': 'bottom'
          });
        },
        function () {
          $(this).css({
            'background-position': 'top'
          });
        }
      ).click(function () {
        // 通过echarts的ID来拿到图表的option
        switch (Object.prototype.toString.call(echartIds)) {
          case '[object String]':
            var echartObj = echarts.getInstanceByDom(document.getElementById(echartIds));
            that.downloadExcel(echartObj._api.getOption());
            break;
          case '[object Array]':
            var len = echartIds.length;
            for (var i = 0; i < len; i++) {
              var echartObj = echarts.getInstanceByDom(document.getElementById(echartIds[i]));
              that.downloadExcel(echartObj._api.getOption());
            }
            break;
          default:
            break;
        }
      });
      $("#" + id + " .download_pic").hover(
        function () {
          $(this).css({
            'background-position': 'bottom'
          });
        },
        function () {
          $(this).css({
            'background-position': 'top'
          });
        }
      ).click(function () {
        switch (Object.prototype.toString.call(echartIds)) {
          case '[object String]':
            var echartObj = echarts.getInstanceByDom(document.getElementById(echartIds));
            that.getEchartsDataURL(echartObj._api.getOption(), echartObj);
            break;
          case '[object Array]':
            var len = echartIds.length;
            for (var i = 0; i < len; i++) {
              var echartObj = echarts.getInstanceByDom(document.getElementById(echartIds[i]));
              that.getEchartsDataURL(echartObj._api.getOption(), echartObj);
            }
            break;
          default:
            break;
        }

      });
    },

    downloadExcel: function (opt) {
      var that = this;
      // Excel的文件名和标题
      var excelTitle = opt.excelTitle;
      var echartType = opt.type ? opt.type : ((opt.series || [])[0] || {}).type;
      var excelData = [];
      switch (echartType) {
        case 'bar':
          excelData = that.handleBarData(opt);
          break;
        case 'line':
          excelData = that.handleBarData(opt);
          break;
        case 'pie':
          excelData = that.handlePieData(opt);
          break;
        default:
          excelData = opt.excelData || [];
          break;
      }
      var sheet = that.formatterExcel(excelData, excelTitle, opt);
      that.openDownloadDialog(that.sheet2blob(sheet, excelTitle), excelTitle + ".xlsx");
    },

    // 下载图片
    getEchartsDataURL: function (opt, api) {
      // 导出图片配置
      var setting = {
        type: "jpeg", // 导出的格式，可选png，jpeg
        pixelRation: 1, // 导出的图片分辨率比例，默认为1
        backgroundColor: '#fff', // 导出的图片背景色，默认使用option里的backgroundColor
        excludeComponents: ['toolbox'] // 忽略组件的列表
      };
      // 下载的文件名
      var title = opt.excelTitle + ".jpg";
      // 下载操作
      var saveAs = function (title, imgUrl) {
        var base64ToBlob = function (code) {
          var parts = code.split(';base64,');
          var contentType = parts[0].split(':')[1];
          var raw = window.atob(parts[1]);
          var rawLength = raw.length;
          var uInt8Array = new Uint8Array(rawLength);
          for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          return new Blob([uInt8Array], {
            type: contentType
          });
        };
        var $a = document.createElement("a");
        var blob = base64ToBlob(imgUrl);
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", true, true);
        $a.download = title;
        $a.href = URL.createObjectURL(blob);
        $a.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      };
      saveAs(title, api.getDataURL(setting));
    },

    // 处理柱图和折线图的数据
    handleBarData: function (opt) {
      var that = this;
      var metric = opt.metric[0];
      var excelData = [];
      //var HeaderData = [opt.xAxisTitle];
      // 组装Excel表格的head部分
      var HeaderData = [""];
      $.map(opt.series, function (item) {
        HeaderData.push(item.name);
      });
      excelData.push(HeaderData);
      // 格式化X轴数据的方法
      var formatterAxis = opt.xAxis[0].formatterData;
      if (opt.xAxis[0].data.length == 0) {
        return excelData;
      }
      // 组装Excel表格的body部分
      var lineData, value;
      for (var i = 0, l = opt.series[0].data.length; i < l; i++) {
        lineData = [formatExcel.formatterData(formatterAxis, opt.xAxis[0].data[i])];
        $.map(opt.series, function (item) {
          value = item.data[i]["value"];
          if (typeof item.data[i] != "object") {
            value = item.data[i];
          }
          lineData.push(formatExcel.formatterData(item.formatterData, value, metric));
        });
        excelData.push(lineData);
      }
      return excelData;
    },

    // 处理饼图的数据
    handlePieData: function (opt) {
      var that = this;
      var metric = opt.metric[0];
      var excelData = [];
      //var HeaderData = [opt.seriesTitle == undefined ? "维度" : opt.seriesTitle];
      // 组装占比
      opt.series = that.addPre(opt.series);
      // 组装Excel表格的head部
      var HeaderData = [""];
      $.map(opt.series, function (item) {
        HeaderData.push(item.name);
      });
      excelData.push(HeaderData);
      // 组装Excel表格的body部分
      var lineData, value;
      for (var i = 0, l = opt.series[0].data.length; i < l; i++) {
        lineData = [opt.series[0].data[i]["name"]];
        $.map(opt.series, function (item, index) {
          value = item.data[i]["value"];
          if (typeof item.data[i] != "object") {
            value = item.data[i];
          }
          lineData.push(formatExcel.formatterData(item.formatterData, value, metric));
        });
        excelData.push(lineData);
      }
      return excelData;
    },

    addPre: function (series) {
      var newSeries = [];
      var totalData = [],
        total = 0,
        sericeTitle = [],
        value;
      // 计算得出所有series的总值
      $.map(series, function (item, index) {
        total = 0;
        sericeTitle.push(series[index].name + "占比");
        for (var i = 0, l = series[index].data.length; i < l; i++) {
          value = series[index].data[i]["value"];
          if (typeof series[index].data[i] != "object") {
            value = series[index].data[i];
          }
          total += Number(value);
        }
        totalData.push(total);
      });
      // 计算得出饼图的占比
      var newSer = {};
      $.map(totalData, function (item, index) {
        newSer = {
          name: sericeTitle[index],
          type: 'pie',
          data: []
        };
        for (var i = 0, l = series[index].data.length; i < l; i++) {
          value = series[index].data[i]["value"];
          if (typeof series[index].data[i] != "object") {
            value = series[index].data[i];
          }
          newSer.data.push((value / item) * 100 + "%");
        }
        newSeries.push(series[index]);
        newSeries.push(newSer);
      });
      return newSeries;
    },

    // 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
    sheet2blob: function (sheet, sheetName) {
      sheetName = sheetName || 'sheet1';
      var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
      };
      workbook.Sheets[sheetName] = sheet;
      // 生成excel的配置项
      var wopts = {
        bookType: 'xlsx', // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
      };
      var wbout = XLSX.write(workbook, wopts);
      var blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
      });

      // 字符串转ArrayBuffer
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
      }

      return blob;
    },

    // 下载Excel文件
    openDownloadDialog: function (url, saveName) {
      if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url); // 创建blob地址
      }
      var aLink = document.createElement('a');
      aLink.href = url;
      aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
      var event;
      if (window.MouseEvent) event = new MouseEvent('click');
      else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      }
      aLink.dispatchEvent(event);
    },

    // 格式化excel
    formatterExcel: function (excelData, excelTitle, opt) {
      var that = this;
      var borderAll = { //单元格外侧框线
        top: {
          style: 'thin'
        },
        bottom: {
          style: 'thin'
        },
        left: {
          style: 'thin'
        },
        right: {
          style: 'thin'
        }
      };
      // 单元格宽度
      var cellWidth = 200;
      // excel列数
      var colsNum = excelData[0].length;
      colsNum = colsNum < 6 ? 6 : colsNum;
      // 表格字母
      var excelCode = that.getExcelCode(colsNum);
      // 设置表格显示范围
      var ref = "A1:" + excelCode[excelCode.length - 1] + (excelData.length + 5);
      // 设置单元格的宽度
      var cols = [];
      for (var i = 0; i < colsNum; i++) {
        cols.push({
          wpx: cellWidth
        })
      }
      // 字体大小
      var fontSize = 10;
      // 表格字体
      var font = {
        name: 'Arial',
        sz: 10,
        bold: false
      }
      var metric = "";
      var metric_leng = opt.metric.length;
      for (var i = 0; i < metric_leng; i++) {
        if (i == 0) {
          metric += opt.metric[i];
          continue;
        }
        metric += ',' + opt.metric[i];
      }
      //合并单元格
      var optMerges = opt.merges || [];
      var optMergesLen = optMerges.length;
      var merges = [{
        s: { // s start 开始
          c: 0, // cols 开始列
          r: 0 // rows 结束行
        },
        e: { // e end 结束
          c: colsNum < 6 ? 5 : (colsNum - 1), //根据列数判断需要合并的单元格个数
          r: 0
        }
      }];

      var colspan = '';
      var rowspan = '';
      for (var i = 0; i < optMergesLen; i++) {
        const element = optMerges[i];
        colspan = element.colspan || 1;
        rowspan = element.rowspan || 1;
        merges.push({
          s: { // s start 开始
            c: element.xIndex, // cols 开始列
            r: element.index + 3 // rows 开始行
          },
          e: { // e end 结束
            c: element.xIndex + colspan - 1, //根据列数判断需要合并的单元格个数
            r: element.index + rowspan + 3 - 1
          }
        })
      }

      var sheet = {
        '!ref': ref,
        '!cols': cols,
        '!merges': merges,
        'A1': {
          v: excelTitle,
          t: 's',
          s: {
            font: {
              name: 'Arial',
              sz: 16,
              bold: true
            },
            alignment: {
              horizontal: 'center'
            }
          }
        },
        'A2': {
          v: '单位：',
          t: 's',
          s: {
            font: {
              name: 'Arial',
              sz: fontSize,
              bold: true
            },
            alignment: {
              horizontal: 'left'
            }
          }
        },
        'B2': {
          v: opt.globalParams.organName,
          t: 's',
          s: {
            font: font,
            alignment: {
              horizontal: 'left'
            }
          }
        },
        'C2': {
          v: '时间：',
          t: 's',
          s: {
            font: {
              name: 'Arial',
              sz: fontSize,
              bold: true
            },
            alignment: {
              horizontal: 'left'
            }
          }
        },
        'D2': {
          v: opt.globalParams.tday || opt.globalParams.eDate,
          t: 's',
          s: {
            font: font,
            alignment: {
              horizontal: 'left'
            }
          }
        },
        'E2': {
          v: '度量单位：',
          t: 's',
          s: {
            font: {
              name: 'Arial',
              sz: fontSize,
              bold: true
            },
            alignment: {
              horizontal: 'left'
            }
          }
        },
        'F2': {
          v: metric,
          t: 's',
          s: {
            font: font,
            alignment: {
              horizontal: 'left'
            }
          }
        }
      };
      // 表格头部样式
      var titleS = {
        fill: {
          fgColor: {
            rgb: "FFC0C0C0"
          }
        },
        font: {
          name: 'Arial',
          sz: 10,
          bold: true,
          color: {
            rgb: "ffffffff"
          }
        },
        alignment: {
          horizontal: 'center'
        },
        border: borderAll
      };
      // 表格内部样式
      var bodyS1 = {
        font: font,
        alignment: {
          horizontal: 'left'
        },
        border: borderAll
      }
      var bodyS2 = {
        font: font,
        alignment: {
          horizontal: 'right'
        },
        border: borderAll
      }
      // 组装表格
      var value, cellCode, cellNum, l1 = excelData.length,
        l2;
      for (var i = 0; i < l1; i++) {
        cellNum = i + 3;
        l2 = excelData[i].length;
        for (var j = 0; j < l2; j++) {
          value = excelData[i][j];
          cellCode = excelCode[j] + cellNum;
          sheet[cellCode] = {
            v: value,
            t: 's',
            s: {}
          }
          if (i == 0) {
            sheet[cellCode]['s'] = titleS;
          } else if (j == 0) {
            sheet[cellCode]['s'] = bodyS1;
          } else {
            if (value == "--" || (value.toString().indexOf('NaN') > -1)) {
              sheet[cellCode]['s'] = bodyS2;
              sheet[cellCode]['t'] = 's';
              sheet[cellCode]['v'] = value.replace('NaN', '--');
            } else {
              var celldata = formatExcel.fmtCellData(value);
              sheet[cellCode]['s'] = bodyS2;
              sheet[cellCode]['t'] = 'n';
              sheet[cellCode]['v'] = celldata[0];
              sheet[cellCode]['z'] = celldata[1];
            }
          }
        }
      }
      return sheet;
    },

    // 获取度量单位
    getMetric: function (metric) {
      var UnitConst = {
        "元": 1,
        "万元": 10000,
        "亿元": 100000000
      };
      return UnitConst[metric] || metric;
    },

    // 获取表格字母
    getExcelCode: function (lineNum) {
      var excelCode = [];
      if (lineNum <= 26) {
        for (var i = 1; i <= lineNum; i++) {
          excelCode.push(String.fromCharCode(64 + i))
        }
      } else {
        for (var i = 1; i <= 26; i++) {
          excelCode.push(String.fromCharCode(64 + i));
        }
        var sVal = Math.floor(lineNum / 26); // 向下取整
        var mo = lineNum % 26; // 求余
        for (var j = 1; j <= sVal; j++) {
          for (var k = 1; k <= mo; k++) {
            excelCode.push(String.fromCharCode(64 + j) + String.fromCharCode(64 + k));
          }
        }
      }
      return excelCode;
    },

    // 观察者模式
    createObserver: function (id, dataViewCss) {

      dataViewCss = dataViewCss == undefined ? {} : dataViewCss;
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

      // 选择目标节点
      var target = document.querySelector("#" + id);

      // 创建观察者对象
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation, index) {
          if (mutation.removedNodes.length != 0) {
            observer.disconnect();
          } else if (mutation.addedNodes.length > 0) {
            var $div = $(mutation.addedNodes[0]);
            if (mutation.addedNodes[0].children[1].children[0] == undefined) {
              $div.hide();
            }
            $div.css(dataViewCss);
            var $buttomDiv = $(mutation.addedNodes[0].childNodes[2]);
            $buttomDiv.hide();
          }
        })
      });

      // 配置观察选项
      var config = {
        childList: true,
        characterData: false,
        attributes: false,
        subtree: false
      };

      if (target != null) {
        // 传入目标节点和观察选项
        observer.observe(target, config);
      }
    }
  }
  return dataViewTable;
});