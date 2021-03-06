/**
 *作者：444811716@qq.com
 *时间：2016-10-28
 *描述：手势移动事件，可以移动，放大，缩小元素(该元素的position必须是绝对布局absolute)
 */
var TouchMove = (function(mod) {

	//触摸事件(touch)会在用户手指放在屏幕上面的时候、在屏幕上滑动的时候或者是从屏幕上移开的时候出发。
	//下面具体说明
	//touchstart事件：当手指触摸屏幕时候触发，即使已经有一个手指放在屏幕上也会触发。
	//touchmove事件：当手指在屏幕上滑动的时候连续地触发。在这个事件发生期间，调用preventDefault()事件可以阻止滚动。
	//touchend事件：当手指从屏幕上离开的时候触发。
	//touchcancel事件：当系统停止跟踪触摸的时候触发。关于这个事件的确切出发时间，文档中并没有具体说明，咱们只能去猜测了。

	//触摸事件还包含下面三个用于跟踪触摸的属性。
	//touches：表示当前跟踪的触摸操作的touch对象的数组。
	//targetTouches：特定于事件目标的Touch对象的数组。
	//changeTouches：表示自上次触摸以来发生了什么改变的Touch对象的数组。

	//每个Touch对象包含的属性如下。
	//clientX：触摸目标在视口中的x坐标。
	//clientY：触摸目标在视口中的y坐标。
	//identifier：标识触摸的唯一ID。
	//pageX：触摸目标在页面中的x坐标。
	//pageY：触摸目标在页面中的y坐标。
	//screenX：触摸目标在屏幕中的x坐标。
	//screenY：触摸目标在屏幕中的y坐标。
	//target：触目的DOM节点目标。

	//记录页面范围
	var screen = {
		width: 0,
		height: 0
	}
	var table = null; //操作的元素

	//移动table时记录手指的坐标
	var movedx = 0;
	var movedy = 0;
	//放大缩小table时记录手指坐标的变化
	var changex = 0;
	var changey = 0;

	//记录放大缩小后table的x,y,宽,高
	var table_after = {
		x: 0, //x坐标
		y: 0, //y坐标
		width: 0, //宽
		height: 0 //高
	}

	//记录双击时table的坐标
	var doubleTap_x = 0;
	var doubleTap_y = 0;

	/**
	 * 增加监听
	 * @param {Object} elment 移动，放大的元素
	 */
	mod.addTouchListener = function(elment) {
		//获取屏幕范围
		screen = {
			height: plus.screen.resolutionHeight - plus.navigator.getStatusbarHeight(), //屏幕高度-状态栏高度
			width: plus.screen.resolutionWidth //屏幕宽度
		};
		//获得该元素
		table = elment;

		//获取table的宽高
		var table_width = table.offsetWidth;
		var table_height = table.offsetHeight;
		//根据宽高的大小判断是否放大和如何放大
		if(table_width > table_height) {
			//宽大于高
			if(table_height < screen.width / 2) {
				//高度小于屏幕的一半
				table.style.height = screen.width / 2 + 'px'; //设置table的高度为屏幕1/2的宽度
				table.style.width = table_width * (screen.width / 2 / table_height) + 'px'; //宽度按比例放大
			}
		} else {
			//高大于宽
			if(table_width < screen.width / 2) {
				//宽度小于屏幕的一半
				table.style.width = screen.width / 2 + 'px'; //设置图片的宽度为屏幕的宽度
				table.style.height = table_height * (screen.width / 2 / table_width) + 'px'; //高度按比例放大
			}
		}

		//设置table居中
		table.style.left = (screen.width - table_width) / 2 + 'px';
		table.style.top = (screen.height - table_height) / 2 + 'px';

		//页面增加Touch的监听
		//document.addEventListener('touchstart', touch);
		document.addEventListener('touchmove', touch);
		document.addEventListener('touchend', touch);

		//增加双击table的监听
		table.addEventListener('doubletap', doubleTap);
	}

	/**
	 * 双击回调
	 */
	function doubleTap() {
		//双击后重置放大缩小的记录
		table_after = {
			x: 0, //x坐标
			y: 0, //y坐标
			width: 0, //宽
			height: 0 //高
		}

		//获取table的info
		var table_doubletap = {
			x: table.offsetLeft,
			y: table.offsetTop,
			width: table.offsetWidth,
			height: table.offsetHeight
		}

		var enlarge = false; //是否是放大
		if(table_doubletap.width >= screen.width) {
			//如果table的宽度大于屏幕则缩小
			table.style.width = table_doubletap.width / 2 + 'px';
			table.style.height = table_doubletap.height / 2 + 'px';
		} else {
			enlarge = true;
			table.style.width = table_doubletap.width * 2 + 'px';
			table.style.height = table_doubletap.height * 2 + 'px';
		}
		//记录双击触点和table坐标的距离
		var double_changex = doubleTap_x - table_doubletap.x;
		var double_changey = doubleTap_y - table_doubletap.y;

		//根据触点移动
		if(enlarge) { //放大
			table.style.left = table_doubletap.x - double_changex + 'px';
			table.style.top = table_doubletap.y - double_changey + 'px';
		} else { //缩小
			table.style.left = table_doubletap.x + double_changex / 2 + 'px';
			table.style.top = table_doubletap.y + double_changey / 2 + 'px';
		}
	}

	/**
	 * Touch回调
	 * @param {Object} event 触碰对象
	 */
	function touch(event) {
		var event = event || window.event;
		switch(event.type) {
			//case "touchstart": //开始触碰
			//onsole.log("touchstart");
			//break;
			case "touchend": //结束触碰
				////console.log("touchend");
				//结束触碰后重置记录移动的坐标
				movedx = 0;
				movedy = 0;
				//结束触碰后记录双击后触点的坐标
				doubleTap_x = parseInt(event.changedTouches[0].clientX);
				doubleTap_y = parseInt(event.changedTouches[0].clientY);
				break;
			case "touchmove": //开始移动
				////console.log("touchmove");
				event.preventDefault(); //阻止页面滚动
				if(event.touches[1] != undefined) {
					//有第二个触点
					changeTable(event.touches[0], event.touches[1]); //放大缩小table
				} else {
					//只有一个触点
					moveTable(event.touches[0]); //移动table
				}
				break;
			default:
				break;
		}
	}

	/**
	 * 移动元素
	 * @param {Object} data 元素的数据
	 * @param {Object} table 元素
	 */
	function moveTable(data) {
		if(data.target.getAttribute('id') == table.id) {
			if(movedx == 0) {
				movedx = data.clientX;
				movedy = data.clientY;
			} else {
				//判断移动方向和距离
				var x = movedx - data.clientX;
				var y = movedy - data.clientY;
				//获取table坐标和宽高
				var table_x = table.offsetLeft;
				var table_y = table.offsetTop;
				var table_width = table.offsetWidth;
				var table_height = table.offsetHeight;
				if(x >= 0) { //左移
					table.style.left = (table_x - Math.abs(x)) + 'px';
				} else { //右移
					table.style.left = (table_x + Math.abs(x)) + 'px';
				}

				if(y >= 0) { //上移
					table.style.top = (table_y - Math.abs(y)) + 'px';
				} else { //下移
					table.style.top = (table_y + Math.abs(y)) + 'px';
				}
				//记录本次坐标
				movedx = data.clientX;
				movedy = data.clientY;

				//将table的边界限制在页面中心宽度的1/4圆圈的范围区域内
				//获取table坐标和宽高
				var table_x = table.offsetLeft;
				var table_y = table.offsetTop;
				var table_width = table.offsetWidth;
				var table_height = table.offsetHeight;
				//限制右移区域
				if(table_x >= screen.width / 4 && x < 0) {
					//如果x坐标大于屏幕宽度的1/4，并且右移时
					table.style.left = (screen.width / 4) + 'px';
				}
				//限制左移区域
				if(table_x + table_width <= (screen.width * 3 / 4) && x > 0) {
					//如果x坐标加上table的宽度，小于屏幕宽度的3/4，并且左移时
					table.style.left = (screen.width * 3 / 4) - table_width + 'px';
				}
				//限制下移区域
				if(table_y >= (screen.height / 2 - screen.width / 4) && y < 0) {
					//如果y坐标，大于圆圈顶部的坐标，并且下移时
					if(table_height > (screen.width / 2)) {
						//如果table的高度大于屏幕宽度的1/2（在圆圈范围内）
						table.style.top = (screen.height / 2 - screen.width / 4) + 'px';
					} else {
						table.style.top = (screen.height / 2 + screen.width / 4 - table_height) + 'px';
					}
				}
				//限制上移区域
				if(table_y + table_height <= (screen.height / 2 + screen.width / 4) && y > 0) {
					//如果y坐标，大于圆圈底部的坐标，并且上移时
					if(table_height > (screen.width / 2)) {
						//如果table的高度大于屏幕宽度的1/2（在圆圈范围内）
						table.style.top = (screen.height / 2 + screen.width / 4 - table_height) + 'px';
					} else {
						table.style.top = (screen.height / 2 - screen.width / 4) + 'px';
					}
				}
			}
		}
	}

	/**
	 * 改变table的大小
	 * @param {Object} touch1 触点
	 * @param {Object} touch2 触点2
	 */
	function changeTable(touch1, touch2) {
		//parseInt()获取整数
		//touch1坐标
		var x1 = parseInt(touch1.clientX);
		var y1 = parseInt(touch1.clientY);
		//touch2坐标
		var x2 = parseInt(touch2.clientX);
		var y2 = parseInt(touch2.clientY);
		//Math.abs()获取绝对值
		//获取touch之间的距离
		var x = Math.abs(x1 - x2);
		var y = Math.abs(y1 - y2);
		//与上一次touch比较
		var changex2 = changex - x;
		var changey2 = changey - y;

		//获取table坐标和宽高
		var table_x = table.offsetLeft;
		var table_y = table.offsetTop;
		var table_width = table.offsetWidth;
		var table_height = table.offsetHeight;
		////console.log("befor:" + table_x + "|" + table_y + "|" + table_width + "|" + table_height);
		//改变宽度高度
		if(Math.abs(changex2) <= 15 && Math.abs(changey2) <= 15) {
			//限制两个触点的变化距离
			var change = changex2 + changey2; //根据x,y总体的大小判断是缩小还是放大
			if(change > 0) { //缩小
				if(table_width - Math.abs(change) > screen.width / 2 && table_height - Math.abs(change) > screen.width / 2) {
					//缩小后的宽高要大于屏幕的1/2
					table.style.width = (table_width - Math.abs(change)) + 'px';
					table.style.height = table_height * ((table_width - Math.abs(change)) / table_width) + 'px';
				}
			} else { //放大
				table.style.width = (table_width + Math.abs(change)) + 'px';
				table.style.height = table_height * ((table_width + Math.abs(change)) / table_width) + 'px';
			}
		}

		//将table的边界限制在页面中心宽度的1/4圆圈的范围区域内
		changeInCenter(table);
		//记录本次change
		changex = x;
		changey = y;
	}

	/**
	 * 放大后将table的边界限制在页面中心宽度的1/4圆圈的范围区域内
	 * @param {Object} table 点击对象
	 */
	function changeInCenter(table) {
		if(table_after.width != 0) {
			//获取table坐标和宽高
			var table_x = table.offsetLeft;
			var table_y = table.offsetTop;
			var table_width = table.offsetWidth;
			var table_height = table.offsetHeight;

			//顶部超过界限
			if(table_y > screen.height / 2 + screen.width / 4) {
				table.style.top = screen.height / 2 - screen.width / 4 + 'px';
			}
			//底部超过界限
			if(table_y + table_height < screen.height / 2 + screen.width / 4) {
				table.style.top = table_y + table_after.height - table_height + 'px';
			}
			//左侧超过界限
			if(table_x > screen.width / 4) {
				table.style.left = screen.width / 4 + 'px';
			}
			//右侧超过界限
			if(table_x + table_width < screen.width * 3 / 4) {
				table.style.left = table_x + table_after.width - +table_width + 'px';
			}
		}
		//记录本次x,y,宽,高
		table_after = {
			x: table.offsetLeft,
			y: table.offsetTop,
			width: table.offsetWidth,
			height: table.offsetHeight
		}
	}
	return mod;
})(window.TouchMove || {});