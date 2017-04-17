var type = 2; //排列顺序类型1为顺序，2为倒序
var pageIndex = 1; //当前页码
var totalPageCount = 1; //总页数
var answerInfo; //回答详情
var answerData; //答案数据
var selfId;
var flag = 1; //1为加载数据 0 为重置顺序
var upperInfo;
var parentContainer; //评论父控件
var wd;
/**
 * 加载刷新
 */
events.initRefresh('list-container', function() {
	flag = 1;
	pageIndex = 1;
	wd = events.showWaiting();
	requestAnswerDetail(answerInfo.AnswerId, pageIndex, 10, getInfos);
}, function() {
	mui('#refreshContainer').pullRefresh().endPullupToRefresh(pageIndex >= totalPageCount);
	if(pageIndex < totalPageCount) {
		pageIndex++;
		flag = 1;
		wd = events.showWaiting();
		requestAnswerDetail(answerInfo.AnswerId, pageIndex, 10, getInfos);
	}
})

/**
 * 
 */
mui.plusReady(function() {
	mui.previewImage();
	events.limitPreviewPullDown("refreshContainer");
	events.preload('qiuzhi-addAnswer.html');
	mui.fire(plus.webview.getWebviewById('qiuzhi-sub.html'), "answerIsReady");
	plus.webview.currentWebview().opener().addEventListener("hide", function() {
		mui.previewImage().close();
		console.log("求知回答页面已隐藏")
		//		events.clearChild(document.getElementById('list-container'));
		//		setOriginalCondition();
		mui('#popover').popover('hide');
	})
	//加载监听
	window.addEventListener('answerInfo', function(e) {
		flag = 1;
		selfId = parseInt(myStorage.getItem(storageKeyName.PERSONALINFO).utid);
		mui('#refreshContainer').pullRefresh().refresh(true);
		answerData = {};
		pageIndex = 1;
		totalPageCount = 1;
		answerInfo = e.detail.data;
		setChangeCondition();
		console.log("获取的回答详情：" + JSON.stringify(answerInfo));
		//如果跟上次进入的是同一个回答 则不更改顺序
		if(!(answerInfo && e.detail.data.AnswerId == answerInfo.AnswerId)) {
			type = 2; //倒序
		}
		setTolerantChecked(type);
		console.log('回答详情获取的答案信息:' + JSON.stringify(answerInfo));
		var answerId = answerInfo.AnswerId;
		document.getElementById('list-container').innerHTML = "";
		wd = events.showWaiting();
		requestAnswerDetail(answerId, pageIndex, 10, getInfos);
	});
	window.addEventListener('commentAdded', function(e) {
		var commentedInfo = e.detail.data;
		getComment(commentedInfo.commentInfo);
	})
	window.addEventListener("showActionSheet", function() {
		var btnArray;
		var cbArray;
		if(answerData.CommentNum) {
			btnArray = [{
				title: "修改答案"
			}, {
				title: "屏蔽答案",
				dia: 1 //是否显示dialog
			}];
			cbArray = [changeAnswer, shieldAnswer];
		} else {
			btnArray = [{
				title: "修改答案"
			}, {
				title: "删除答案",
				dia: 1 //是否显示dialog
			}];
			cbArray = [changeAnswer, delAnswer];
		}

		events.showActionSheet(btnArray, cbArray);
	})
	setListeners();
})
/**
 * 更改状态 并通知父页面
 */
var setChangeCondition = function() {
	var moreShow = 0;
	if(answerInfo.AnswerMan == selfId) {
		moreShow = 1;
	} else {
		moreShow = 0;
	}
	mui.fire(plus.webview.currentWebview().opener(), "moreShow", moreShow);
}
/**
 * 修改回答
 */
var changeAnswer = function() {
	//修改答案
	events.fireToPageWithData("qiuzhi-addAnswer.html", "changeAnswer", answerInfo);
}
var shieldAnswer = function() {
//	mui.toast("功能暂未开放，请稍候！");
	var wd1=events.showWaiting();
	postDataQZPro_setAnswerOffById({
		answerId: answerInfo.AnswerId
		status: 1
	}, wd1, function(data) {
		wd1.close();
		console.log("屏蔽后返回的数据:" + JSON.stringify(data));
		if(data.RspCode==0&&data.RspData.Result){
			mui.toast("回答已屏蔽！");
			mui.back();
		}else{
			mui.toast("屏蔽回答失败！");
		}
	})
}
/**
 * 删除回答
 */
var delAnswer = function() {
	var wd1 = events.showWaiting();
	//删除回答，并返回上级页面
	postDataQZPro_delAnswerById({
		answerId: answerInfo.AnswerId
	}, wd1, function(data) {
		wd1.close();
		console.log("删除回答的接口：" + JSON.stringify(data));
		if(data.RspCode == 0) {
			//			mui.fire(plus.webview.currentWebview().opener(),"answerDeled",answerInfo)
			mui.back();
		} else {
			mui.toast("删除回答失败");
		}
	})
}
/**
 * 删除评论吧
 */
var delComment = function() {
	var wd1 = events.showWaiting();
	postDataQZPro_delCommentById({
		commentId: upperInfo.TabId
	}, wd1, function(data) {
		console.log("删除评论后返回的数值：" + JSON.stringify(data));
		wd1.close();
		if(data.RspCode == 0 && data.RspData.Result) {
			resetSiblingOrder(delCommentContainer);
			delCommentData();
			if(upperInfo.UpperId) { //存在上级评论id 直接删除本cell
				parentContainer.querySelector(".inner-table-view").removeChild(delCommentContainer);
				if(!parentContainer.querySelector(".inner-table-view").firstElementChild) {
					parentContainer.removeChild(parentContainer.querySelector(".inner-table-view"));
				}
			} else { //不存在，删除本cell后增加单条评论
				document.querySelector("#list-container").removeChild(delCommentContainer);
				if(pageIndex < totalPageCount) {
					requestAnswerDetail(answerInfo.AnswerId, pageIndex * 10, 1, getInfos);
				}
			}
		}

	})

}
/**
 * 删除answerData的数据
 */
var delCommentData = function() {
	var delCmOrder = delCommentContainer.querySelector(".icon-support").order;
	if(typeof(delCmOrder) == "string") {
		var delOrders = delCmOrder.split("-");
		answerData.Data[parseInt(delOrders[0])].Replys.splice(parseInt(delOrders[1]), 1);
	} else {
		answerData.Data.splice(delCmOrder, 1);
		console.log("删除的位置：" + delCmOrder + ",删除后的数据：" + JSON.stringify(answerData));
	}
}
var resetSiblingOrder = function(container) {
	if(container.nextElementSibling) {
		var nextElm = container.nextElementSibling;
		var sibOrder = nextElm.querySelector(".icon-support").order;
		if(typeof(sibOrder) == "string") {
			var orders = sibOrder.split("-");
			nextElm.querySelector(".icon-support").order = orders[0] + "-" + (parseInt(orders[1]) - 1);
		} else {
			nextElm.querySelector(".icon-support").order = sibOrder - 1;
		}
		resetSiblingOrder(nextElm);
	}
}
/**
 * 修改评论
 */
var changeComment = function() {
	mui.toast("功能暂未开放，请稍候！")
}
/**
 * 获取单条评论
 * @param {Object} commentInfo
 * @param {Object} deledCB
 */
var getComment = function(commentInfo, deledCB) {
	var wd1 = events.showWaiting();
	postDataQZPro_getCommentById(commentInfo, wd1, function(data) {
		wd1.close();
		console.log("获取的评论数据：" + JSON.stringify(data))
		if(data.RspCode == 0) {
			if(!deledCB) {
				rechargeComment(data.RspData, commentInfo)
			} else {
				deledCB(0)
			}
		} else {
			deledCB(1);
		}
	})
}
/**
 * 重组数据
 * @param {Object} comData 评论信息
 * @param {Object} commentedInfo 上个界面传过来的评论信息
 */
var rechargeComment = function(comData, commentInfo) {
	var personalInfo = myStorage.getItem(storageKeyName.PERSONALINFO);
	comData.UserName = personalInfo.unick; //昵称
	comData.UserImg = personalInfo.uimg; //头像
	comData.TabId = commentInfo.commentId //评论id
	comData.Replys = []; //回复列表
	if(upperInfo) { //有上级评论
		comData.UpperId = upperInfo.UpperId ? upperInfo.UpperId : upperInfo.TabId;
		comData.ReplyId = upperInfo.UserId;
		comData.ReplyName = upperInfo.UserName;
	} else { //无上级评论
		comData.UpperId = 0;
	}
	var commentList, order;
	if(parentContainer) { //评论的上级评论container
		console.log('上级评论类名：' + parentContainer.className);
		if(parentContainer.querySelector(".mui-table-view")) {
			commentList = parentContainer.querySelector(".mui-table-view");
		} else { //无上级评论
			var list = document.createElement('ul');
			list.className = "mui-table-view inner-table-view";
			parentContainer.appendChild(list);
			commentList = list;
		}
		order = 0; //评论排序 0 ：顺序 1 倒序
	} else {
		commentList = document.querySelector(".mui-table-view");
		order = type - 1;
	}
	//插入评论
	insertComment(commentList, comData, order);
}
/**
 * 插入评论
 * @param {Object} commentList 要加载评论界面的父界面
 * @param {Object} commentData 评论信息
 * @param {Object} order 顺序 0 倒序 1
 */
var insertComment = function(commentList, commentData, order) {
	var index;
	if(parentContainer) {
		var commentInfo = parentContainer.querySelector(".comment-words").commentInfo;
		console.log("获取的品论信息：" + JSON.stringify(commentInfo));
		index = commentInfo.Replys.length;
		createCell(commentList, commentData, index, order);
	} else {
		if(type == 2) { //倒序
			index = 0
			changeOrder();
			createCell(commentList, commentData, index, order);
			console.log("answerData的长度：" + answerData.Data.length);
			if(answerData.Data.length > 0 && answerData.Data.length % 10 == 0) {
				console.log("####################################################")
				document.getElementById("list-container").removeChild(document.getElementById("list-container").lastElementChild);
			}
		} else { //顺序；
			index = answerData.Data.length;
			if(index % 10 > 0) {
				createCell(commentList, commentData, index, order);
			}
		}
	}
	//将数据加载到本页面数据
	insertCommentData(commentData);
	console.log("获取的上级评论信息：" + JSON.stringify(commentInfo));
}
/**
 * 插入新数据后更改数据
 */
var changeOrder = function() {
	[].forEach.call(document.querySelectorAll('.icon-support'), function(item) {
		console.log("当前顺序：" + item.order);
		if(item.order || item.order == 0) {
			var order = item.order;
			if(typeof(order) == "string") {
				var orders = order.split("-");
				item.order = parseInt(orders[0]) + 1 + '-' + orders[1];
			} else {
				item.order += 1;
			}
		}
	})
}
/**
 * 加载评论数据
 * @param {Object} commentData
 */
var insertCommentData = function(commentData) {
	if(parentContainer) {
		var index = parseInt(parentContainer.querySelector(".icon-support").order);
		answerData.Data[index].Replys.push(commentData)
	} else {
		answerData.CommentNum += 1;
		document.getElementById("comments-no").innerText = "评论(" + answerData.CommentNum + ")";
		//倒序
		if(type == 2) {
			answerData.Data.splice(0, 0, commentData);
			if(answerData.Data.length > 0 && answerData.Data.length % 10 == 0) {
				answerData.Data.splice(answerData.Data.length - 1, 1);
			}
		} else { //顺序
			if(!(answerData.Data.length > 0 && answerData.Data % 10 == 0)) {
				answerData.Data.push(commentData);
			}
		}
	}
	console.log("改变后的数据：" + JSON.stringify(answerData))
}
/**
 * 2倒序 1顺序
 */
var setTolerantChecked = function(orderType) {
	if(orderType == 1) {
		document.getElementById("sequence-order").className = "mui-table-view-cell mui-selected"
		document.getElementById('reverse-order').className = "mui-table-view-cell";
		document.getElementById("order-selector").innerHTML = '顺序排列<span class="mui-icon mui-icon-arrowdown"></span>';
	} else {
		document.getElementById("sequence-order").className = "mui-table-view-cell"
		document.getElementById('reverse-order').className = "mui-table-view-cell mui-selected";
		document.getElementById("order-selector").innerHTML = '倒序排列<span class="mui-icon mui-icon-arrowdown"></span>';
	}
}
//8.获取某个回答的详情
function requestAnswerDetail(answerId, pageIndex, pageSize, callback) {
	//所需参数
	var comData = {
		userId: selfId,
		answerId: answerId, //回答ID
		orderType: type, //评论排序方式,1 时间正序排序,2 时间倒序排序
		pageIndex: pageIndex, //当前页数
		pageSize: pageSize //每页记录数,传入0，获取总记录数
	};
	// 等待的对话框
	//	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//8.获取某个回答的详情
	postDataQZPro_getAnswerById(comData, wd, function(data) {
		//		wd.close();
		console.log('8.获取某个回答的详情:' + JSON.stringify(data));
		if(data.RspCode == 0 && data.RspData.AnswerId) {
			var datasource = data.RspData;
			totalPageCount = Math.ceil(datasource.TotalPage * (pageSize / 10));
			callback(datasource, pageIndex);
		} else {
			mui.toast(data.RspTxt);
			events.closeWaiting();
		}
	});
}
/**
 * 获取个人信息
 * @param {Object} datasource
 */
var getInfos = function(datasource, pageIndex) {
	var pInfos = [];
	pInfos.push(datasource.AnswerMan);
	for(var i in datasource.Data) {
		var theComment = datasource.Data[i];
		if(theComment.UserId) {
			pInfos.push(theComment.UserId);
		}
		if(theComment.ReplyId) {
			pInfos.push(theComment.ReplyId);
		}
		if(datasource.Data[i].Replys && datasource.Data[i].Replys.length > 0) {
			var replies = datasource.Data[i].Replys;
			for(var j in replies) {
				pInfos.push(replies[j].ReplyId);
				pInfos.push(replies[j].UserId);
			}
		}
	}
	pInfos = events.arraySingleItem(pInfos);
	requireInfos(datasource, pInfos, pageIndex);
}
/**
 * 
 * @param {Object} datasource
 * @param {Object} pInfos
 */
var requireInfos = function(datasource, pInfos, pageIndex) {

	//发送获取用户资料申请
	var tempData = {
		vvl: pInfos.toString(), //用户id，查询的值,p传个人ID,g传ID串
		vtp: 'g' //查询类型,p(个人)g(id串)
	}
	//21.通过用户ID获取用户资料
	postDataPro_PostUinf(tempData, wd, function(data) {
		console.log('获取的个人信息:' + JSON.stringify(data));
		if(data.RspCode == 0) {
			refreshUI(rechargeInfos(datasource, data.RspData, pageIndex));
		} else {
			events.closeWaiting()
		}
	})

}
/**
 * 重组数据
 * @param {Object} datasource
 * @param {Object} infos
 */
var rechargeInfos = function(datasource, infos, pageIndex) {
	for(var j in infos) {
		var info = infos[j];
		if(datasource.AnswerMan == info.utid) {
			jQuery.extend(datasource, info);
			break;
		}
	}
	for(var i in datasource.Data) {
		//		var theComment=datasource.Data[i];
		for(var j in infos) {
			var info = infos[j];
			if(datasource.Data[i].UserId == info.utid) {
				datasource.Data[i].UserName = info.unick;
				datasource.Data[i].UserImg = updateHeadImg(info.uimg, 2);
			}
			if(datasource.Data[i].ReplyId == info.utid) {
				datasource.Data[i].ReplyName = info.unick;
				datasource.Data[i].ReplyImg = updateHeadImg(info.uimg, 2);
			}
			if(datasource.Data[i].Replys && datasource.Data[i].Replys.length > 0) {
				for(var m in datasource.Data[i].Replys) {
					if(datasource.Data[i].Replys[m].UserId == info.utid) {
						datasource.Data[i].Replys[m].UserName = info.unick;
						datasource.Data[i].Replys[m].UserImg = updateHeadImg(info.uimg, 2)
					}
					if(datasource.Data[i].Replys[m].ReplyId == info.utid) {
						datasource.Data[i].Replys[m].ReplyName = info.unick;
						datasource.Data[i].Replys[m].ReplyImg = updateHeadImg(info.uimg, 2);
					}
				}
			}
		}
	}
	if(pageIndex == 1) {
		answerData = datasource;
	} else {
		answerData.Data = answerData.Data.concat(datasource.Data);
	}
	return datasource;
}

//22.获取是否已对某个用户关注
function getUserFocus(userId) {
	var personalUTID = window.myStorage.getItem(window.storageKeyName.PERSONALINFO).utid; //当前登录账号utid
	//需要加密的数据
	var comData = {
		userId: personalUTID, //用户ID
		focusUserId: userId //关注用户ID
	};
	// 等待的对话框
	var wd = events.showWaiting();
	//22.获取是否已对某个用户关注
	postDataQZPro_getUserFocusByUser(comData, wd, function(data) {
		wd.close();
		console.log('22.获取是否已对某个用户关注:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
		if(data.RspCode == 0) {
			var btn_focus = document.getElementById('btn-focus')
			//修改界面显示
			if(data.RspData.Result) {
				btn_focus.innerText = '已关注';
				btn_focus.isLike = 1;
				btn_focus.className = "mui-btn mui-pull-right btn-attentioned";
			} else {
				btn_focus.innerText = '关注';
				btn_focus.isLike = 0;
				btn_focus.className = "mui-btn mui-pull-right btn-attention"
			}
		} else {
			mui.toast(data.RspTxt);
		}
	});
};

//23.设置对某个用户的关注
function setUserFocus(userId, item) {
	var personalUTID = window.myStorage.getItem(window.storageKeyName.PERSONALINFO).utid; //当前登录账号utid
	//需要加密的数据
	var comData = {
		userId: selfId, //用户ID
		focusUserId: userId, //关注用户ID
		status: item.isLike ? 0 : 1 //关注状态,0 不关注,1 关注
	};
	// 等待的对话框
	var wd = events.showWaiting();
	//23.设置对某个用户的关注
	postDataQZPro_setUserFocus(comData, wd, function(data) {
		wd.close();
		console.log('23.设置对某个用户的关注:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
		if(data.RspCode == 0) {
			//刷新界面显示
			if(item.isLike) {
				item.innerText = '关注';
				item.isLike = 0;
				item.className = "mui-btn mui-pull-right btn-attention"
			} else {
				item.innerText = '已关注';
				item.isLike = 1;
				item.className = "mui-btn mui-pull-right btn-attentioned"
			}
		} else {
			mui.toast(data.RspTxt);
		}
	});
};
/**
 * 刷新界面
 * @param {Object} datasource
 */
function refreshUI(datasource) {
	console.log('重组后的答案详情信息：' + JSON.stringify(datasource));
	if(pageIndex == 1) {
		setQuestion(datasource);
		setAnswerManInfo(datasource);
	}
	var ul = document.getElementById('list-container');
	createList(ul, datasource.Data);
	events.closeWaiting();
}
/**
 * 创建列表
 * @param {Object} ul
 * @param {Object} dataArray
 */
var createList = function(ul, dataArray) {
	console.log(JSON.stringify(dataArray))
	if(dataArray && dataArray.length > 0) {
		for(var i in dataArray) {
			createCell(ul, dataArray[i], i);
		}
	}
}
/**
 * 创建子cell
 * @param {Object} ul  列表
 * @param {Object} cellData 单个cell数据
 * @param {Object} i 位置
 * @param {Object} order 顺序
 */
var createCell = function(ul, cellData, i, order) {
	var li = document.createElement('li');
	li.className = 'mui-table-view-cell';
	li.innerHTML = createCommentsInner(cellData);
	if(order && ul.firstElementChild) {
		ul.insertBefore(li, ul.firstElementChild);
	} else {
		ul.appendChild(li);
	}
	var comment_container = li.querySelector('.comment-words');
	comment_container.commentInfo = cellData;
	var comments_zan = li.querySelector('.icon-support');
	li.querySelector('.head-img').info = cellData;
	comments_zan.isLike = cellData.IsLiked;
	comments_zan.commentId = cellData.TabId;
	if(cellData.IsLiked) {
		comments_zan.className = "mui-icon iconfont icon-support isLike"
	} else {
		comments_zan.className = "mui-icon iconfont icon-support isNotLike"
	}
	var repliesContainer = comments_zan.parentElement.parentElement.parentElement.parentElement.parentElement;
	console.log('className:' + repliesContainer.className)
	if(flag) {
		console.log("repliesContainer的className:" + repliesContainer.className)
		if(repliesContainer.className == ("mui-table-view inner-table-view")) {
			comments_zan.order = repliesContainer.parentElement.querySelector('.icon-support').order + "-" + i;
		} else {
			comments_zan.order = (parseInt(pageIndex) - 1) * 10 + parseInt(i);
		}
	} else {
		if(repliesContainer.className == ("mui-table-view inner-table-view")) {
			comments_zan.order = repliesContainer.parentElement.querySelector('.icon-support').order + '-' + i;
		} else {
			comments_zan.order = parseInt(i);
		}

	}
	if(cellData.Replys && cellData.Replys.length > 0) {
		var sul = document.createElement('ul');
		sul.className = "mui-table-view inner-table-view";
		li.appendChild(sul)
		createList(sul, cellData.Replys)
	}
}
/**
 * 设置问题内容
 * @param {Object} datasource
 */
var setQuestion = function(datasource) {
	document.querySelector('.question-title').innerText = datasource.AskTitle;
	var questionContainer = document.getElementById('question-content');
	events.clearChild(questionContainer);
	var p = document.createElement('p');
	p.innerHTML = datasource.AnswerContent;
	questionContainer.appendChild(p);
	//	p.querySelectorAll("img").for
	jQuery("#question-content img").each(function(index, ele) {
		this.style.width = "100%";
		this.style.height = "auto";
	})
	events.clearChild(document.getElementById('answer-imgs'));
	if(datasource.AnswerEncAddr) {
		document.getElementById('answer-imgs').innerHTML = getPicInner(datasource);
	}
	document.getElementById('comments-no').innerText = "评论(" + datasource.CommentNum + ")";
	var zan_icon = document.getElementById('answer-zan');
	zan_icon.isLike = datasource.IsLiked;
	if(datasource.IsLiked) {
		zan_icon.className = "mui-icon iconfont icon-support isLike";
	} else {
		zan_icon.className = "mui-icon iconfont icon-support isNotLike";
	}
}
/**
 * 无数据
 */
var setOriginalCondition = function() {
	document.getElementById('anthor-portrait').src = "../../image/utils/default_personalimage.png";
	document.getElementById("anthor-name").innerText = "";
	document.getElementById("anthor-info").style.display = "none"
	document.getElementById('btn-focus').style.display = 'none';
	document.getElementById('btn-focus').style.display = "inline-block";
	document.getElementById('answer-time').innerText = '';
	document.querySelector('.question-title').innerText = '';
	events.clearChild(document.getElementById('answer-imgs'));
	var questionContainer = document.getElementById('question-content');
	events.clearChild(questionContainer);
	document.getElementById('comments-no').innerText = '';
}
/**
 * 设置回答人信息
 * @param {Object} datasource
 */
var setAnswerManInfo = function(datasource) {
	document.getElementById('anthor-container').style.top = document.getElementById('question-container').offsetHeight - 30 + 'px';
	if(datasource.IsAnonym) {
		document.getElementById('anthor-portrait').src = "../../image/utils/default_personalimage.png";
		document.getElementById("anthor-name").innerText = "匿名用户";
		document.getElementById("anthor-info").style.display = "none"
		document.getElementById('btn-focus').style.display = 'none';
	} else {
		document.getElementById('anthor-portrait').src = updateHeadImg(datasource.uimg, 2);
		document.getElementById("anthor-name").innerText = events.shortForString(datasource.unick.replace(/[\r\n]/g, ""), 10);
		document.getElementById("anthor-info").style.display = "inline-block"
		document.getElementById("anthor-info").innerText = events.shortForString(datasource.AnswerManNote ? datasource.AnswerManNote : "暂无简介", 12);
		if(datasource.AnswerMan == selfId) { //如果专家是自己，隐藏关注按钮
			document.getElementById('btn-focus').style.display = "none";
		} else { //不是自己，显示关注按钮
			document.getElementById('btn-focus').style.display = "inline-block";
			getUserFocus(datasource.AnswerMan);
		}
	}
	document.getElementById('answer-time').innerText = replaceBigNo(datasource.IsLikeNum) + "赞·" + events.shortForDate(datasource.AnswerTime);
}
/**
 * 根据图片数量，设置不同宽高的图片尺寸
 * @param {Object} picAddr
 */
var getPicInner = function(data) {
	var picAddr = data.AnswerThumbnail;
	if(picAddr && picAddr.length > 0) {
		var picPaths = picAddr.split('|');
		var picBigPaths = data.AnswerEncAddr.split('|');
		var picInner = '';
		var win_width = document.getElementById('answer-imgs').offsetWidth;
		var pic_width = win_width / 3;
		//		if(picPaths.length < 3) {
		//			pic_width = win_width / picPaths.length;
		//		}
		console.log("图片宽度设置：" + pic_width)
		for(var i in picPaths) {
			picInner += '<img class="answer-img" retry="0" src="' + picPaths[i] + '" class="answer-img" style="width:' + pic_width + 'px;height: ' + pic_width + 'px;" ' +
				'" data-preview-src="' + picBigPaths[i] + '" data-preview-group="' + data.AnswerId + '"/>';
		}
		console.log('图片路径：' + picInner);
		return picInner;
	}
	return ''
}
/**
 * 
 * @param {Object} cell
 * TabId	评论ID	int		否	从属Comments
 * UserId	评论用户ID	int		否	从属Comments
 * ReplyId	回复用户ID	int		否	从属Comments
 * CommentContent	评论或回复内容	String		否	从属Comments
 * CommentDate	评论或回复时间	String		否	从属Comments
 * UpperId	上级ID	int		否	从属Comments
 * Replys	下级回复列表	Array		否	从属Comments
 */
var createCommentsInner = function(cell) {
	console.log("要放置的数据：" + JSON.stringify(cell))
	var headImg = cell.UserImg;
	var personName = cell.UserName;
	var inner = '<div class="table-view-cell"><div class="comments-cell">' +
		'<div class="img-container"><img class="head-img" src="' + headImg + '"/></div>' +
		'<div class="comment-container">' +
		'<h5 class="comment-personName single-line">' + setName(cell) + '</h5>' +
		'</div><div class="support-container"> <a class="mui-icon iconfont icon-support ">' + replaceBigNo(cell.LikeNum) + '</a></div></div>' +
		'<div class="comments-content"><p class="comment-words">' + cell.CommentContent + '</p><p class="comment-date">' + events.shortForDate(cell.CommentDate) + '</p></div></div>';
	console.log("当前评论内容：" + inner)
	return inner;
}
var setName = function(cell) {
	if(cell.ReplyId) {
		return cell.UserName + '回复' + cell.ReplyName;
	}
	return cell.UserName;
}

/**
 * 设置监听
 */
var setListeners = function() {
	//	plus.webview.currentWebview().opener().querySelector(".icon-moreandroid").addEventListener("tap", function() {
	//
	//	});
	//评论的点赞按钮点击事件
	mui(".mui-table-view").on('tap', '.support-container', function() {
		setIsLikeComment(this.querySelector('.icon-support'));
	})
	//回答的点赞按钮的点赞事件
	events.addTap('support-answer', function() {
		setIsLikeAnswer(this.querySelector('.icon-support'));
	})
	//按钮点击事件关注事件
	events.addTap('btn-focus', function() {
		setUserFocus(answerData.AnswerMan, this)
	})
	events.addTap('answer-comment', function() {
		events.fireToPageWithData('qiuzhi-addAnswer.html', 'add-comment', answerData);
		upperInfo = null;
		parentContainer = null;
	})
	events.addTap('anthor-portrait', function() {
		if(!answerData.IsAnonym) {
			events.openNewWindowWithData("expert-detail.html", jQuery.extend(answerData, {
				UserId: answerData.utid,
				uimg: answerData.UserImg,
				unick: answerData.UserName
			}))
		}
	})
	//评论头像点击事件
	mui('.mui-table-view').on('tap', '.head-img', function() {
		var info = this.info;
		console.log(JSON.stringify(info));
		events.openNewWindowWithData("expert-detail.html", jQuery.extend(info, {
			UserId: info.utid,
			uimg: info.UserImg,
			unick: info.UserName
		}))
	})
	//评论信息
	mui('.mui-table-view').on('tap', ".comment-words", function() {
		console.log("评论信息：" + JSON.stringify(this.commentInfo));
		var item = this;
		upperInfo = this.commentInfo;
		var comdata = {
			userId: myStorage.getItem(storageKeyName.PERSONALINFO).utid, //	用户ID
			answerId: answerInfo.AnswerId, //回答ID
			commentId: upperInfo.TabId //评论ID
		}
		getComment(comdata, function(isDel) {
			if(isDel) {
				mui.toast("评论已删除！");
			} else {
				if(upperInfo.UpperId) {
					parentContainer = item.parentElement.parentElement.parentElement.parentElement.parentElement;
				} else {
					parentContainer = item.parentElement.parentElement.parentElement;
				}
				if(upperInfo.UserId == myStorage.getItem(storageKeyName.PERSONALINFO).utid) {
					//					delCommentContainer = item.parentElement.parentElement.parentElement;
					//					var btnArray = [{
					//						title: "更改评论"
					//					}, {
					//						title: "删除评论",
					//						dia: 1 //是否显示dialogh
					//					}];
					//					var cbArray = [changeComment,
					//						delComment
					//					];
					//					events.showActionSheet(btnArray, cbArray);
				} else {
					delCommentContainer = null;
					events.fireToPageWithData('qiuzhi-addAnswer.html', 'comment-reply', jQuery.extend(item.commentInfo, {
						AnswerId: answerData.AnswerId
					}));
				}
			}
		})

	})
	mui('.mui-table-view').on('longtap', ".comment-words", function() {
		console.log("评论信息：" + JSON.stringify(this.commentInfo));
		var item = this;
		upperInfo = this.commentInfo;
		var comdata = {
			userId: myStorage.getItem(storageKeyName.PERSONALINFO).utid, //	用户ID
			answerId: answerInfo.AnswerId, //回答ID
			commentId: upperInfo.TabId //评论ID
		}
		getComment(comdata, function(isDel) {
			if(isDel) {
				mui.toast("评论已删除！");
			} else {
				if(upperInfo.UpperId) {
					parentContainer = item.parentElement.parentElement.parentElement.parentElement.parentElement;
				} else {
					parentContainer = item.parentElement.parentElement.parentElement;
				}
				if(upperInfo.UserId == myStorage.getItem(storageKeyName.PERSONALINFO).utid) {
					delCommentContainer = item.parentElement.parentElement.parentElement;
					var btnArray = [{
						title: "更改评论"
					}, {
						title: "删除评论",
						dia: 1 //是否显示dialogh
					}];
					var cbArray = [changeComment,
						delComment
					];
					events.showActionSheet(btnArray, cbArray);
				} else {
					delCommentContainer = null;
					//					events.fireToPageWithData('qiuzhi-addAnswer.html', 'comment-reply', jQuery.extend(item.commentInfo, {
					//						AnswerId: answerData.AnswerId
					//					}));
				}
			}
		})

	});
	//设置选择监听
	document.querySelector('.mui-table-view.mui-table-view-radio').addEventListener('selected', function(e) {
		console.log("当前选中的为：" + JSON.stringify(e.detail.el.value));
		type = parseInt(e.detail.el.value);
		setTolerantChecked(type);
		flag = 0;
		mui('#popover').popover('hide');
		answerData.Data.reverse();
		document.getElementById('list-container').innerHTML = "";
		refreshUI(answerData);
	});
	//	document.getElementById('order-selector').onchange = function() {
	//		type = parseInt(this.options[this.options.selectedIndex].value);
	//		flag = 0;
	//		console.log('获取的类型：' + type);
	//		answerData.Data.reverse();
	//		events.clearChild(document.getElementById('list-container'));
	//		refreshUI(answerData);
	//	}
	mui("#answer-imgs").on("error", ".answer-img", function() {
		var retry = parseInt(this.getAttribute("retry"));
		if(retry == 0) {
			++retry;
			this.attr("retry", retry);
			this.attr('src', this.attr('src'));
		} else {
			this.attr("src", "../../image/utils/load-img-error.png");
		}
	})
}
/**
 * 设置是否点赞
 * @param {Object} 点赞的item
 */
var setIsLikeAnswer = function(item) {
	var wd = events.showWaiting();
	postDataQZPro_setAnswerLike({
		answerId: answerData.AnswerId, //回答ID
		userId: selfId, //点赞用户ID
		status: item.isLike ? 0 : 1 //点赞状态,0 取消点赞,1 点赞
	}, wd, function(data) {
		wd.close();
		console.log('答案点赞取消点赞结果：' + JSON.stringify(data));
		if(data.RspCode == 0) {
			setZanIconCondition(item);
		} else {
			mui.toast(data.RspTxt);
		}
	})
}
/**
 * 对评论设置点赞状态
 * @param {Object} 点赞的item
 */
var setIsLikeComment = function(item) {
	var wd = events.showWaiting();
	postDataQZPro_setCommentLike({
		commentId: item.commentId, //评论ID
		userId: selfId, //点赞用户ID
		answerId: answerData.AnswerId, //回答ID
		status: item.isLike ? 0 : 1 //点赞状态，0 取消点赞，1 点赞
	}, wd, function(data) {
		wd.close();
		console.log("评论点赞取消点赞结果：" + JSON.stringify(data));
		if(data.RspCode == 0) {
			setZanIconCondition(item);
		} else {
			mui.toast(data.RspTxt);
		}
	})
}
/**
 * 设置点赞的图标样式
 * @param {Object} item
 */
var setZanIconCondition = function(item) {
	console.log("显示是否为数字：" + typeof(item.order));
	if(item.isLike) {
		item.className = "mui-icon iconfont icon-support isNotLike ";
		item.isLike = 0;
		console.log('顺序：' + JSON.stringify(item.order))
		if(item.order || item.order == 0) {
			if(typeof(item.order) == "string") {
				answerData.Data[parseInt(item.order.split('-')[0])].Replys[parseInt(item.order.split('-')[1])].IsLiked = 0;
				answerData.Data[parseInt(item.order.split('-')[0])].Replys[parseInt(item.order.split('-')[1])].LikeNum -= 1;
				item.innerText = replaceBigNo(answerData.Data[parseInt(item.order.split('-')[0])].Replys[parseInt(item.order.split('-')[1])].LikeNum);
			} else {
				console.log("点赞的数据：" + answerData.Data[item.order])
				answerData.Data[item.order].IsLiked = 0;
				answerData.Data[item.order].LikeNum -= 1;
				item.innerText = replaceBigNo(answerData.Data[item.order].LikeNum);
			}
		} else {
			answerData.IsLiked = 0;
			answerData.IsLikeNum -= 1;
			document.getElementById('answer-time').innerText = replaceBigNo(answerData.IsLikeNum) + "赞·" + events.shortForDate(answerData.AnswerTime);
		}

	} else {
		item.className = "mui-icon iconfont icon-support isLike";
		item.isLike = 1;
		console.log('顺序：' + JSON.stringify(item.order))
		if(item.order || item.order == 0) {
			if(typeof(item.order) == "string") {
				answerData.Data[parseInt(item.order.split('-')[0])].Replys[parseInt(item.order.split('-')[1])].IsLiked = 1;
				answerData.Data[parseInt(item.order.split('-')[0])].Replys[parseInt(item.order.split('-')[1])].LikeNum += 1;
				item.innerText = replaceBigNo(answerData.Data[parseInt(item.order.split('-')[0])].Replys[parseInt(item.order.split('-')[1])].LikeNum);
			} else {
				console.log("点赞的数据：" + JSON.stringify(answerData.Data[item.order]))
				answerData.Data[item.order].IsLiked = 1;
				answerData.Data[item.order].LikeNum += 1;
				item.innerText = replaceBigNo(answerData.Data[item.order].LikeNum);
			}
		} else {
			answerData.IsLiked = 1;
			answerData.IsLikeNum += 1;
			document.getElementById('answer-time').innerText = replaceBigNo(answerData.IsLikeNum) + "赞·" + events.shortForDate(answerData.AnswerTime);
		}
	}
}
/**
 * 
 * @param {Object} no 点赞数量 如果大于100放置99+
 */
var replaceBigNo = function(no) {
	if(no > 99) {
		return '99+'
	}
	return no;
}
var showActionSheet = function(btnArray, callback) {
	plus.nativeUI.actionSheet({
		cancel: "取消",
		buttons: btnArray
	}, function(e) {
		var index = e.index;
		switch(index) {
			case 0:
				text += "取消";
				break;
			case 1:

				break;
			case 2:
				events.setDialog("删除动态", "确认删除？", callback, "取消删除")
				break;
			default:
				break;
		}
	});
}