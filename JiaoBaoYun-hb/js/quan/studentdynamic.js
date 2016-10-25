/**
 *	作者：444811716@qq.com
 *	时间：2016-10-24
 *	描述：学生动态
 */
var studentdynamic = (function($, mod) {
	/**
	 * 增加一项学生动态
	 * @param {Object} ulElement 父元素
	 * @param {Object} data 动态的数据数组[[date],content,imageUrl]日期数组，动态内容，动态图片
	 * @param {Object} id 动态的id
	 * data :动态的数据数组 [[date],content,imageUrl]
	 * [date]:日期数组,[day,month]，day：日，month：月。另：'今天'用[今天]
	 * content：动态内容
	 * imageUrl：动态图片
	 */
	mod.additem = function(ulElement, data, id) {
		var date = data[0]; //日期
		var content = data[1]; //内容
		var imageUrl = data[2]; //图片

		var html = '';
		var dateHtml = '';
		var imageHtml = '';
		var html1 = '<div class="mui-row">';
		var html2 = '<div class="mui-col-sm-2 mui-col-xs-2">';
		//日期
		if(typeof date == 'string') {
			dateHtml = '<div class="dynamic-date"><font style="font-size: 150%;">' + date + '</font></div></div>';
		} else {
			var dateHtml1 = '<div class="dynamic-date">';
			var dateHtml2 = '<font style="font-size: 150%;">' + date[0] + '</font><font style="font-size: 80%;">' + date[1] + '</font></div></div>';
			dateHtml = dateHtml1 + dateHtml2;
		}
		var html3 = '<div class="mui-col-sm-10 mui-col-xs-10"><div class="mui-media-body">';
		//图片
		if(imageUrl != undefined) {
			imageHtml = '<img class="mui-media-object mui-pull-left" src="' + imageUrl + '">';
		}
		//内容
		var html4 = '<div class="dynamic-ellipsis-2">' + content + '</div></div></div></div>';
		html = html1 + html2 + dateHtml + html3 + imageHtml + html4;

		var li = document.createElement('li');
		li.className = 'mui-table-view-cell';
		li.innerHTML = html;
		li.id = id;
		ulElement.appendChild(li);
	}
	return mod;
})(mui, window.studentdynamic || {})