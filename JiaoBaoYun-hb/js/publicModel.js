//此js用于保存网络请求后，返回的model


var publicModel = (function($, mod) {
	//握手后，返回公钥
	mod.model_ShakeHand = {
		Exponent:'',//公钥模式
		Modulus:''//公钥值
	};
	
	//注册后，或者登录后，返回用户的信息
	mod.model_personalInfo = {
		utid:'',//用户表ID
		uimg:'',//用户头像地址
		unick:'',//用户昵称
		usex:'',//用户性别
		utxt:'',//用户签名
		token:''//用户令牌
	};
	
	//9.获取用户群
	mod.model_groupList = {
		gid:'',//群ID
		gname:'',//群名
		gimg:'',//群头像,群头像的链接
		mstype:''//用户管理角色,0家长,1管理员,2老师,3学生
	}
	
	//11.通过用户账号和手机号搜索用户
	mod.model_userInfo = {
		utid:'',//用户表ID
		uid:'',//用户手机号
		uname:'',//用户名
		unick:'',//用户昵称
		usex:'',//性别
		utxt:'',//签名
		uimg:''//用户头像地址
	}
	
	//13.通过群ID获取群的正常用户
	mod.model_groupNormalUser = {
		gid:'',//群ID
		utid:'',//用户tid
		ugname:'',//用户在群昵称，用户在群里的备注名称
		ugnick:'',//用户昵称，用户资料昵称
		uimg:'',//用户头像，用户头像
		mstype:''//资料类型,0家长,1管理员,2老师,3学生
	}
	
	//16.通过群ID获取群对象资料
	mod.model_groupStus = {
		gid:'',//群ID
		stuid:'',//资料id
		stuname:'',//名称
		stuimg:'',//头像,头像地址
		mstype:''//资料类型,0家长,1管理员,2老师,3学生
	}
	
	//17.通过审批者ID获取相应的入群邀请或申请
	mod.model_groupRequestUser = {
		gutid:'',//邀请记录ID
		gname:'',//群名
		invname:'',//邀请人姓名
		mstype:'',//邀请成为类型，0家长,1管理员,2老师,3学生
		stuname:'',//关联学生姓名
		aptime:'',//申请时间
		appnote:''//申请备注
	}
	
	
	//家校圈
	//2.（点到记事）获取用户未读点到记事列表
	mod.model_homeSchoolList = {
		TotalPage:'',//总页数
		TotalCnt:'',//总记录数
		Data:[//列表数据
			
		]]
	}
	
	//家校圈用户记事信息
	mod.model_userNoteInfo = {
		//共用
		TabId:'',//记事ID
		PublisherId:'',//发布者ID
		PublishDate:'',//发布时间
		MsgContent:'',//记事内容
		NoteType:'',//点到记事类型
		CheckType:'',//点到情况
		EncType:'',//附件类型
		EncAddr:'',//附件地址
		EncImgAddr:'',//附件缩略图
		
		//个人信息,2,4,7,
		StudentId:'',//学生ID
		
		//班级信息，14，16，19，
		ClassId:'',//班级ID
		
		//个人空间----26,28，37
		UserId:'',//用户ID
		EncIntro:''//附件简介
	}
	
	//用户空间，用户列表
	mod.model_userSpaceInfo = {
		TabId:'',//评论ID
		UserId:'',//评论用户ID
		UserSpaceId:'',//记事ID
		CommentContent:'',//评论或回复内容
		CommentDate:'',//评论或回复时间
		UpperId:'',//上级ID
		
		//31,49，
		ReplyId:'',//回复用户ID
		//51,
		MsgContent:'',//留言或回复内容
		
		MsgDate:''//留言或回复时间，49，
	}
	
	//56.（用户空间）获取与我相关
	mod.model_userSpaceAboutMe = {
		TabId:'',//留言ID
		UserId:'',//留言用户ID
		MsgType:'',//消息类型,1为其他用户评论2为评论的回复3为其他用户点赞4为其他用户留言5为留言的回复
		MsgDate:''//消息时间
	}

	return mod;

})(mui, publicModel || {});