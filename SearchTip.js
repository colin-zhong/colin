/**
* author:zhongwang
* 输入提示下
**/

/**
*作用域
**/
var Search = {};
/**
* dom操作方法
**/
Search._util = {
	//根据id获取节点
	queryElem : function(id){
		return document.getElementById(id)
	},
	//获取事件源
	getEvent : function(event){
		return event ? event : window.event;
	},
	//获取触发事件的节点
	getTarget : function(e){
		return e.target ? e.target : e.srcElement;
	},
	//绑定事件
	on : function(node,type,hander){
		node.addEventListener ? node.addEventListener(type,hander,false) : node.attachEvent('on'+type,hander);
	},
	//是否含有class
	hasClass : function(node,c){
		if(!node || !node.className)return false;
		return node.className.indexOf(c) > -1;
	},
	//添加class
	addClass : function(node,c){
		if(!node)return;
		node.className = Search._util.hasClass(node,c) ? node.className : node.className + ' ' + c;
	},
	//移出class
	removeClass : function(node,c){
		if(!Search._util.hasClass(node,c))return;
		var reg = new RegExp('(^|\\s+)'+c+'($|\\s+)','g');
		node.className = reg.test(node.className) ? node.className.replace(reg,'') : node.className;
	},
	//取当前节点的前一个兄弟节点
	prev : function(node){
		if(node.nodeType == 1){
			while(node.previousSibling){
				node = node.previousSibling;
				if(node.nodeType == 1){
					return node;
				}
			}
			return {};
		}
	},
	//取当前节点的后一个兄弟节点
	next : function(node){
		if(node.nodeType == 1){
			while(node.nextSibling){
				node = node.nextSibling;
				if(node.nodeType == 1){
					return node;
				}
			}
		}
		return {};
	},
	//获取节点在body中的位置
	getPos : function(node){
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft,
			scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		return {left : node.offsetLeft,top : node.offsetTop};
	},
	//阻止冒泡
	stopPropagation : function(event){
		var event = event || window.event;
		event.stopPropagation ? event.stopPropagation() : window.event.cancelBubble = true;
	}
};
/* *
 * 提示内容数组
 * */
Search.pulldownArr = ['北京一日游','三亚七日游','三亚旅游攻略','海南三亚','三亚自助游','庆丰包子铺','庆丰包子铺，习总套餐',
		'西岭雪山','峨嵋山','峨嵋山旅游攻略','世界公园','世界人文地理','世界文化','12306','12306网上抢票','12306智能验证码',
		'today','重庆是个好地方','重庆真好玩','神奇的九寨','人间的天堂','九寨是个好地方','大家都到九寨来玩哦','九寨在四川',
		'九寨旅游攻略','九寨自驾游','到九寨旅游，和自然亲近','九寨沟风光很好，一定要到这里走一走哦','abcdefghijkl','abcdefg',
		'hijklmno','porstuv','wxyzhijk','lmnopqrst','uvwxyz','',''];
/* *
 * 构造函数
 * */
var SearchTip = function(){
	this.initialize.apply(this,arguments);
};
SearchTip.prototype = {
	/**
	* 初始化方法
	**/
	initialize : function(options){
		this.input = Search._util.queryElem(options.id);
		if(options.maxSize)this.maxSize = options.maxSize
		this.inputEvent();
	},
	/**
	* 上下箭头时记录前前状态
	**/
	count : 0,
	/**
	* 提示列表的最大值，默认为8
	**/
	maxSize : 8,
	/**
	* 搜索框事件
	**/
	inputEvent : function(){
		//保存上下文
		var that = this;
		//focus事件
		Search._util.on(this.input,'focus',function(){
			//创建下拉框容器
			var element = Search._util.queryElem('SearchPullDown');
			if(element){
				document.body.removeChild(element)
			}
			var pos =Search._util.getPos(that.input),
			pulldown = document.createElement('div');
			pulldown.className = 'SearchPullDown';
			pulldown.id = 'SearchPullDown';
			pulldown.style.width = that.input.offsetWidth - 1 + 'px';
			pulldown.style.left = pos.left + 'px';
			pulldown.style.top = pos.top + that.input.offsetHeight + 'px';
			document.body.appendChild(pulldown);
			that.pulldownEvent();
			that.documentEvent();
		});
		//keyup事件
		Search._util.on(this.input,'keyup',function(event){
			var text = that.input.value,
				event = Search._util.getEvent(event),
				keycode = event.keyCode,
				element = Search._util.queryElem('SearchPullDown');
			if(text != ''){
				if(keycode == 40 || keycode == 38 || keycode == 13){
					that.keyboardEvent(event,keycode);
				}else if(keycode >= 65 && keycode <= 90 || keycode >= 48 && keycode <= 57 
					|| keycode == 32 || keycode == 8 || keycode == 186
					|| keycode >= 188 && keycode <= 192 || keycode >= 219 && keycode <= 222){
					that.fillPullDown(text,element);
				}
			}else{
				element.innerHTML = '';
				Search._util.removeClass(element,'pd-border');
				that.count = -1;
			}
		});
		//click事件
		Search._util.on(this.input,'click',function(event){
			Search._util.stopPropagation(event);
		});	
	},
	/**
	* 创建下拉列表
	**/
	fillPullDown : function(text,element){
		var html = '',
			showCount = 0;
		for(var i = 0,len = Search.pulldownArr.length;i < len;i++){

			var index = Search.pulldownArr[i].indexOf(text);
			if(index > -1){
				var prevText = Search.pulldownArr[i].substr(0,index),
					nextText = Search.pulldownArr[i].substr(index + text.length,Search.pulldownArr[i].length);

				html += ['<p class="pd-item" title="' + Search.pulldownArr[i] + '">',
							'<span class="pd-prev">' + prevText + '</span>',
							'<span class="pd-text">' + text + '</span>',
							'<span class="pd-next">' + nextText + '</span>',
						'</p>'].join('');
				showCount++;
			}
			if(showCount >= this.maxSize){
				break;
			}
		}

		if(html != ''){
			Search._util.addClass(element,'pd-border');
		}else{
			Search._util.removeClass(element,'pd-border');
		}
		element.innerHTML = html;
		this.count = -1;
	},
	/**
	* 下拉列表事件
	**/
	pulldownEvent : function(){
		//保存上下文
		var that = this,
			element = Search._util.queryElem('SearchPullDown');
		Search._util.on(element,'click',function(event){
			var e = Search._util.getEvent(event),
				target = Search._util.getTarget(e);
			Search._util.stopPropagation(e);
			//点击item的空白处
			if(Search._util.hasClass(target,'pd-item')){
				var spans = target.getElementsByTagName('span'),
					text = spans[0].innerText + spans[1].innerText + spans[2].innerText;
				that.input.value = text;
				document.body.removeChild(element);
			}else if(Search._util.hasClass(target,'pd-prev')	//点击item的内容
				|| Search._util.hasClass(target,'pd-text')
				|| Search._util.hasClass(target,'pd-next')){
				var parent = target.parentNode,
					spans = parent.getElementsByTagName('span'),
					text = spans[0].innerText + spans[1].innerText + spans[2].innerText;
				that.input.value = text;
				document.body.removeChild(element);
			}
		});	
	},
	/**
	* 向上向下箭头
	**/
	keyboardEvent : function(event,keycode){
		var that = this,
			items = Search._util.queryElem('SearchPullDown').getElementsByTagName('p'),
			len = items.length;
			switch(keycode){
				//向下箭头↓
				case 40:
					this.count++;
					if(this.count > len - 1)this.count = 0;
					for (var i = len - 1; i >= 0; i--) {
						Search._util.removeClass(items[i],'pd-curr');
					};
					Search._util.addClass(items[this.count],'pd-curr');
					break;
				//向上箭头↑
				case 38:
					this.count--;
					if(this.count < 0) this.count = len - 1;
					for (var i = len - 1; i >= 0; i--) {
						Search._util.removeClass(items[i],'pd-curr');
					};
					Search._util.addClass(items[this.count],'pd-curr');
					break;
				// enter键
				case 13:
					var spans = items[that.count].getElementsByTagName('span'),
						text = spans[0].innerText + spans[1].innerText + spans[2].innerText;
					that.input.value = text;
					document.body.removeChild(Search._util.queryElem('SearchPullDown'));
					//Search._util.queryElem('SearchPullDown').innerHTML = '';
			}
	},
	/**
	* document click事件
	**/
	documentEvent : function(){
		Search._util.on(window,'click',function(){
			var searchPullDown = Search._util.queryElem('SearchPullDown');
			if(searchPullDown){
				document.body.removeChild(searchPullDown);
			}
		});
	}
}
