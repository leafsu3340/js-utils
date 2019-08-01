/**
 * MAT工具模块,提供工具方法
 * @module MAT.utils
 */
define(['md5', 'aes', 'scrollbar', './behaviour.js'],function(DOMPurify){
	(function(scope){
		scope.MAT = scope.MAT||{};
		scope.MAT.utils = {
				/**
				 * 从localStorage中读取属性值,如果无法找到loginContent属性则触发登出功能
				 * @method getItem
				 * @params {string} key 属性名
				 * @params {string} parse 格式化
				 * @return {string} 对应的属性值
				 */
				getItem:function(key, parse){
					var value = localStorage.getItem(key);
				    if (value !== null && parse){
				        return JSON.parse(value);
				    }
				    return value;
				},
				
				/**
				 * localStorage中设置属性值
				 * @method setItem
				 * @params {string} key 属性名
				 * @params {string} value 值
				 */
				setItem:function(key,value){
					if (value !== null && value !== undefined){
				        if (typeof value === 'object'){
				            localStorage.setItem(key, JSON.stringify(value));
				        } else {
				            localStorage.setItem(key, value);
				        }
				    } else {
				        this.removeItem(key);
				    }
				},
				
				/**
				 * localStorage中设置属性值
				 * @method removeItem
				 * @params {string} name 属性名
				 */
				removeItem:function(name){
					localStorage.removeItem(name);
				},
				
				/**
				 * 开启loading效果
				 * @method block
				 * @params {object} option 参数集合
				 * @params {$} option.$container loading的容器,如果不设置,默认容器为body
				 * @params {Number} option.opacity loading遮罩层的透明度
				 */
				block:function(option){
					option = option||{};
					var $container = option.$container||$(document.body);
					$container.block({
						message: "<div class='loader-inner ball-spin-fade-loader'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>",
						baseZ: 2000,
						css: { border: '0', padding: '0', backgroundColor: 'transparent', width: '70px', height: '70px'},
						overlayCSS: { backgroundColor: 'transparent', opacity: option.opacity||0.2}
					});
				},
				
				/**
				 * 开启loading效果(logo等待效果)
				 * @method blockYGI
				 * @params {object} option 参数集合
				 * @params {$} option.$container loading的容器,如果不设置,默认容器为body
				 * @params {Number} option.opacity loading遮罩层的透明度
				 */
				blockYGI:function(option){
					option = option||{};
					var $container = option.$container||$(document.body);
					$container.block({
						message: "<div class='loader-inner ball-spin-fade-loader'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>",
						baseZ: 2000,
						css: { border: '0', padding: '0', backgroundColor: 'transparent', width: '70px', height: '70px'},
						overlayCSS: { backgroundColor: 'transparent', opacity: option.opacity||0.2}
					});
				},
				
				/**
				 * 关闭loading效果
				 * @method block
				 * @params {object} option 参数集合
				 * @params {$} option.$container loading的容器,如果不设置,默认容器为body
				 */
				unblock:function(option){
					option = option||{};
					var $container = option.$container||$(document.body);
					$container.unblock();
				},
				
				/**
				 * 登录页
				 * @method loginPage
				 */
				loginPage:function(){
					location.href = MAT.utils.getItem('loginPageUrl') || 'login.html';
				},
				
				/**
				 * 登出
				 * @method logout
				 */
				logout:function(){
					MAT.behaviour.add({
						module: "平台",
						page: "登出",
						action: "logout",
						pageurl: location.href
					}, 'immediate');
					this._ajax('/api/v1/logout',{},function(){
						//加载登出扩展点
		    				MAT.module.extend('platform','/logout',null,null);
		    				
						MAT.utils.setItem('resources',null);
						MAT.utils.setItem('loginContent',null);
						MAT.utils.setToken(null,null);
						MAT.utils.setTokenExpire(null);
						MAT.utils.removeItem('chart_edit_obj');
						MAT.utils.loginPage();
					},function(){},{
						method: 'POST'
					});
				},
				
				/**
				 * 心跳
				 * @method heart
				 * @param {function} cb 成功回调
				 */
				heart:function(cb){
					MAT.utils.postUrl('/rest/user/heart',{},function(){
						cb&&cb();
					});
				},
				
				/**
				 * 应用未授权或已过期
				 * @method appUnlicensed
				 */
				appUnlicensed:function(){
					MAT.utils.notific('应用未授权或已过期','warn');
				},
				
				/**
				 * 应用无权访问或下架
				 * @method appUnauthorized
				 */
				appUnauthorized:function(){
					MAT.utils.notific('您无权限访问该路径或该应用已下架','warn');
				},
				
				/**
				 * 向url链接中的添加当前系统变量。支持的变量有：
				 * matAccessToken: 当前的token
				 * matTokenType: 当前token的类型
				 * @method replaceVariables
				 * @param {string} url 链接地址 
				 */
				replaceVariables: function(url) {
					var re = /([^\?#]+)(\?[^#]*)?(#.*)?/;
					var match = url.match(re);
					if (!match) { // error matching
						return url;
					}

					var toInsert = 'matAccessToken=' + MAT.utils.getItem('access_token');
					toInsert += '&matTokenType=' + MAT.utils.getItem('token_type');
					if (!match[2] || match[2] == '?') { // no search or only a search sign
						return url.replace(re, '$1?' + toInsert + '$3');
					} else { // has search
						return url.replace(re, '$1$2&' + toInsert + '$3');
					}
				},
				
				/**
				 * 是否已显示超时窗口
				 */
				showTimeout: false,
				
				/**
				 * 是否已显示修改密码窗口
				 */
				showEditPassword: false,
				
				/**
				 * 修改密码
				 * @method editPassword
				 */
				editPassword:function(loginname,cb,disableCancel){
					var option = {
						title: '修改密码',
						width: 350,
						init: function($modal){
							var str = '<div class="form-group mt10">'+
										'<input type="password" id="fakePassword" style="display:none;" />'+
								        '<div class="mb10">'+
								            '<label class="form-label mr10 nowrap">原密码</label>'+
								            '<input class="password form-field" type="text" onfocus="this.type=\'password\'" validateName="原密码" validateType="vrequire">'+
								        '</div>'+
								        '<div class="mb10">'+
								            '<label class="form-label mr10 nowrap">新密码</label>'+
								            '<input title="密码必须是8-20位同时包含了数字,小写字母,大写字母和特殊字符(.-_!@#$%^&*)四种类型中的至少三种" class="newPassword form-field" type="text" onfocus="this.type=\'password\'" validateName="新密码" validateType="vrequire,vlength8-20,vpassword">'+
								        '</div>'+
								        '<div class="mb10">'+
								            '<label class="form-label mr10 nowrap">再次输入</label>'+
								            '<input class="againPassword form-field" type="text" onfocus="this.type=\'password\'" validateName="再次输入" validateType="vrequire,vlength8-20,vpassword">'+
								        '</div>'+
								      '</div>';
							$modal.find('.modal-body').html(str);
							$modal.find('input.newPassword').matTooltip({});
						},
						buttons: [
					    	{
					    		name:'确定',
					    		active:true,
					    		click:function($btn,$modal,dialog){
					    			if(MAT.utils.validate($modal)){
					    				var password = $modal.find('.password').val();
					    				var newPassword = $modal.find('.newPassword').val();
					    				var againPassword = $modal.find('.againPassword').val();
					    				if(newPassword!=againPassword){
					    					MAT.utils.notific('两次输入的新密码不同,请重新输入','warn');
					    					return false;
					    				}
					    				if(newPassword==password){
					    					MAT.utils.notific('新密码不可与旧密码相同,请重新输入','warn');
					    					return false;
					    				}
					    				var loginContent = MAT.utils.parseJSON(MAT.utils.getItem('loginContent'));
					    				loginname = loginname || (loginContent?loginContent.loginname:'');
					    				if(newPassword.indexOf(loginContent.loginname) > -1){
					    					MAT.utils.notific('新密码不可包含用户名,请重新输入','warn');
					    					return false;
					    				}
					    				MAT.utils.postUrl('/rest/user/update/password',{originMd5: AES.doEncrypt(password, AES.ENCRY_KEY, AES.ENCRY_IV),newMd5:AES.doEncrypt(newPassword, AES.ENCRY_KEY, AES.ENCRY_IV)},function(res){
//					    					if(res.status){
					    						MAT.utils.notific('密码修改成功');
					    						dialog.hide();
					    						cb&&cb();
//					    					}
					    				});
					    			}
					    		}
					    	},
					    	{
					    		name:'取消',
					    		type:'close'
					    	}
				        ]
					};
					if(disableCancel){
						option.hideClose = true;
						option.buttons.pop();
					}
					$.dialog(option);
				},
				
				/**
				 * 提示窗口
				 * @method notific
				 * @params {string} message 提示的内容
				 * @params {string} option option为string时,代表提示类型:info 通知, warn 警告, error 错误, 默认为info
				 * @params {object} option option为object是,代表参数集合
				 */
				notific:function(message,option){
					if(option){
						if(typeof option == 'string'){
							if(option == 'warn'){
								$.notific8(message,{life:2000,theme:'warn',beforeShow:function($dom){MAT.i18n.check($dom);}});
							}else if(option == 'error'){
								$.notific8(message,{life:2000,theme:'error',beforeShow:function($dom){MAT.i18n.check($dom);}});
							}else{
								$.notific8(message,{life:2000,beforeShow:function($dom){MAT.i18n.check($dom);}});
							}
						}else if(typeof option == 'object'){
							option.beforeShow = function($dom){MAT.i18n.check($dom);};
							$.notific8(message,option);
						}
					}else{
						$.notific8(message,{life:2000,beforeShow:function($dom){MAT.i18n.check($dom);}});
					}
				},
				
				/**
				 * 表单验证 并提示错误信息
				 * @method validate
				 * @params {$} $dom 需要进行验证的容器
				 * @return {Boolean} true 成功, false 失败
				 */
				validate:function($dom){
					if($dom.length){
						var msg = "";
						$dom.each(function(i,n){
							if((n.tagName == 'INPUT'&& $(n).attr('validateType'))||(n.tagName == 'TEXTAREA'&&$(n).attr('validateType'))||(n.tagName == 'SELECT'&&$(n).attr('validateType'))){
								msg = MAT.utils.validateElement(n);
							}else{
								$(n).find('input[validateType],select[validateType],textarea[validateType]').each(function(j,m){
									msg = MAT.utils.validateElement(m);
									if(msg){
										return false;
									}
								});
							}
							if(msg){
								return false;
							}
						});
						if(msg){
							MAT.utils.notific(msg,'warn');
							return false;
						}else{
							return true;
						}
					}
					return true;
				},
				
				/**
				 * 验证一个表单元素
				 * @method validateElement
				 * @params {dom} element 需要进行验证的容器
				 * @return {string} 为""时代表验证通过,若不为空则返回的是错误信息
				 * @exp 需要进行验证的表单元素配置 <input class="form-field name" type="text" validateName="仪表板名称" validateType="vrequire,vlength20">
				 */
				validateElement:function(element){
					var validateType = $(element).attr('validateType');
					var validateArr = validateType.split(',');
					var msg = '';
					for(var i in validateArr){
						var type = validateArr[i];
						if(type.indexOf('vlength') == 0){
							msg = MAT.utils.validateType.vlength(element,type.substring(7));
						}else if(type.indexOf('vvalue') == 0){
							msg = MAT.utils.validateType.vvalue(element,type.substring(6));
						}else{
							if(MAT.utils.validateType[validateArr[i]]){
								msg = MAT.utils.validateType[validateArr[i]](element);
							}
						}
						if(msg){
							break;
						}
					}
					return msg;
				},
				
				//针对不同类型进行验证
				validateType:{
					//必填
					vrequire:function(element){
						if(!$.trim($(element).val())){
							return MAT.utils.validateMsg(element,'不能为空','请输入');
						}
						return "";
					},
					//长度验证
					vlength:function(element,rangeStr){
						var range = rangeStr.split('-');
						var val = $(element).val();
						if(range.length == 2){
							if((range[0]&&val.length<range[0])||(range[1]&&val.length>range[1])){
								return MAT.utils.validateMsg(element,'文本长度需满足' + (range[0]||0) + '-' + (range[1]||'∞') + '个字符');
							}
						}else if(range.length == 1){
							if(val.length > range[0]){
								return MAT.utils.validateMsg(element,'文本长度不能大于' + (range[0]||0) + '个字符');
							}
						}else{
							return MAT.utils.validateMsg(element,'文本长度验证格式错误');
						}
						return "";
					},
					vnumber:function(element){
						var val = $(element).val();
						if(isNaN(val)){
							return MAT.utils.validateMsg(element,'文本必须为数字');
						}
						return "";
					},
					vint:function(element){
						var val = $(element).val();
						var re = /^\-?[1-9][0-9]*$/;
						if(isNaN(val)||!re.test(val)){
							return MAT.utils.validateMsg(element,'文本必须为整数');
						}
						return "";
					},
					vvalue:function(element,rangeStr){
						var re=/^[\(\[]\-?\d*\~\-?\d*[\)\]]$/;
						if(!re.test(rangeStr)){
							return MAT.utils.validateMsg(element,'文本值的范围验证格式错误');
						}
						var val = $(element).val();
						if(isNaN(val)){
							return MAT.utils.validateMsg(element,'文本必须为数字');
						}
						val = Number(val);
						var startType = rangeStr.substring(0,1);
						var endType = rangeStr.substr(-1);
						var range = rangeStr.substring(1,rangeStr.length-1);
						var rangeArr = range.split('~');
						var start = rangeArr[0], end = rangeArr[1];
						if((start === ""||isNaN(start))&&(end === ""||isNaN(end))){
							return MAT.utils.validateMsg(element,'文本值的范围验证格式错误');
						}
						var startFlag = true, endFlag = true;
						if(start !== ""){
							startFlag = startType ==='('?val>Number(start):val>=Number(start);
						}
						if(end !== ""){
							endFlag = endType ===')'?val<Number(end):val<=Number(end);
						}
						if(!(startFlag&&endFlag)){
							return MAT.utils.validateMsg(element,'文本值的范围必须在'+startType+start+','+end+endType);
						}
						return "";
					},
					//用户名验证
					vusername:function(element){
						var val = $(element).val();
						var re = /^[a-zA-Z]{1}([a-zA-Z0-9]|[\.\_\-@]){2,}$/;
						var adRe = /^ad\-/;
						if(!re.test(val)||adRe.test(val)){
							return MAT.utils.validateMsg(element,'格式错误');
						}
						return "";
					},
					//密码验证
					vpassword:function(element){
						var rC = {  
					        lW:/[a-z]/,  
					        uW:/[A-Z]/,  
					        nW:/[0-9]/,  
					        sW:/[\.\-\_~!@#$%^&*]/ 
					    };
						var val = $(element).val();
						var typeCount = 0;
						for(var i in rC){
					        if(rC[i].test(val)){
					        		typeCount++;
					        }
						}
						if(typeCount<3){
							return MAT.utils.validateMsg(element,'格式错误');
						}
						return "";
					},
					//空格验证
					vblank:function(element){
						var val = $(element).val();
						if(val){
							if(/\s/.test(val)){
								return MAT.utils.validateMsg(element,'文本中不能含有空格');
							}
						}
						return "";
					},
					//邮箱验证
					vmail:function(element){
						var val = $(element).val();
						if(val){
							var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
							if(!re.test(val)){
								return MAT.utils.validateMsg(element,'格式错误');
							}
						}
						return "";
					},
					//手机号验证
					vmobile:function(element){
						var val = $(element).val();
						if(val){
							var re = /^1\d{10}$/;
							if(!re.test(val)){
								return MAT.utils.validateMsg(element,'格式错误');
							}
						}
						return "";
					},
					//座机号验证
					vtel:function(element){
						var val = $(element).val();
						if(val){
							var re = /^0\d{2,3}-?\d{7,8}-?\d{0,4}$/;
							if(!re.test(val)){
								return MAT.utils.validateMsg(element,'格式错误');
							}
						}
						return "";
					}
				},
				
				/**
				 * 组装验证提示消息
				 * @method validateMsg
				 */
				validateMsg:function(element,msg,lmsg){
					if($(element).attr('validateMsg')){
						return $(element).attr('validateMsg');
					}else{
						if(lmsg){
							return lmsg + ($(element).attr('validateName')||'输入框');
						}else{
							return ($(element).attr('validateName')||'输入框') + msg;
						}
					}
				},
				
				/**
				 * 生成32位唯一数uuid
				 * @method uuid
				 */
				uuid:function(){
					var s = [];
					var hexDigits = "0123456789abcdef";
					for (var i = 0; i < 36; i++) {
						s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
					}
					s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
					s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
					s[8] = s[13] = s[18] = s[23] = "-";
					
					var uuid = s.join("");
					return uuid;
				},
				
				/**
				 * 字符串转json,只有当参数不为空且是string类型时才进行转换
				 * @method parseJSON
				 * @params {string} value
				 * @return {object} 转换后的JSON
				 */
				parseJSON: function(value){
					if(value&&typeof value == 'string'){
						return JSON.parse(value);
					}
					return value;
				},
				
				/**
				 * json转字符串,只有当参数不为空且非string类型时才进行转换
				 * @method stringify
				 * @params {object} value
				 * @return {string} 转换后的string
				 */
				stringify: function(value){
					if(value&&typeof value != 'string'){
						return JSON.stringify(value);
					}
					return value;
				},
				
				/**
				 * 反转义html标签
				 * @method escape2html
				 * @params {string} str
				 * @return {string} 
				 */
				escape2html: function(str){ 
					var s = "";
					if(!str || str.length == 0) return "";
					s = str.replace(/&amp;/g,"&");
					s = s.replace(/&lt;/g,"<");
					s = s.replace(/&gt;/g,">");
					s = s.replace(/&nbsp;/g," ");
					s = s.replace(/&#39;/g,"\'");
					s = s.replace(/&quot;/g,"\"");
					return s;   
				},
				
				/**
				 * 转义html标签
				 * @method html2escape
				 * @params {string} str
				 * @return {string} 
				 */
				html2escape: function(str){ 
					if(typeof str != 'string'){
						return str;
					}
					var s = "";
					if(!str || str.length == 0) return "";
					s = str.replace(/&/g,"&amp;");
					s = s.replace(/</g,"&lt;");
					s = s.replace(/>/g,"&gt;");
					s = s.replace(/ /g,"&nbsp;");
					s = s.replace(/\'/g,"&#39;");
					s = s.replace(/\"/g,"&quot;");
					return s;  
				},
				
				//加密关键字
				md5Variable: 'matbigsixshot2017',
				
				/**
				 * 提示会话超时
				 * @method timeout
				 */
				timeout: function(){
					if(!MAT.utils.showTimeout){
						MAT.utils.showTimeout = true;
						MAT.utils.notific('会话超时', "warn");
						MAT.utils.setItem('token_type',null);
						MAT.utils.setItem('access_token',null);
						setTimeout(function(){
							MAT.utils.showTimeout = false;
							MAT.utils.loginPage();
						},2000);
					}
				},
				
				//刷新token状态
				refreshTokenExpire: false,
				
				/**
				 * 检查token是否需要刷新
				 * @method checkTokenExpire
				 */
				checkTokenExpire: function(){
					var me = this;
					if(!me.refreshTokenExpire){
						var expireTimestamp = me.getTokenExpire();
						if(expireTimestamp){
							var lastRequestTimestamp = me.getItem('login_last_request_timestamp');
							var nowTimestamp = new Date().getTime();
							var disExpireTimestamp = expireTimestamp - nowTimestamp;
							var disRequestTimestamp = nowTimestamp - lastRequestTimestamp;
							if(disExpireTimestamp > 0 && disRequestTimestamp > 60*1000){
								me.refreshTokenExpire = true;
								me._ajax('/api/v1/login/refresh',{},function(res){
									me.setTokenExpire(res.expires_in);
									for(var i in me.ajaxQueue){
										me.ajaxQueue[i]();
									}
									me.ajaxQueue = [];
									me.refreshTokenExpire = false;
								},function(){},{
									type: 'json',
									method: 'POST'
								});
								return true;
							}
						}
						return false;
					}
					return true;
				},
				
				//刷新token时队列
				ajaxQueue: [],
				
				/**
				 * Object对象排序
				 * @method objectSort
				 * @params {object} obj 对象
				 * @params {string} toString 是否转成string
				 */
				objectSort: function(obj,toString){
					var keys = [];
					for(var i in obj){
						if(obj[i] !== undefined&&obj[i] !== null){
							keys.push(i);
						}
					}
					keys = keys.sort();
					var newObj = {};
					for(var j in keys){
						if(toString && typeof obj[keys[j]] != 'object'){
							newObj[keys[j]] = obj[keys[j]].toString();
						}else{
							newObj[keys[j]] = obj[keys[j]];
						}
					}
					return newObj;
				},
				
				/**
				 * ajax请求控制
				 * @method ajax
				 * @params {string} url 请求地址
				 * @params {object} data 数据对象
				 * @params {function} successFn 成功回调
				 * @params {function} errorFn 失败回调
				 * @params {object} config 配置
				 */
				ajax: function(url,data,successFn,errorFn,config){
					var me = this;
					if(this.refreshTokenExpire||this.checkTokenExpire()){
						this.ajaxQueue.push(function(){
							me._ajax(url,data,successFn,errorFn,config);
						});
					}else{
						me._ajax(url,data,successFn,errorFn,config);
					}
				},
				
				/**
				 * ajax请求
				 * @method _ajax
				 * @params {string} url 请求地址
				 * @params {object} data 数据对象
				 * @params {function} successFn 成功回调
				 * @params {function} errorFn 失败回调
				 * @params {object} config 配置
				 */
				_ajax: function(url,data,successFn,errorFn,config){
					url = MAT.utils.getContextPath() + url;
					config = config||{};
					config.method = config.method||'POST';
					var nonce = this.uuid();
					var timestamp = this.getSystemTimestamp();
					if(config.method == 'POST' && config.type != 'json'){
						data = this.objectSort(data, true);
					}
					var options = {
							data : config.type == 'json'&&config.method!='GET'?JSON.stringify(data):data,
							method: config.method||'POST',
							headers: {
								Authorization: MAT.utils.getToken(),
								"ca-nonce": nonce,
								"ca-timestamp": timestamp,
								"ca-sigh": $.md5(timestamp + this.md5Variable + nonce),
								"ca-abstract":  $.md5(JSON.stringify(data))
							},
							success: function(result){
								if(typeof result === 'string'){
									try{
										result = JSON.parse(result);
									}catch(e){
										console.warn('Ajax Response Parse Json Error!');
									}
								}
								if(result.status === false){
									MAT.utils.notific(result.message, "warn");
									errorFn&&errorFn(result);
								}else{
									successFn&&successFn(result._RESPONSE_STANDARD?result.data:result,result);
								}
							},
							error: function(event){
								if(event.status == 401){
									MAT.utils.timeout();
								}else{
									if(event.responseJSON&&event.responseJSON.message){
										if(event.responseJSON.code === 1000){
											if(!MAT.utils.showEditPassword){
												MAT.utils.showEditPassword = true;
												MAT.utils.notific(event.responseJSON.message, "warn");
												MAT.utils.editPassword('',function(){
													location.reload();
												},true);
											}
										}else{
											var errMsg = event.responseJSON.message;
											MAT.utils.notific(MAT.utils.getErrorMessage(errMsg), "error");
										}
									}
								}
								errorFn&&errorFn(event);
							}
					};
					if(config.method === 'GET'){
						options.async = true;
						options.cache = true;
					}else{
						options.contentType = config.type == 'json'?"application/json":"application/x-www-form-urlencoded";
					}
					if(config.sync){
						options.async = false;
					}
					return $.ajax(url, options).then(function(result){
						if(typeof result === 'string'){
							try{
								result = JSON.parse(result);
							}catch(e){
								console.warn('Ajax Response Parse Json Error!');
							}
						}
						if(result.status === false){
							return $.Deferred().reject(result);
						}else{
							return result._RESPONSE_STANDARD?result.data:result;
						}
					});
				},
				
				/**
				 * 获取错误信息
				 * @method getErrorMessage
				 * @params {string} message 消息
				 * @return {string} 消息主体
				 */
				getErrorMessage: function(message) {
					var errMsg = message;
					// 尝试提取后台返回的错误消息
					var re = errMsg.match(/.*\n(.*)/);
					if (re && re[1]) {
						try {
							var errJSON = MAT.utils.parseJSON(re[1]);
							errMsg = errJSON.message || errMsg;
						} catch (err) {
							console.warn(err);
						}
					}
					return errMsg;
				},
				
				/**
				 * get请求
				 * @method getUrl
				 * @params {string} url 请求地址
				 * @params {object} data 数据对象
				 * @params {function} successFn 成功回调
				 * @params {function} errorFn 失败回调
				 */
				getUrl: function(url,data,successFn,errorFn){
					return this.ajax(url,data,successFn,errorFn,{
						method: 'GET'
					});
				},
				
				/**
				 * post请求
				 * @method getUrl
				 * @params {string} url 请求地址
				 * @params {object} data 数据对象
				 * @params {function} successFn 成功回调
				 * @params {function} errorFn 失败回调
				 */
				postUrl: function(url,data,successFn,errorFn){
					return this.ajax(url,data,successFn,errorFn,{
						method: 'POST'
					});
				},
				
				/**
				 * post请求,content-type:json
				 * @method getUrl
				 * @params {string} url 请求地址
				 * @params {object} data 数据对象
				 * @params {function} successFn 成功回调
				 * @params {function} errorFn 失败回调
				 */
				postJson: function(url,data,successFn,errorFn){
					 return this.ajax(url,data,successFn,errorFn,{
						type: 'json',
						method: 'POST'
					});
				},

				/**
				 * 异步方式下载文件 （因为有模拟鼠标点击 IE下无效）
				 * @method downloadFile
				 * @params {string} url 请求地址
				 * @params {object} option （可选）选项
				 * @params {function} cb （可选）回调
				 * @params {function} errcb （可选）错误回调
				 */
				downloadFile: function(url, option, cb, errcb) {
					url = MAT.utils.getContextPath() + url;
					option = option||{};
					function downloadFile(fileName, content, blobOptions) {
						blobOptions = blobOptions || {};
						
						var blob = new Blob([content], blobOptions);
						var a = document.createElement('a');
						a.innerHTML = fileName;
						
						// 指定生成的文件名
						a.download = fileName;
						a.href = URL.createObjectURL(blob);
						
						document.body.appendChild(a);
						
						var evt = document.createEvent("MouseEvents");
						evt.initEvent("click", false, false);
						
						a.dispatchEvent(evt);
						document.body.removeChild(a);
					}
					
					var xhr = new XMLHttpRequest();    
					xhr.open(option.method||"get", url, true);
					xhr.responseType = "blob";
					xhr.setRequestHeader("Authorization", MAT.utils.getToken());
					if(option.type == 'json'){
						xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
						if(option.params){
							option.params = JSON.stringify(option.params);
						}
					}else{
						xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					}
					xhr.onload = function() {
						if (this.status == 200) {
							var blob = this.response;
							var a = this.getResponseHeader('Content-Disposition');
							a = a.substring(20);
							try {
								a = decodeURI(a);
							} catch (err) {
							}
							if (option.name) {
								a = option.name;
							}
							downloadFile(a, blob);
							cb&&cb();
						} else {
							errcb&&errcb();
						}
					}; 
					if(option.params){
						if(typeof option.params  == 'object'){
							xhr.send(this.serializeJson(option.params));
						}else{
							xhr.send(option.params);
						}
					}else{
						xhr.send();
					}
				},
				
				/**
				 * 序列号json对象
				 * @method serializeJson
				 * @params {Object} json 
				 * @return {string}
				 */
				serializeJson: function(json){
					var strArr = [];
					for(var i in json){
						var name = i;
						var value = json[i];
						if(typeof value == 'object'){
							value = JSON.stringify(value);
						}
						var str = name + '=' + value;
						strArr.push(str);
					}
					return strArr.join('&');
				},
			    
				/**
				 * 获取token
				 * @method getToken
				 * @params {boolean} accessTokenOnly 只取access_token
				 * @return {Number}
				 */
				getToken: function (accessTokenOnly) {
					var access_token = MAT.utils.getItem('access_token');
					var token_type = MAT.utils.getItem('token_type');
					if (accessTokenOnly) {
						return access_token;
					}
					return token_type + " " + access_token;
				},
				
				/**
				 * 设置token
				 * @method setToken
				 * @params {string} access_token tokenId
				 * @params {string} token_type token类型
				 */
				setToken: function (access_token, token_type) {
					MAT.utils.setItem('access_token', access_token);
					MAT.utils.setItem('token_type', token_type||'bearer');
				},
				
				/**
				 * 获取token失效时间
				 * @method getTokenExpire
				 * @return {Number}
				 */
				getTokenExpire: function () {
					var me = this;
					var loginTimestamp = me.getItem('login_last_request_timestamp');
					var expires_in = me.getItem('login_expires_in');
					if(loginTimestamp && loginTimestamp){
						return Number(loginTimestamp) + Number(expires_in*1000);
					}
					return null;
				},
				
				/**
				 * 设置token失效时间
				 * @method setTokenExpire
				 * @params {Number} expires_in 实现时间(秒)
				 */
				setTokenExpire: function (expires_in) {
					var me = this;
					if(expires_in === null){
						me.removeItem('login_last_request_timestamp');
						me.removeItem('login_expires_in');
					}else{
						me.setItem('login_last_request_timestamp', new Date().getTime());
						if(expires_in){
							me.setItem('login_expires_in', expires_in);
						}
					}
				},

				/**
				 * 获得web上下文路径
				 * @method getContextPath
				 * @return {string}
				 */
				getContextPath: function() {
					return MAT.utils.getItem('matCloudContextPath') || '';
				},
				
				/**
				 * 获取服务器时间戳
				 * @method getSystemTimestamp
				 * @return {Number}
				 */
				getSystemTimestamp: function () {
					var timestampDiff = this.getItem('timestampDiff');
					return new Date().getTime() - (timestampDiff&&!isNaN(timestampDiff) ? Number(timestampDiff) : 0);
				},
				
				/**
				 * 增加千分位
				 * @method addKannma
				 * @param {Number} number 数值
				 * @param {Number} deg 保留小数点位数,默认2位
				 * @return {string}
				 */
				addKannma: function (number,deg) {
					deg = (deg||deg===0)?deg:2;
					var num = number + "";
					num = num.replace(new RegExp(",", "g"), "");
					// 正负号处理
					var symble = "";
					if (/^([-+]).*$/.test(num)) {
						symble = num.replace(/^([-+]).*$/, "$1");
						num = num.replace(/^([-+])(.*)$/, "$2");
					}
					
					if (/^[0-9]+(\.[0-9]+)?$/.test(num)) {
						var num = num.replace(new RegExp("^[0]+", "g"), "");
						if (/^\./.test(num)) {
							num = "0" + num;
						}
						
						var decimal = num.replace(/^[0-9]+(\.[0-9]+)?$/, "$1");
						var integer = num.replace(/^([0-9]+)(\.[0-9]+)?$/, "$1");
						
						var re = /(\d+)(\d{3})/;
						
						while (re.test(integer)) {
							integer = integer.replace(re, "$1,$2");
						}
						var result = symble + integer + ((decimal && decimal.length > 3) ? parseFloat(decimal).toFixed(deg).substring(1) : decimal);
						return result == "" ? 0 : result;
						
					} else {
						return number;
					}
				},
				
				//数值格式化的单位映射
				formatUnit:{
					1:'',
					10000:'万',
					100000000:'亿',
					1000000000000:'万亿',
					1000:'k',
					1000000:'M',
					1000000000:'G'
				},
				
				/**
				 * 数值格式化
				 * @method format
				 * @param {Number} value 数值
				 * @param {option} 格式化参数集合, 默认增加千分位,保留2位小数
				 * @param {string} option.type 格式化类型 num 数值, percent 百分比, flowNum 容量
				 * @param {Number} option.deg 保留几位小数
				 * @param {boolean} option.kannma 是否增加千分位
				 * @param {boolean} option.autoUnit 是否自动进行数值单位换算
				 * @param {Number} option.unit 指定单位换算值
				 * @return {string}
				 */
				format: function(value,option){
					if(value == NaN || value == Infinity){
						return "";
					}
					if(!isNaN(value)){
						if(!option){
							option = {
									type:'num',
									deg:2,
									kannma:true,
									datum:1
							}
						}
						value = Number(value);
						var deg = option.deg||0;
						if(option.type == 'num'){
							if(option.autoUnit){
								var datum = option.datum||1;
								if (Math.abs(value / Math.pow(10, 12)) >= datum) {
									return (value / Math.pow(10, 12)).toFixed(deg) + '万亿';
								} else if (Math.abs(value / Math.pow(10, 8)) >= datum) {
									return (value / Math.pow(10, 8)).toFixed(deg) + '亿';
								} else if (Math.abs(value / Math.pow(10, 4)) >= datum) {
									return (value / Math.pow(10, 4)).toFixed(deg) + '万';
								} else {
									return value;
								}
							}else{
								if(option.unit){
									value = value/option.unit;
								}
								value = value.toFixed(deg);
								if(option.kannma){
									value = this.addKannma(value,deg);
								}
								if(option.unit){
									value = value + this.formatUnit[option.unit];
								}
								return value;
							}
						}else if(option.type == 'percent'){
							return (value*100).toFixed(deg) + '%';
						}else if(option.type == 'flowNum'){
							var datum = option.datum||1;
							if (Math.abs(value / Math.pow(1024, 4)) >= datum) {
								return (value / Math.pow(1024, 4)).toFixed(deg) + 'TB';
							} else if (Math.abs(value / Math.pow(1024, 3)) >= datum) {
								return (value / Math.pow(1024, 3)).toFixed(deg) + 'GB';
							} else if (Math.abs(value / Math.pow(1024, 2)) >= datum) {
								return (value / Math.pow(1024, 2)).toFixed(deg) + 'MB';
							} else if(Math.abs(value / Math.pow(1024, 1)) >= datum){
								return (value / Math.pow(1024, 1)).toFixed(deg) + 'KB';
							} else{
								return value.toFixed(deg)+'B';
							}
						}
					}
					return value;
				},
				
				/**
				 * 字符串每个字符后添加换行符（用于图表坐标文字纵向显示）
				 * @method strReplace
				 * @param {string} str
				 * @param {string} len 字符串最大长度
				 */
				strReplace: function(str,len){
					if(!str){
						return str;
					}
					var re = new RegExp("\\S{1}","g"),
			        	ma = str.match(re),
			        	length = ma.length;
			        if(length>len){ma = ma.slice(0,len);}
			        return ma.join("\n");
				},
				
				/**
				 * 根据总高度和行高给出一个页大小，以保证分页按钮和table之间不要有空白且页大小为10的整数倍，允许y轴上滚动
				 * @method calculatePageSize
				 * @param {Number} totalHeight 总高度 
				 * @param {Number} lineHeight 行高
				 */
				calculatePageSize: function(totalHeight, lineHeight) {
					return Math.ceil(totalHeight / lineHeight / 10) * 10;
				},
				
				/**
				 * 转化为jstree格式的树结构
				 * @method createTreeData
				 */
				createTreeData: function(nodes, rootPid){
					// nodes里有根节点则返回根节点对象，否则返回数组
					var treeRootPid = (rootPid != undefined ? rootPid : "0");
					var nodeSet = {}, treeRoot, treeData = [];
					for ( var i in nodes) {
						nodes[i].text = nodes[i].name || nodes[i].text;
						nodes[i].a_attr = {title: nodes[i].text};
						nodeSet[nodes[i].id] = nodes[i];
						if (nodes[i].id == treeRootPid) { // 有根节点
							treeRoot = nodes[i];
							treeRoot.children = treeData;
						}
					}
					
					for ( var i in nodes) {
						if (!treeRoot || nodes[i].id != treeRoot.id) {
							if (nodeSet[nodes[i].pid]) {
								nodeSet[nodes[i].pid].children = nodeSet[nodes[i].pid].children || [];
								nodeSet[nodes[i].pid].children.push(nodes[i]);
							} else {
								treeData.push(nodes[i]);
							}
						}
					}
					
					return treeRoot || treeData;
				},
				
				/**
				* 创建jstree
				* @method buildJsTree
				* @param {array} data
				* @param {object} elem 树的容器
				* @param {string} plugin 取值："m"(可移动，无右菜单)，"r"(不可移动，有右菜单)，"mr"(可移动，有右菜单)，"n"(不可移动，无右菜单)
				* @param {string} icon 节点图标
				* @param {string} rightmenu 右侧菜单操作
				*/
				buildJsTree: function(data,elem,plugin,icon,rightmenu){
					var plugin = plugin || "n",
						icon = icon || "ygmat-file-box",
						treeData = [],
						right = {},
						pluginObj = {
							"m": ["types", "wholerow",'dnd'],
							"r": ["types", "wholerow",'rightmenu'],
							"mr": ["types", "wholerow",'dnd','rightmenu'],
							"n": ["types", "wholerow"]
						};
					if(plugin=="r"||plugin=="mr"){
						right = rightmenu;
					}
					if(data&&data.length){
						treeData = MAT.utils.createTreeData(data);
					}
					elem.jstree("destroy");
					elem.jstree({
						core : {
							"multiple": false,
							"themes":{
								"dots": false
							},
							'data': [{
								"id":"0","text":"全部","icon":icon,"state" : {"opened" : true},"children":treeData
							}],
							'dblclick_toggle': false,
							'check_callback': function (operation, node, parent, position, more) {
								if(operation === "move_node") {
									if(parent.id === "#") {
										return false; 
									}
								}
								return true; 
							}
						},
						"types" : {
							"default" : {
								"icon" : icon
							},
							"demo" : {
								"icon" : icon
							}
						},
						"rightmenu": right,
						"plugins": pluginObj[plugin]
					});
				},
				/**
				 * datatable 获取ajax分页options设置
				 * @method getAjaxPagingOptions
				 */
				getAjaxPagingOptions: function(settings) {
					var defoptions = {				
						destroy: true,
						serverSide: true,
						ordering: false,
						searching: false,
						processing: false,
						bInfo: true, //页脚信息
						paging: true,
						scrollY: 400,
                		scrollX: true,
						pagingType: "full_numbers",
						pageLength: 20,
						dom: 'tipr',
						// ajax: settings.ajax,						
						// columns: settings.columns,
						// createdRow: settings.createdRow || function(row, data, index){},
						language: {url: 'weblib/lib/data-tables/js/zh_CN.txt'},
						initComplete: function( settings1, json ) {
							var $bd = $(settings1.nScrollBody);
							$bd.addClass('scrollbar-dynamic')
							.scrollbar();
						}
					};
					var options = $.extend(true,defoptions,settings);
					return options;
				},
				/**
				 * datatable 获取非ajax不分页options设置
				 * @method getNotAjaxOptions
				 */
				getNotAjaxOptions: function(settings) {
					var defoptions = {						
						destroy: true,
						serverSide: false,
						ordering: false,
						searching: false,
						processing: false,
						bInfo: false, //页脚信息
						paging: false,
						scrollY: 400,
						scrollX: true,
						scrollCollapse: false,
						// data: settings.data,
						language: {url: 'weblib/lib/data-tables/js/zh_CN.txt'},
						initComplete: function( settings1, json ) {
							var $bd = $(settings1.nScrollBody);
							$bd.addClass('scrollbar-dynamic')
							.scrollbar();
						}
					};
					var options = $.extend(true,defoptions,settings);
					return options;
				},
				/**
				 * 弹出系统通知
				 * @method popMessage
				 * @param {string} message [必填]消息内容 
				 * @param {string} title 消息标题
				 * @param {Number} timeout 超时后自动关闭
				 */
				popMessage: function(message, title, timeout) {
					if (scope.Notification) {
						Notification.requestPermission(function(status) { 
							var notification = new Notification(title||'提示', {
								body: message
							}); 
							if (timeout) {
								notification.onshow = function() { 
									setTimeout(function(){
										notification.close();
									}, timeout);
								}
							}
						});
					}
				}
		};
		
		/**
		 * 扩展日期类型的格式化方法
		 * @method Format
		 * @param {string} fmt 格式化结构
		 * @return {string}
		 */
		Date.prototype.Format = function (fmt) { //author: meizz 
			var o = {
					"M+": this.getMonth() + 1, //月份 
					"d+": this.getDate(), //日 
					"h+": this.getHours(), //小时 
					"m+": this.getMinutes(), //分 
					"s+": this.getSeconds(), //秒 
					"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
					"S": this.getMilliseconds() //毫秒 
			};
			if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			return fmt;
		};
		
		/**
		 * 扩展字符串类型的模板替换方法
		 * @method format
		 * @param {object} args 数据
		 * @return {string}
		 */
		String.prototype.format = function(args) {
		    var result = this;
		    if (arguments.length > 0) {
		        if (arguments.length == 1 && typeof (args) == "object") {
		            for (var key in args) {
		                if(args[key]!=undefined){
		                    var reg = new RegExp("({" + key + "})", "g");
		                    result = result.replace(reg, args[key]);
		                }
		            }
		        }
		        else {
		            for (var i = 0; i < arguments.length; i++) {
		                if (arguments[i] != undefined) {
		                    var reg = new RegExp("({[" + i + "]})", "g");
		                    result = result.replace(reg, arguments[i]);
		                }
		            }
		        }
		    }
		    return result;
		};

		/**
		 * 扩展字符串类型的replace全部替换方法
		 * @method replaceAll
		 * @param {string} str1 需要替换的字符
		 * @param {string} str2 替换后的字符
		 * @return {string}
		 */
		String.prototype.replaceAll = function(str1, str2){
		    return this.replace(new RegExp(str1,"gm"),str2);
		}

		/**
		 * 去掉所有script
		 * @method removeAllScript
		 * @returns {string}
		 */
		String.prototype.removeAllScript = function(){
		    return this.replace(/<\s*script.*>(\s*|\S*)*<\/\s*script\s*>/gim,'');
		}
	})(window);
});