/**
 *MAT菜单模块
 */
define([], function(){
	var $nav, $menu;
	
	/**
	 * 初始化菜单
	 * @method init
	 */
	function init() {
		$nav = $('.main-nav');
		$menu = $('.main-nav .nav-list');
		showNavView();
		checkHideNav();
		$nav.removeClass('hide');
		resize();
		bindEvent();
		setTimeout(function(){transitionNav();},0);
	}
	
	function showNavView(navView){
		navView = navView||MAT.utils.getItem('navView')||'closet';
		var triggerChange = false;
		var isFloat = isFloatNav();
		if(navView == 'expand'){
			lockNav();
			expandNav();
			triggerChange = true;
		}else if(navView == 'float-closet'){
			floatNav();
			closetNav();
			triggerChange = isFloat?false:true;
		}else if(navView == 'float-expand'){
			floatNav();
			expandNav();
			triggerChange = isFloat?false:true;
		}else{
			lockNav();
			closetNav();
			triggerChange = true;
		}
		MAT.utils.setItem('navView',navView);
		if(triggerChange){
			setTimeout(function(){
				MAT.event.trigger('resizeView');
				$(window).trigger('resize');
			},300);
		}
	}
	
	function transitionNav(){
		$(document.body).addClass('transition-nav-view');
	}
	
	function resize(){
		$menu.css('maxHeight',$nav.height()-$nav.find('.nav-logo').outerHeight()-$nav.find('.nav-splitline').outerHeight()-$nav.find('.nav-info').height()-50);
	}
	
	function render() {
		if(MAT.utils.getItem('menus')&&MAT.utils.getItem('menus') != "undefined"){
			var menus = JSON.parse(MAT.utils.getItem('menus'));
			var rss = MAT.utils.parseJSON(MAT.utils.getItem('resources'));
			var str = "";
			for(var i in menus){
				var url = getUrl(menus[i]);
				
				if ($.isEmptyObject(menus[i].children)) {
					str += appHtml(menus[i], rss, url);
				} else { // 有二级菜单
					var submenus = menus[i].children;
					str += '<li id="'+menus[i].id+'" class="nav-list__item has-sub-menu" title="'+menus[i].name+'" '+(menus[i].language===false?'':('data-language-title="'+menus[i].id+'"'))+'>'+
					'<a module="'+menus[i].id+'" class="module menu-toggle">'+
					'<i class="ygmat-folder-o"></i>' + 
					'<span class="module__name" '+(menus[i].language===false?'':('data-language="'+menus[i].id+'"'))+'>'+menus[i].name+'</span>'+
					'</a><ul class="nav-list__sub-list" style="display:none;"><div class="sub-menu__decoration"></div>';
					for (var j in submenus) {
						url = getUrl(submenus[j]);
						str +=  appHtml(submenus[j], rss, url);
					}
					str += '</ul></li>';
				}
			}
			$menu.html(str);
			MAT.i18n.check();
			setTooltip();
			setActiveApp();
			
			function getUrl(app) {
				var url = app.action && app.action[0];
				if(app.target === 'iframe'){
					url = '/' + app.id;
				} else if (app.dashId) { // dash/story/report作为应用
					url = '/' + app.dashId;
				}
				return url;
			}
			
			function appHtml(app, rss, url) {
				var hasResources = false;
				if (app.resources) {
					for (var i in app.resources) {
						if (rss.indexOf(app.resources[i].res) > -1) {
							hasResources = true;
							break;
						}
					}
				}
				
				return '<li id="'+app.id+'" class="nav-list__item ' + (hasResources ? 'has-resources' : '') + '" url="'+ url +'" target="'+app.target+'">'+
					'<a module="'+app.id+'" class="module" title="'+app.name+'" '+(app.language===false?'':('data-language-title="'+ (app.actiontype === 'in' ? app.id : '') +'"'))+'>'+
					'<i class="'+app.iconCls+'" aria-hidden="true"></i>'+
					'<span class="module__name" '+(app.language===false?'':('data-language="'+(app.actiontype === 'in' ? app.id : '')+'"'))+'>'+app.name+'</span>'+
					'</a>'+
					(hasResources ? resourceHtml(app.resources, rss) : '') +
					'</li>';
			}
			
			function resourceHtml(resources, rss) {
				var str = '<div class="module__resources-wrapper hide"><ul class="module__resources">';
				var count = 0;
				for (var i in resources) {
					if (rss.indexOf(resources[i].res) > -1) {
						var url = resources[i].action && MAT.utils.parseJSON(resources[i].action);
						url = url[0];
						str += '<li class="nav-list__item resource-list__item" url="' + url + '"><a class="nowrap" data-language data-language-title title="' + resources[i].name + '">' + resources[i].name + '</a></li>';
						count++;
					}
				}
				str += '</ul></div>';
				return str;
			}
		}
	}
	function setActiveApp() {
		if (location.hash) {
			var module = location.hash.substring(1);
			var regExp = /(\/[^\/]+)+/, re;
			var safeguard = 0;
			while((re = module.match(regExp)) && safeguard < 10) { // 确保应用子路径选中时，菜单上该应用也active
				var $dom = $menu.find('.nav-list__item[url="' + module + '"]');
				if ($dom.length > 0) {
					$menu.find('.nav-list__item:not(.resource-list__item)').removeClass('active');
					$dom.each(function(idx, item) {
						$(item).addClass('active').parents('.has-sub-menu').find('.menu-toggle').click();
						if ($(item).hasClass('resource-list__item')) {
							$(item).parent().parent().parent().addClass('active');	
						}						
					});
					break;
				}
				module = module.substring(0, module.length - re[1].length);
				safeguard++;
			}
		}
	}

	function setTooltip() {
		$(".nav-list .module").matTooltip({
			show: null,
			hide: null,
			position : {
				at : 'right top',
				using : function(pos, b) {
					pos.left += 10;
					if (!$('body').hasClass('expand-nav-view')) {
						pos.top -= 8;
					}
					$(this).css(pos).addClass('nav-menu-tooltip');
					$('<span class="caret"></span>').appendTo($(this));
				}
			}
		});
	}
	
	function bindEvent(){

		MAT.event.on('personalCenter-open',function(){
			lockFloat();
		});
		
		MAT.event.on('personalCenter-close',function(obj){
			releaseFloat();
			if(obj&&obj.showFloat){
				showFloat();
			}
		});
		
		MAT.event.on('fixed-nav',function(){
			if(isFloatNav()){
				if(isExpandNav()){
					showNavView("expand");
				}else{
					showNavView("closet");
				}
			}
		});
		
		function changePageEvent(){
			var timer = null;
			$(window).resize(function(){
				clearTimeout(timer);
				timer = null;
				timer = setTimeout(function(){
					resize();
					MAT.event.trigger('resizeView');
					$('body>.main-content').perfectScrollbar('update');
					MAT.utils.updateScrollbar();
				},200);
			});
			//home页面全屏 隐藏侧边栏
			$('body').toggleClass('hide-nav-view', location.hash == '#/_home');
		}
		MAT.event.on('changePage', changePageEvent);
		// execute once
		changePageEvent();
		
		$menu.on('click','.nav-list__item a',function(e){
			e.preventDefault();
		});
		
		// 鼠标移开隐藏应用二级页面菜单
		$menu.on('mouseleave', '.nav-list__item.has-resources', function(e){
			$(this).find('> a').matTooltip('enable');
			$(this).find('.module__resources-wrapper').addClass('hide');
		});
		
		$menu.on('click','.resource-list__item', function(e){
			$(this).addClass('active').siblings().removeClass('active');
		});
		
		$menu.on('click','.nav-list__item:not(.has-sub-menu):not(.has-resources)',function(){
			var $item = $(this);
			var url = $item.attr('url');
			var target = $item.attr('target');
			if(target === 'blank'){
				var reg = /^([h][t]{2}[p]:\/\/|[h][t]{2}[p][s]:\/\/)/i,
					str = '';
				if(reg.test(url)){
					str = url;
				}else{
					str += 'https://'+url
				}
				str = MAT.utils.replaceVariables(str);
				// 权限判断
				var resources = MAT.utils.parseJSON(MAT.utils.getItem('resources'));
				if (resources instanceof Array && resources.indexOf($item.attr('id')) > -1) {
					window.open(str);
				} else {
					MAT.utils.appUnauthorized(str);
					return false;
				}
			}else{
				location.hash = '#' + url;
			}
			return false;
		});
		
		// 打开二级菜单事件
		$menu.off('click','.nav-list__item.has-sub-menu > a').on('click','.nav-list__item.has-sub-menu > a',function() {
			var $this = $(this);
			// 添加打开收起效果
			if($this.siblings(".nav-list__sub-list").is(":hidden")){
				if(!$this.siblings(".nav-list__sub-list").is(":animated")) {
					$this.find('i').removeClass('ygmat-folder-o').addClass('ygmat-folder-open-o');
					$this.siblings(".nav-list__sub-list").animate({
						height: 'show'
					}, 500);
				}
			} else { 
				if(!$this.siblings(".nav-list__sub-list").is(":animated")) { 
					$this.find('i').removeClass('ygmat-folder-open-o').addClass('ygmat-folder-o');
					$this.siblings(".nav-list__sub-list").animate({
						height: 'hide'
					}, 500);
				}
			}
		});
		
		// 打开应用二级页面事件
		$menu.off('click','.nav-list__item.has-resources > a').on('click','.nav-list__item.has-resources > a',function() {
			var $this = $(this), $resources = $this.siblings('.module__resources-wrapper');
			$this.matTooltip('disable');
			$resources.css({
				'top': $this.offset().top,
				'left': $menu.width(),
				'maxHeight': $(window).height() - $this.offset().top - 100
			});
			$resources.removeClass('hide');
			if ($resources.find('.resource-list__item.active').size() == 0) {
				$resources.find('.resource-list__item:eq(0)').addClass('active');
			}
			$resources.find('.resource-list__item.active').trigger('click');
		});
		
		$nav.find('.nav-shadow').mouseenter(function(){
			showFloat();
		});
		
		$nav.find('.nav-shadow').mouseleave(function(){
			return false;
		});
		
		$nav.mouseleave(function(){
			clearTimeout(timer);
			timer = null;
			if(isFloatNav()){
				timer = setTimeout(function(){
					hideFloat();
				},200);
			}
		});
		
		//菜单栏展开事件
		$nav.find('.nav-splitline .expand').click(function(){
			if(isFloatNav()){
				showNavView("float-expand");
			}else{
				showNavView("expand");
			}
		});
		
		//菜单栏收拢事件
		$nav.find('.nav-splitline .closet').click(function(){
			if(isFloatNav()){
				showNavView("float-closet");
			}else{
				showNavView("closet");
			}
		});
		
		//菜单栏浮动事件
		$nav.find('.nav-splitline .float').click(function(){
			if(isExpandNav()){
				showNavView("float-expand");
			}else{
				showNavView("float-closet");
			}
		});
		
		//菜单栏锁定事件
		$nav.find('.nav-splitline .lock').click(function(){
			if(isExpandNav()){
				showNavView("expand");
			}else{
				showNavView("closet");
			}
		});
	}
	
	function expandNav(){
		$nav.find('.nav-splitline .expand').addClass('hide').siblings().removeClass('hide');
		$(document.body).addClass('expand-nav-view');
	}
	
	function closetNav(){
		$nav.find('.nav-splitline .closet').addClass('hide').siblings().removeClass('hide');
		$(document.body).removeClass('expand-nav-view');
	}
	
	function isExpandNav(){
		return $nav.find('.expand').hasClass('hide');
	}
	
	function floatNav(){
		$nav.find('.nav-float-control .float').addClass('hide').siblings().removeClass('hide');
		$(document.body).addClass('float-nav-view');
	}
	
	function lockNav(){
		$nav.find('.nav-float-control .lock').addClass('hide').siblings().removeClass('hide');
		$(document.body).removeClass('float-nav-view');
	}
	
	function isFloatNav(){
		return $(document.body).hasClass('float-nav-view');
	}
	
	function showFloat(){
		$(document.body).addClass('float-nav-show');
		$nav.find('.nav-shadow').addClass('hide');
	}
	
	var timer;
	function hideFloat(){
		$(document.body).removeClass('float-nav-show');
		if(!$(document.body).hasClass('float-nav-lock')){
			$nav.find('.nav-shadow').removeClass('hide');
		}
	}
	
	function lockFloat(){
		if(isFloatNav()){
			$(document.body).addClass('float-nav-lock');
			$(this).addClass('hide');
		}
	}
	
	function releaseFloat(){
		if(isFloatNav()){
			$(document.body).removeClass('float-nav-lock');
			$nav.find('.nav-shadow').removeClass('hide');
		}
	}
	//是否隐藏导航栏 (如全屏的页面隐藏)
	function checkHideNav(){
		if ((!location.hash && MAT.utils.getItem('mode') == 'performance') || location.hash == '#/_home') {
			$(document.body).addClass('hide-nav-view');
		}
	}

	return {
		init:init,
		render:render
	}
});