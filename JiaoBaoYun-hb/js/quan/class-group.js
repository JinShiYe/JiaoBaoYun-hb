/**
 * 班級群組界面邏輯
 * @anthor an
 */
mui.init()
var groupId = null;
var groupName = null;
mui('.mui-scroll-wrapper').scroll({
	indicators: true, //是否显示滚动条
})
var isMaster = false;
var allcount = 0;
//var groupInfos=[];
var groupRoles = []; //本人在群里的身份信息
var gride1 = document.getElementById('gride1');
var gride2 = document.getElementById('gride2');
var gride3 = document.getElementById('gride3');
var quit_group1 = document.getElementById('quit-group1');
var quit_group2 = document.getElementById('quit-group2');
var quit_group3 = document.getElementById('quit-group3');
mui.plusReady(function() {
		events.preload('group-pInfo.html', 200);
		window.addEventListener('postGroupInfo', function(e) {

			console.log(JSON.stringify(e.detail.data));
			if(e.detail.data) {
				groupId = e.detail.data.classId;
				groupName = e.detail.data.className;
				document.getElementById('title').innerText = groupName;
				groupRoles = [];
				allcount = 0;
				setGride();
				/**
				 *获取个人在群信息 
				 */
				getUserInGroup(-1, function(data) {
					groupRoles = data;
					console.log('获取本人在群的所有信息：' + JSON.stringify(data));
				});
			}
		})
		window.addEventListener('groupInfoChanged',function(){
			setGride();
		})
		//群組頭像點擊事件
		mui('#gride1').on('tap', '.mui-table-view-cell', function() {
			events.fireToPageWithData('group-pInfo.html', 'postPInfo', this.info);
		})
		mui('#gride2').on('tap', '.mui-table-view-cell', function() {
			events.fireToPageWithData('group-pInfo.html', 'postPInfo', this.info);
		})
		mui('#gride3').on('tap', '.mui-table-view-cell', function() {
			events.fireToPageWithData('group-pInfo.html', 'postPInfo', this.info);
		})
		//退出按鈕點擊事件
		quit_group1.addEventListener('tap', function() {
				getUserInGroup(3, showChoices);
			})
		//退出按鈕點擊事件
		quit_group2.addEventListener('tap', function() {
				getUserInGroup(2, showChoices);
			})
		//退出按鈕點擊事件
		quit_group3.addEventListener('tap', function() {
				getUserInGroup(0, showChoices);
			})
		
	})
	/**
	 * 获取用户在群组中的信息
	 * @param {Object} mstype
	 * @param {Object} callback
	 */
var getUserInGroup = function(mstype, callback) {
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	postDataPro_PostGuI({
		vvl: groupId,
		vtp: mstype
	}, wd, function(data) {
		wd.close()
		console.log('用户在群的身份 ' + JSON.stringify(data));
		if(data.RspCode == '0000') {
			if(callback) {
				callback(data.RspData);
			}
			isShowQuit(mstype, true);
		} else {
			isShowQuit(mstype, false);
			//			mui.toast('您未以当前身份加入该群！');
		}
	})
}
/**
 * 是否顯示退出按鈕
 * @param {Object} mstype
 * @param {Object} b
 */
var isShowQuit = function(mstype, b) {
		switch(mstype) {
			case 0:
				b ? quit_group3.style.display = 'block' : quit_group3.style.display = 'none'
				break;
			case 2:
				b ? quit_group2.style.display = 'block' : quit_group2.style.display = 'none'
				break;
			case 3:
				b ? quit_group1.style.display = 'block' : quit_group1.style.display = 'none'
				break;
			default:
				break;
		}
	}
	/**
	 * 根据角色数量 显示不同选择
	 * @param {Object} data
	 */
var showChoices = function(data) {
		console.log('showChoices' + JSON.stringify(groupRoles))
		if(groupRoles.length > 1) {
			plus.nativeUI.actionSheet({
				title: "请选择退群方式",
				cancel: "取消",
				buttons: [{
					title: "退出当前群组"
				}, {
					title: "退出所有身份(群主除外)"
				}]
			}, function(e) {
				console.log("User pressed: " + e.index);
				if(e.index > 0) {
					if(e.index == 1) {
						quitGroup(data[0], quitSquad);
					} else {
						quitGroupAll();
					}
				}

			});
		} else {
			quitGroupAll();
		}
	}
	/**
	 * 退出群
	 */
var quitGroupAll = function() {
		groupRoles.forEach(function(groupRole, i) {
			if(groupRole.mstype == 1) {
				isMaster = true;
				allcount++;
			} else {
				quitGroup(groupRole, allCallback);
			}

		})
	}
	/**
	 * 退出群
	 */
var allCallback = function(roleInfo) {
		allcount++;
		if(allcount > 0 && allcount == groupRoles.length) {
			events.fireToPageNone('../quan/tab-zone.html', 'quitGroup');
			groupRoles = [];
			allcount = 0;
			if(!isMaster) {
				var curpage = plus.webview.currentWebview();
				curpage.opener().close();
				curpage.close();
			} else {
				setGride();
			}
		}
	}
	/**
	 * 退出小组 
	 * @param {Object} roleInfo
	 */
var quitSquad = function(roleInfo) {
		console.log('退群的groupInfo:' + Array.isArray(groupRoles) + JSON.stringify(roleInfo) + groupRoles.indexOf(roleInfo));
		groupRoles.forEach(function(groupRole, i) {
				if(groupRole.gutid == roleInfo.gutid) {
					groupRoles.splice(i, 1);
					return false;
				}
			})
			//				groupRoles.splice(groupRoles.indexOf(roleInfo), 1);
		console.log('退组后的身份信息：' + JSON.stringify(groupRoles));
		getGroupInfo(roleInfo.mstype);
		events.fireToPageNone('../quan/tab-zone.html', 'quitGroup');
	}
	/**
	 * 退出群组
	 * @param {Object} roleInfo
	 * @param {Object} callback
	 */
var quitGroup = function(roleInfo, callback) {
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	postDataPro_PostGuD({
		vvl: roleInfo.gutid
	}, wd, function(data) {
		console.log('退群返回值：' + JSON.stringify(data));
		wd.close();
		if(data.RspCode == '0000') {
			mui.toast('退群成功');
			callback(roleInfo);
		} else {
			mui.toast(data.RspTxt);
		}
	})
}
/**
 * 界面加載數據初始化
 */
var setGride = function() {
	console.log('传送的groupId:' + groupId)
	getGroupInfo(3);
	getGroupInfo(2);
	getGroupInfo(0);
	getUserInGroup(3);
	getUserInGroup(2);
	getUserInGroup(0);
}
/**
 * 不同群組加載數據
 * @param {Object} vvl 群組類型 0：家長2老師3家長
 */
var getGroupInfo = function(vvl) {
		var item;
		switch(vvl) {
			case 0:
				item = gride3;
				break;
			case 2:
				item = gride2;
				break;
			case 3:
				item = gride1;
				break;
			default:
				break;
		}
		//清空歷史數據
		events.clearChild(item);
		var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING)
		//請求群組成員數據
		postDataPro_PostGusers({
			top: -1,
			vvl: groupId,
			vvl1: vvl
		}, wd, function(groupData) {
			wd.close();
			console.log('获取群组成员：' + vvl + JSON.stringify(groupData))
			//成功囘調
			if(groupData.RspCode == '0000' && groupData.RspData != null) {
//				createGride(item, data.RspData);
				getRemarkData(groupData.RspData,function(Remarkdata){
					var list=[];
					if(Remarkdata.RspCode=='0000'){
						list=addRemarkData(groupData.RspData,Remarkdata.RspData);
					}else{
						list=addRemarkData(groupData.RspData)
					}
					events.clearChild(item);
					console.log('最终呈现的数据：'+vvl+JSON.stringify(list));
					createGride(item, list);
				})

			}
		});
	}
var addRemarkData=function(list,remarkList){
	if(remarkList){
		for(var i in list){
			for(var j in remarkList){
				if(list[i].utid==remarkList[j].butid){
					list[i].bunick=remarkList[j].bunick;
					break;
				}else{
					list[i].bunick=list[i].gname;
				}
			}
		}
//		list.forEach(function(cell,j,tolist){
//			remarkList.forEach(function(remark,i,relist){
//				console.log('对比值：'+JSON.stringify(cell)+':'+JSON.stringify(remark));
//				if(cell.utid==remark.butid){
//					list[j].bunick=remark.bunick;
//					return false;
//				}else{
//					list[j].bunick=cell.ugname;
//				}
//			})
//		})
	}else{
		list.forEach(function(cell,i){
			list[i].bunick=cell.ugname;
		})
	}
	return list;
}
/**
 * 获取备注
 */
var getRemarkData = function(list,callback) {
		var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
		var utids=[];
		list.forEach(function(cell){
			utids.push(cell.utid);
		})
		console.log('传的字符串：'+utids.toString())
		postDataPro_PostUmk({
			vvl: utids.toString()
		}, wd, function(data) {
			wd.close();
			console.log('获取的备注信息：'+JSON.stringify(data));
			var remark=document.getElementById('person-remark');
			callback(data);
		})
	}
	/**
	 * 加載九宮格數據
	 * @param {Object} gride 九宫格父控件
	 * @param {Object} array 元素数组，包括图标和标题
	 */
var createGride = function(gride, array) {

	//数组遍历
	array.forEach(
		/**
		 * 创建子元素
		 * @param {Object} map 数组元素
		 * @param {Object} index 数组序号
		 * @param {Object} array 数组
		 */
		function(cell, index, array) {
			var li = document.createElement('li'); //子元素
			//			var bgColor=getRandomColor();//获取背景色
			if(array.length <= 3) { //数组小于等于3，每行3个图标
				li.className = "mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-4";
			} else { //数组大于3，每行四个图标
				li.className = "mui-table-view-cell mui-media mui-col-xs-3 mui-col-sm-3";
			}
			cell.gname=groupName;
			li.info = cell;
			//子控件的innerHTML
			li.innerHTML = '<a href="#">' +
				'<img class="circular-square" src="' + getImg(cell.uimg) + '"/></br>' +
				'<small class="">' + cell.bunick + '</small>' +
				'</a>';
			gride.appendChild(li);
		})
}
//頭像設置
var getImg = function(img) {
	return img == null ? "../../image/utils/default_personalimage.png" : img
}