//拼接表头
ZTable.prototype.buildHeader = function () {
        var me = this;
        var headers = this.cloneOpts.data.headers;
        var pzPxsxs = this.cloneOpts.data.pzPxsxs;
//		var data = this.sortTableData(headers);
        var data = headers;
        var len = data.length;
        var headHtml = '', htmlLayer = {};
        //标识更多icon
        var moreSign = '<i class="ziconfont yg-gengduo"></i>';
//		1标识升序，2表示降序
        var defaultSort = '<span title="默认" class="sorting_up" data-sortType="1" ><i class="ziconfont yg-adefuben"></i></span>';
        var sortUp = '<span title="升序" class="sorting_up" data-sortType="2" ><i class="ziconfont yg-adefuben"></i></span>';
        var sortDown = '<span title="降序" class="sorting_down" data-sortType="1"><i class="ziconfont yg-adefuben1"></i></span>';

        //sxzType=0;不显示加减号，1为加号，2为减号
        var plusSign = '<i class="ziconfont yg-jia"></i>';
        var minusSign = '<i class="ziconfont yg-jian"></i>';
        me.sxcd = [];
        me.headerMap = {};
        for (var i = 0; i < len; i++) {
            var temp = data[i];
            var tempHtml = '';
            var sxzTemplate = '';
            var moreTemplate = '';//更多模板
            var flexTemplate = '';//伸缩展开层级
            if (temp.sjsxmc != '') {
                if (temp.sxzType == 1) {
                    sxzTemplate = $(plusSign).attr('title', '展开层属性').addClass('sxzSign')[0].outerHTML;
                } else if (temp.sxzType == 2) {
                    sxzTemplate = $(minusSign).attr('title', '合并层属性').addClass('sxzSign')[0].outerHTML;
                }
            }

            if (temp.lccType == 1) {
                flexTemplate = $(plusSign).attr('title', '展开下一层').addClass('flexSign')[0].outerHTML;
            } else if (temp.lccType == 2) {
                flexTemplate = $(minusSign).attr('title', '收起下一层').addClass('flexSign')[0].outerHTML;
            }

            if (temp.hcc != null && temp.maxHcc != null && temp.maxHcc > 1) {
                moreTemplate = moreSign;
            }
            var tempStr = me.encode(temp);
            var headerTxt = temp.header.replace(/</g,'&lt;').replace(/>/g,'&gt;');
            if (!temp.isRowspan) {
                tempHtml = '<th data-head="' + tempStr + '"  rowspan="' + temp.spanNum + '">' + headerTxt + sxzTemplate + moreTemplate + flexTemplate + '</th>'
            } else {
                tempHtml = '<th data-head="' + tempStr + '"  colspan="' + temp.spanNum + '">' + headerTxt + sxzTemplate + moreTemplate + flexTemplate + '</th>'
            }
            if (temp.sxcd !== null) {
                me.sxcd.push(temp.sxcd);
            }
            if (!htmlLayer[temp.rowNum]) {
                htmlLayer[temp.rowNum] = [];
            }
            ;
            htmlLayer[temp.rowNum].push(tempHtml);
        }
        var maxColLayer = Math.max.apply(null, Object.keys(htmlLayer));
        if (me.cloneOpts.tableOpts.isSort) {
            $.each(htmlLayer, function (index, item) {
                if (index == maxColLayer) {
                    var thsArray = item;
                    var ths = [];
                    for (var i = 0; i < thsArray.length; i++) {
                        var $th = $(thsArray[i]);
                        var headItem = me.decode($th.data('head'));
//						pxlx=0默认，1升序，2降序
                        var pxSign = sortUp;
                        var temp = {};
                        if (headItem.pxlx == 0) {
                            pxSign = defaultSort;
                        } else if (headItem.pxlx == 1) {
                            pxSign = sortUp;
                        } else {
                            pxSign = sortDown;
                        }
                        var innerHTML = $th.html() + pxSign;
                        $th[0].innerHTML = innerHTML;
                        var cloneTH = $th[0].outerHTML;
                        ths.push(cloneTH);
                    }
                    htmlLayer[index] = ths;
                }
            });
        }
        $.each(htmlLayer, function (index, item) {
            headHtml += '<tr>' + item + '</tr>';
        })
        return [headHtml, maxColLayer];
    };
	
	
	
	ZTable.prototype.buildCols = function () {
        var data = this.cloneOpts.data.headers;
        var len = data.length, cols = [], headerMap = {};
        this.sxctIsNotNull = [];
//		sxlx 1 文本型,2 日期型,3 数值型
        var classType = {
            1: 'text-left',
            2: 'text-left',
            3: 'text-right'
        };
        for (var i = 0; i < len; i++) {
            if (!data[i].isInData) continue;
            var temp = {};
            if (data[i].field == null) {
                temp['data'] = null;
                temp['target'] = 0;
            } else {
                temp['data'] = data[i].field;
                temp['defaultContent'] = '';
                temp['name'] = data[i].field;
                if (data[i].field != data[i].sourceColName) {
                    temp['name'] = data[i].sourceColName;//绑定name  非常重要
                    this.sxctIsNotNull.push((data[i].dataIndex - 1));
                }


            }
            if (data[i].sxlx !== null) {
                temp['className'] = classType[data[i].sxlx];
            }
           
            headerMap[data[i].field] = data[i];
            cols.push(temp);
        }
        return [cols, headerMap];
    };
	
	
	
	
	me.$table.columns(key + ':name')//获取列信息的 通过name