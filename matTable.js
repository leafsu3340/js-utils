define(["jquery", "baiduTemplate", "css!weblib/plugin/matTable/matTable.css"],function(){
	(function($) {
		'use strict';
		
		var template = '<div class="mat-table">'+
		'<ul class="table-header" style="width: 1319px;left: 0px;"></ul>'+
		'<div class="table-scroll wtb-table-scroll-preview">'+
		'</div>'+
		'</div>';
		
		var tableTemplate = '<table class="tb-detail-table mat-table-normal" border="0" cellpadding="0" cellspacing="0">'+
		'<thead><tr>'+
		'<%for(var i in fields){%>'+
		'<%if(fields[i].selected&&fields[i].colType !== 3){%>'+
		'<th><div class="name"><%=fields[i].colAlias||fields[i].colShowname%></div></th>'+
		'<%}%>'+
		'<%}%>'+
		'</tr></thead>'+
		'<tbody>'+
		'</tbody>'+
		'</table>';
		
		var tableBodyTemplate = '<%for(var j in data){%>'+
		'<tr>'+
		'<%for(var k in fields){%>'+
		'<%if(fields[k].selected&&fields[k].colType !== 3){%>'+
		'<%if(fields[k].dType == 2 && fields[k].format){%>'+
		'<td><%=data[j][fields[k].colPhyName]===""?"":MAT.utils.format(Number(data[j][fields[k].colPhyName]),MAT.utils.parseJSON(fields[k].format))%></td>'+
		'<%}else{%>'+
		'<td><%=data[j][fields[k].colPhyName]%></td>'+
		'<%}%>'+
		'<%}%>'+
		'<%}%>'+
		'</tr>'+
		'<%}%>';
		
		var headerItemTemplate = '<li class="fl table-header-item <%=field.colType==2?"new":""%>" _id="<%=field.uuid%>" dType="<%=field.dType%>" phyName="<%=field.colPhyName%>" fieldName="<%=field.colAlias||field.colShowname%>">'+
		'<div modify-field="field">'+
		'<div class="mat-icon-wrap preview-field-type cursor-pointer">'+
		'<%if(field.dType == 1){%>'+
		'<i dType=1 class="mat-icon fa fa-text cr-mat"></i>'+
		'<%}else if(field.dType == 2){%>'+
		'<i dType=2 class="mat-icon fa fa-number cr-mat"></i>'+
		'<%}else if(field.dType == 3){%>'+
		'<i dType=3 class="mat-icon fa fa-calendar-o cr-mat"></i>'+
		'<%}%>'+
		'<%if(editType){%>'+
		'<i class="mat-icon select-field-type fa fa-angle-down hide"></i>'+
		'<div class="preview-select-type hide">'+
		'<%if(field.dType == 1){%>'+
		'<p class="type-string" dType=1><i class="mat-icon fa fa-text cr-mat"></i>文本</p>'+
		'<%}else if(field.dType == 2){%>'+
		'<p class="type-string" dType=1><i class="mat-icon fa fa-text cr-mat"></i>文本</p>'+
		'<p class="type-number" dType=2><i class="mat-icon fa fa-number cr-mat"></i>数值</p>'+
		'<%}else if(field.dType == 3){%>'+
		'<p class="type-string" dType=1><i class="mat-icon fa fa-text cr-mat"></i>文本</p>'+
		'<p class="type-date" dType=3><i class="mat-icon fa fa-calendar-o cr-mat"></i>日期</p>'+
		'<%}%>'+
		'</div>'+
		'<%}%>'+
		'</div>'+
		'<div class="name dib">'+
		'<div class="edit-wrap tb-field-change-wrap">'+
		'<input type="text" disabled="disabled" validateName="字段名称" validateType="vrequire,vlength20">'+
		'<div class="tb-sort-wrap clearfix">'+
		'<div class="fl line-height-18">'+
		'<div class="tb-sort-name"></div>'+
		'</div>'+
		'<%if(sortAble){%>'+
		'<%if(sort.field == field.colPhyName){%>'+
		'<%if(sort.order == "desc"){%>'+
		'<div class="tb-sort-arrow-active tb-sort-arrow cursor-pointer fl mat-icon ygmat-arrow-down"></div>'+
		'<%}else{%>'+
		'<div class="tb-sort-arrow-active tb-sort-arrow cursor-pointer fl mat-icon ygmat-arrow-up"></div>'+
		'<%}%>'+
		'<%}else{%>'+
		'<div class="tb-sort-arrow cursor-pointer fl mat-icon ygmat-arrow-down <%=field.colType==2?"hide":""%>"></div>'+
		'<%}%>'+
		'<%}%>'+
		'</div>'+
		'</div>'+
		'</div>'+
		'<%if(editAble){%>'+
		'<div class="btn-group <%=field.colType==2?"hide":""%>">'+
		'<a class="mat-icon ygmat-pencil edit-btn" title="编辑"></a>'+
		'<%if(format&&field.dType == 2){%>'+
		'<a class="mat-icon ygmat-eye-view format-btn" title="数值显示格式"></a>'+
		'<%}%>'+
		'<a class="mat-icon fa fa-check confirm-btn hide" title="确定"></a>'+
		'<a class="mat-icon fa fa-times cancel-btn hide" title="取消"></a>'+
		'</div>'+
		'<div class="btn-group <%=field.colType==2?"":"hide"%>">'+
		'<a class="cursor-pointer new-field-more vm">'+
		'<i class="mat-icon fa fa-ellipsis-v vt"></i>'+
		'</a>'+
		'<div class="ico-more-list hide">'+
		'<p class="edit-new-field">编辑</p>'+
		'<p class="del-new-field">删除</p>'+
		'</div>'+
		'</div>'+
		'<%}%>'+
		'</div>'+
		'</li>';
		
		var pluginKey = 'mat.ui.matTable';
		var MatTable = function (element, option) {
			var me = this;
			this.$element = $(element);
			this.initOption(option);
			this.init();
		};
		
		MatTable.prototype.initOption = function(option){
			var me = this;
			this.fields = option.fields||[];
			this.data = option.data||[];
			this.format = option.format||false; //是否显示数值格式，默认为false
			this.perPage = 50;
			this.pageNum = 1;
			this.renderAll = false;
			this.rendering = false;
			this.sortAble = option.hasOwnProperty("sortAble") ? option.sortAble : true; //是否支持排序，默认为true
			this.editAble = option.hasOwnProperty("editAble") ? option.editAble : true; //是否支持排序，默认为true
			this.editType = option.editType || false;
			this.sort = option.sort||{};
			this.editCb = option.editCb||null;
			this.sortCb = option.sortCb||null;
			this.editNewCb = option.editNewCb||null;
			this.delNewCb = option.delNewCb||null;
			this.formatCb = option.formatCb||null;
		};
		
		MatTable.prototype.init = function(){
			var me = this;
			me.render();
			me.bindEvent();
		};
		
		MatTable.prototype.render = function(){
			var me = this;
			me.$element.html(template);
			me.renderHeader();
			me.renderTable();
		};
		
		MatTable.prototype.bindEvent = function(){
			var me = this;
			
			me.$element.on('click','.tb-sort-arrow',function(){
				var $item = $(this).parents('.table-header-item');
				if(!$(this).hasClass('tb-sort-arrow-active')){
					me.$element.find('.tb-sort-arrow').removeClass('tb-sort-arrow-active');
					$(this).addClass('tb-sort-arrow-active');
					me.sortCb&&me.sortCb({field:$item.attr('phyName'),order:'desc'});
				}else{
					if($(this).hasClass('ygmat-arrow-down')){
						$(this).removeClass('ygmat-arrow-down').addClass('ygmat-arrow-up');
						me.sortCb&&me.sortCb({field:$item.attr('phyName'),order:'asc'});
					}else{
						$(this).removeClass('ygmat-arrow-up').addClass('ygmat-arrow-down');
						me.sortCb&&me.sortCb({field:$item.attr('phyName'),order:'desc'});
					}
				}
			});
			
			me.$element.on('click','.edit-btn',function(){
				var $item = $(this).parents('.table-header-item');
				$(this).addClass('hide');
				$(this).next('.format-btn').addClass('hide');
				$item.find('.select-field-type').removeClass('hide');
				$item.find('.name input').attr('disabled',false);
				$item.find('.confirm-btn,.cancel-btn').removeClass('hide');
				$item.find('.tb-sort-wrap').addClass('hide');
				$item.find('>div').addClass('editable');
			});
			
			me.$element.on('click','.confirm-btn',function(){
				var $item = $(this).parents('.table-header-item');
				if(MAT.utils.validate($item)){
					var filedName = $item.find('.name input').val();
					var dType = $item.find('.preview-field-type>i').eq(0).attr('dType');
					var phyname = $item.attr('phyname');
					var fieldId = $item.attr('_id');
					me.editCb&&me.editCb({
						uuid:fieldId,
						colAlias:filedName,
						colPhyName: phyname,
						dType:dType
					});
				}
			});
			
			me.$element.on('click','.cancel-btn',function(){
				var $item = $(this).parents('.table-header-item');
				$item.find('.select-field-type').addClass('hide');
				$item.find('.name input').attr('disabled',true);
				$item.find('.edit-btn').removeClass('hide');
				$item.find('.format-btn').removeClass('hide');
				$item.find('.confirm-btn,.cancel-btn').addClass('hide');
				$item.find('.tb-sort-wrap').removeClass('hide');
				$item.find('>div').removeClass('editable');
				var fieldName = $item.attr('fieldName');
				var dType = $item.attr('dType');
				$item.find('.name input').val(fieldName);
				$item.find('.tb-sort-name').html(fieldName);
				var className = $item.find('.preview-select-type>p[dType='+dType+']>i').attr('class');
				$item.find('.preview-field-type>i').eq(0).attr('class',className).attr('dType',dType);
			});
			
			var mouseSelectFlag = false,mouseIconFlag = false;
			me.$element.on('mouseover','.table-header .editable .preview-field-type',function(){
				mouseIconFlag = true;
				$(this).find('.preview-select-type').removeClass('hide');
			});
			
			me.$element.on('click','.new-field-more',function(){
				$(this).next().removeClass('hide');
			});
			
			me.$element.on('click','.edit-new-field',function(){
				var fieldId = $(this).parents('.table-header-item').attr('_id');
				var field = me.fieldMap[fieldId];
				me.editNewCb&&me.editNewCb(field);
				$(this).parent().addClass('hide');
				
			});
			
			me.$element.on('click','.del-new-field',function(){
				var fieldId = $(this).parents('.table-header-item').attr('_id');
				var field = me.fieldMap[fieldId];
				me.delNewCb&&me.delNewCb(field);
				$(this).parent().addClass('hide');
			});
			
			me.$element.on('click','.format-btn',function(){
				var fieldId = $(this).parents('.table-header-item').attr('_id');
				var field = me.fieldMap[fieldId];
				me.formatCb&&me.formatCb(field);
			});
			
			me.$element.on('mouseout','.table-header .editable .preview-field-type',function(){
				mouseIconFlag = false;
				if(!mouseSelectFlag){
					$(this).find('.preview-select-type').addClass('hide');
				}
			});
			
			me.$element.on('mouseover','.table-header .editable .preview-select-type',function(e){
				mouseSelectFlag = true;
			});
			
			me.$element.on('mouseout','.table-header .editable .preview-select-type',function(e){
				mouseSelectFlag = false;
				if(!mouseIconFlag){
					$(this).addClass('hide');
				}
			});
			
			me.$element.on('click','.table-header .editable .preview-select-type>p',function(e){
				var dType = $(this).attr('dType');
				var className = $(this).find('i').attr('class');
				$(this).parent().prev().prev().attr('class',className).attr('dType',dType);
			});
			
			var scrollTop = me.$element.find('.table-scroll').scrollTop();
			me.$element.find('.table-scroll').scroll(function(){
				me.$element.find('.table-header').css('left',0-$(this).scrollLeft());
				if($(this).scrollTop()!=scrollTop&&!me.renderAll&&!me.rendering){
					scrollTop = $(this).scrollTop();
					if(me.$element.find('.table-scroll').scrollTop()+me.$element.find('.table-scroll').height()+200>me.$element.find('.table-scroll table').height()){
						me.rendering = true;
						me.pageNum++;
						me.renderTableBody();
					}
				}
			});
			
			MAT.event.on('resizeView',function(){
				me.calculateHeader();
			});
		};
		
		MatTable.prototype.renderTable = function(){
			var me = this;
			var fields = me.fields;
			var data = me.data;
			me.$element.find('.table-scroll').append(baidu.template(tableTemplate,{fields:fields,data:data}));
			me.renderTableBody();
		};
		
		MatTable.prototype.renderTableBody = function(){
			var me = this;
			var fields = me.fields;
			var last = me.pageNum*me.perPage;
			if(me.pageNum*me.perPage>me.data.length){
				last = me.data.length;
				me.renderAll = true;
			}
			var data = me.data.slice((me.pageNum-1)*me.perPage,last);
			me.$element.find('.table-scroll table tbody').append(baidu.template(tableBodyTemplate,{fields:fields,data:data}));
			
			me.calculateHeader();
			
			me.rendering = false;
		};
		
		MatTable.prototype.calculateHeader = function(){
			var me = this;
			var length = me.$element.find('.table-header li').length;
			me.$element.find('.table-header li').each(function(i,n){
				// var width = me.$element.find('.table-scroll table th').eq(i).width()+32-(i==length-1?2:(i==0?1:0));
				var width = me.$element.find('.table-scroll table th').eq(i).width()+32-(i==0?1:0);
				$(n).width(width);
			});
			// me.$element.find('.table-header').width(me.$element.find('.table-scroll table').width());
			me.$element.find('.table-header').width(me.$element.find('.table-scroll table').outerWidth());
		};
		
		MatTable.prototype.renderHeader = function(){
			var me = this;
			var fields = me.fields;
			var format = me.format;
			me.fieldMap = {};
			for(var i in fields){
				if(fields[i].selected&&fields[i].colType !== 3){
					var $item = $(baidu.template(headerItemTemplate,{field:fields[i],sort:me.sort, sortAble: me.sortAble, editAble: me.editAble, editType: me.editType,format:me.format}));
					$item.find('.name input').val(fields[i].colAlias||fields[i].colShowname);
					$item.find('.tb-sort-name').html(fields[i].colAlias||fields[i].colShowname);
					me.$element.find('.table-header').append($item);
					me.fieldMap[fields[i].uuid] = fields[i];
				}
			}
		};
		
		MatTable.prototype.loadData = function(option){
			var me = this;
			me.destroy();
			me.initOption(option);
			me.init();
		};
		
		MatTable.prototype.destroy = function(){
			var me = this;
			me.fields = [];
			me.data = [];
			me.sort = {};
			me.pageNum = 1;
			me.renderAll = false;
			me.rendering = false;
			me.$element.off();
			me.$element.html('');
		};
		
		var old = $.fn.matTable;
		
		$.fn.matTable = function () {
			var args = Array.prototype.slice.call(arguments, 0);
			var opts;
			var method, value;
			this.each(function () {
				var $this = $(this);
				var data  = $this.data(pluginKey);
				
				if (args.length === 0 || typeof(args[0]) === "object") {
					opts = args.length === 0 ? {} : $.extend({}, args[0]);
					opts.element = $(this);
					if (!data){
						$this.data(pluginKey, (data = new MatTable(this, opts)));
					}else{
						data.loadData(opts);
					}
				} else if (typeof(args[0]) === "string") {
					if (!data)
						return;
					method = args[0];
					value = data[method].apply(data, args.slice(1));
				} else {
					throw "Invalid arguments to matTable plugin: " + args;
				}
			});
			return (value) ? value : this;
		};
		
		$.fn.matTable.Constructor = MatTable;
		
		$.fn.matTable.noConflict = function () {
			$.fn.matTable = old;
			return this;
		};
	}(jQuery));
});