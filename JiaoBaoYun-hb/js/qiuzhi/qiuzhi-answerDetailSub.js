var type = 2;
var pageIndex = 1;
var totalPageCount = 0;
var answerInfo; //回答详情
var answerData;
events.initRefresh('list-container', function() {
	requestAnswerDetail(answerInfo.AnswerId);
}, function() {
	mui('#refreshContainer').pullRefresh().endPullupToRefresh(pageIndex >= totalPageCount);
	if(pageIndex < totalPageCount) {
		pageIndex++;
		requestAnswerDetail(answerInfo.AnswerId);
	}
})
/**
 * 
 */
mui.plusReady(function() {
	window.addEventListener('answerInfo', function(e) {
		answerData={};
		pageIndex=1;
		totalPageCount=0
		answerInfo = e.detail.data;
		console.log('回答详情获取的答案信息:' + JSON.stringify(answerInfo));
		var answerId = answerInfo.AnswerId;
		events.clearChild(document.getElementById('list-container'));
		requestAnswerDetail(answerId);
	});
	//		mui('.mui-table-view').on('tap', '.mui-table-view-cell', function() {
	//			events.openNewWindowWithData('../qiuzhi/expert-detail.html','');
	//		})

	setListeners();

	//点击关注按钮
//	mui('.mui-table-view').on('tap', '#focusBtn', function() {
//		if(this.innerText == '关注') {
//			setUserFocus(answerInfo.AnswerMan, 1, this);
//		} else {
//			setUserFocus(answerInfo.AnswerMan, 0, this);
//		}
//	})
	//	events.addTap('focusBtn', function() {
	//		console.log('点击关注');
	//		if(this.innerText == '关注') {
	//			setUserFocus(answerInfo.AnswerMan, 1);
	//		} else {
	//			setUserFocus(answerInfo.AnswerMan, 0);
	//		}
	//	});
})
//8.获取某个回答的详情
function requestAnswerDetail(answerId) {
	//所需参数
	var comData = {
		answerId: answerId, //回答ID
		orderType: type, //评论排序方式,1 时间正序排序,2 时间倒序排序
		pageIndex: pageIndex, //当前页数
		pageSize: '10' //每页记录数,传入0，获取总记录数
	};
	// 等待的对话框
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	//8.获取某个回答的详情
	postDataQZPro_getAnswerById(comData, wd, function(data) {
		wd.close();
		console.log('8.获取某个回答的详情:' + JSON.stringify(data));
		if(data.RspCode == 0) {
			var datasource = data.RspData;
			totalPageCount = datasource.TotalPage;
			getInfos(datasource);
		} else {
			mui.toast(data.RspTxt);
		}
	});
}
/**
 * 获取个人信息
 * @param {Object} datasource
 */
var getInfos = function(datasource) {
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
	}
	pInfos = events.arraySingleItem(pInfos);
	requireInfos(datasource, pInfos);
}
/**
 * 
 * @param {Object} datasource
 * @param {Object} pInfos
 */
var requireInfos = function(datasource, pInfos) {

	//发送获取用户资料申请
	var tempData = {
		vvl: pInfos.toString(), //用户id，查询的值,p传个人ID,g传ID串
		vtp: 'g' //查询类型,p(个人)g(id串)
	}
	//21.通过用户ID获取用户资料
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	postDataPro_PostUinf(tempData, wd, function(data) {
		wd.close();
		console.log('获取的个人信息:' + JSON.stringify(data));
		if(data.RspCode == 0) {
			refreshUI(rechargeInfos(datasource, data.RspData));
		} else {

		}
	})

}
var rechargeInfos = function(datasource, infos) {
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
				datasource.Data[i].UserImg = info.uimg == null ? storageKeyName.DEFAULTPERSONALHEADIMAGE : info.uimg;
			}
			if(datasource.Data[i].ReplyId == info.utid) {
				datasource.Data[i].ReplyName = info.unick;
				datasource.Data[i].ReplyImg = info.uimg == null ? storageKeyName.DEFAULTPERSONALHEADIMAGE : info.uimg;
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
			//修改界面显示
			if(data.RspData.Result) {
				document.querySelector('#focusBtn').innerText = '已关注';
			} else {
				document.querySelector('#focusBtn').innerText = '关注';
			}
		} else {
			mui.toast(data.RspTxt);
		}
	});
};

//23.设置对某个用户的关注
function setUserFocus(userId, status, item) {
	var personalUTID = window.myStorage.getItem(window.storageKeyName.PERSONALINFO).utid; //当前登录账号utid
	//需要加密的数据
	var comData = {
		userId: personalUTID, //用户ID
		focusUserId: userId, //关注用户ID
		status: status //关注状态,0 不关注,1 关注
	};
	// 等待的对话框
	var wd = events.showWaiting();
	//23.设置对某个用户的关注
	postDataQZPro_setUserFocus(comData, wd, function(data) {
		wd.close();
		console.log('23.设置对某个用户的关注:' + data.RspCode + ',RspData:' + JSON.stringify(data.RspData) + ',RspTxt:' + data.RspTxt);
		if(data.RspCode == 0) {
			//刷新界面显示
			if(status) {
				item.innerText = '已关注';
				mui.toast('关注成功！')
			} else {
				item.innerText = '关注';
				mui.toast('取消关注成功！');
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
	for(var i in datasource.Data) {
		var li = document.createElement('li');
		li.className = 'mui-table-view-cell';
		li.innerHTML = createCommentsInner(datasource.Data[i]);
		ul.appendChild(li);
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
	events.clearChild(document.getElementById('img-container'));
	if(datasource.AnswerEncAddr) {
		document.getElementById('img-container').innerHTML = getPicInner(datasource.AnswerEncAddr);
	}
	document.getElementById('comments-no').innerText="评论("+datasource.CommentNum+")";
}
var setAnswerManInfo = function(datasource) {
	document.getElementById('anthor-container').style.top = document.getElementById('question-container').offsetHeight - 30 + 'px';
	document.getElementById('anthor-portrait').src = updateHeadImg(datasource.uimg, 2);
	document.getElementById("anthor-name").innerText = datasource.unick;
	document.getElementById("anthor-info").innerText = '专栏：' + answerInfo.AskChannel;
}
var getPicInner = function(picAddr) {
	var picPaths = picAddr.split('|');
	var picInner = '';
	var pic_width = "33.333333%";
	for(var i in picPaths) {
		if(picPaths.length < 3) {
			pic_width = 100 / picPaths.length + '%';
		}
		picInner += '<img src=' + picPaths[i] + 'style="width:' + pic_width + '" />'
	}
	return picInner;
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
	var headImg = cell.UserImg ? cell.UserImg : cell.ReplyImg;
	var personName = cell.UserName ? cell.UserName : cell.ReplyName;
	var inner = '<a><div class="img-container"><img class="head-img" src="' + headImg + '"/></div>' +
		'<div class="comment-container">' +
		'<h4 class="comment-personName">' + personName + '</h4>' +
		'<p class="comment-words">' + cell.CommentContent + '</p>' +
		'<p class="comment-date">' + events.shortForDate(cell.CommentDate) + '</p>' +
		'</div></a>'
	return inner;
}
/**
 * 增加评论
 * @param {Object} commentValue
 */
var addComment = function(commentValue) {
	var pId = myStorage.getItem(storageKeyName.PERSONALINFO).utid;
	var wd = plus.nativeUI.showWaiting(storageKeyName.WAITING);
	postDataQZPro_addAnswerComment({
		answerId: answerInfo.AnswerId, //回答ID
		upperId: 0, //上级评论ID,第一个评论传0，其他的传最上层的ID
		userId: pId, //评论用户ID,
		commentContent: commentValue, //评论内容
		replyId: 0 //回复用户ID,新增评论的话传0，回复评论传用户Id
	}, wd, function(data) {
		wd.close();
		console.log('评论结果:' + JSON.stringify(data))
		if(data.RspCode == 0) {
			if(data.RspData.Result) {
				document.getElementById('input-content').value = '';
				mui.toast('评论成功！')
			}
		} else {
			mui.toast('评论失败，请重新提交评论！');
		}
	})
}
/**
 * 设置监听
 */
var setListeners = function() {
//	events.addTap('send-comment', function() {
//		var value = document.querySelector('.input-text').value;
//		if(value) {
//			addComment(value);
//		} else {
//			mui.toast("请输入评论内容");
//		}
//	})
	//设置选择监听
	document.getElementById('order-selector').onchange=function(){
		type = parseInt(this.options[this.options.selectedIndex].value);
		console.log('获取的类型：'+type);
		answerData.Data.reverse();
		events.clearChild(document.getElementById('list-container'));
		refreshUI(answerData);
	}
}

