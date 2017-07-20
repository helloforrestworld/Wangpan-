

//-------------主要公用变量获取--------

var leftList = document.querySelector('.left_list');
var listBox = leftList.querySelector('.list');


var navBox = document.querySelector('.nav');
var btns = document.querySelectorAll('.btn button');

var listShow = document.querySelector('.listShow'); //点击移动到 弹出的操作框
var listShowBox = listShow.querySelector('.listShowBox'); //移动目标显示框


var main = document.querySelector('.main');
var fileBox = document.querySelector('.file-container');
var fileitems = fileBox.children;

var fileWrap = document.querySelector('.file-box');

var isRec = fileBox.classList.contains('rec');  //如果是回收站页面 调用另外一套数据
var data = getData()||user_data;

var arrCheck=[];//粘贴板

var nowId=isRec?8:0; //当前显示目录的id  默认是回收站或者云盘根目录  

//---------------------------------------

//初始化
load(nowId);
loadlist();


//左侧目录加载
function loadlist(){
	var dataRoot = isRec?8:0;
	listBox.innerHTML =creatList(data[dataRoot]);
}
//导航栏和文件夹加载
function load(currentId){
	var currentChild  = getChildrenById(data,nowId); //要渲染的子集
	var currentPar = getParentsById(data,nowId);// 当前目录 以及 所有父级
	//生成文件夹
	fileBox.innerHTML = creatFiles(currentChild,fileBox);
	//生成导航栏
	navBox.innerHTML = creatNavs(currentPar,isRec);
};

//---------------------文件事件------------------

(function(){
//图片类型显示
var imgBox = document.querySelector('.imgShowBox');
var imgShow = document.querySelector('.imgShow');
var imgShut = document.querySelector('.btnimg');

//选择文件   、//打开图片、//进入文件夹
fileBox.addEventListener('click',pickone);
window.addEventListener('keydown',function(e){
	var code = e.keyCode;
	if(code===17){
		fileBox.removeEventListener('click',pickone);
		fileBox.addEventListener('click',picks);
	}
	window.addEventListener('keyup',function(e){
		fileBox.removeEventListener('click',picks);
		fileBox.addEventListener('click',pickone);
	})
})

function pickone(e){ 
	pick(e,'pickone');
}
function picks(e){
	pick(e);
}
function pick(e,pickType){
	var target =e.target;
	var parent  = getParentCls(target,'fileitem'); //文件夹内才有效
	if(!parent)return;
	var currentId = parent.dataset.index*1;
	var current = data[currentId];
	
	if(target.nodeName === 'SPAN'){
		rename.onclick();
		return;
	}
	if(target.nodeName === 'INPUT'){
		return;
	}
	
	if(pickType) allSelect(false,current);//取消所有 选中当前
	
	current.checked = parent.classList.toggle('active')?true:false;
}

fileBox.addEventListener('dblclick',function(e){
	var target = e.target;
	var parent = getParentCls(target,'fileitem');
	e.preventDefault();
	if(parent&&target.nodeName!=='INPUT'&&target.nodeName!=='SPAN'){
		
		var currentId = parent.dataset.index*1;//通过图片或者是其他元素找到父级fileitem
		var current = getDataById(data,currentId);
		
		//进入文件夹啊
		if(!parent.classList.contains('img')){
			//数据的checked属性初始化;
			var currentChild  = getChildrenById(data,nowId); //找到它父级 循环children 数据里面的checked = false
			for(var i =0;i<currentChild.length;i++){
				currentChild[i].checked = false;
			};
			nowId=currentId; //能进入  将文件的id 赋值给 nowId
			load(nowId);
		};
		//打开图片
		if(parent.classList.contains('img')){
			imgBox.style.transform = 'scale(1)';
			imgShow.style.backgroundImage = `url(${current.src})`;
		}
		imgBox.addEventListener('mouseup',function(e){
			imgBox.style.transform = 'scale(0)';
		})
	};
},false);


//鼠标在文件右键打开菜单是选中状态  但不添加样式
fileBox.addEventListener('contextmenu',function(e){
	var target =e.target;
	
	if(!target.classList.contains('file-container')&&!target.classList.contains('check')){
		var parent = getParentCls(target,'fileitem');
		var currentId = parent.dataset.index*1;
		var current = getDataById(data,currentId);
		current.checked = true;
	}
})
})();
//------------------------------------------------------------



//--------------------目录事件--------------------------------------
listBox.addEventListener('click',function(e){
	
	var target = e.target;
	
	if(target.className!=='list'){
		var parent =  getParentCls(target,'list-tile');
		var currentId = parent.dataset.index*1;
		//数据的checked属性初始化;
		
		var currentChild  = getChildrenById(data,nowId); //找到它父级 循环children 数据里面的checked = false
		for(var i =0;i<currentChild.length;i++){
			currentChild[i].checked = false;
		};
		
		if(parent.nextElementSibling){
			nowId = currentId;
			parent.firstElementChild.classList.toggle('active');
			parent.nextElementSibling.classList.toggle('active');
			load(nowId);
		};
		//如果点的是图片 则显示图片所在目录
		if(target.classList.contains('img')){
			 nowId =  data[currentId].pId;
			 load(nowId);
		}
	};
},false);


//--------------------导航事件----------------------------

navBox.addEventListener('click',function(e){
	var target = e.target;
	if(target.nodeName==='A'){
		//数据的checked属性初始化;
		var currentChild  = getChildrenById(data,nowId); //找到它父级 循环children 数据里面的checked = false
		for(var i =0;i<currentChild.length;i++){
			currentChild[i].checked = false;
		};
		var currentId =  target.className === 'back'? getDataById(data,nowId).pId : target.dataset.index*1;//判断点的是返回上一级还是其他
		nowId = currentId;
		load(nowId);
	};
	
},false);
//------------------------------------------------------------


//主要功能的实现---------------------------------------------------

//上传
btns[0].onclick = function(){
	message('succ','功能还没开放');
}
//新建文件夹
var addFile = btns[1];

addFile.onclick = function(){
	
	allSelect(false); //取消其他选择
	fileBox.insertBefore(addFiles(fileBox),fileBox.firstElementChild);
	var Inp = fileBox.querySelector('.set-name');
	var current = getDataById(data,nowId); //当前显示的目录 数据
	var currentChild = getChildrenById(data,nowId);
	var parent = getParentCls(Inp,'fileitem');// 本文件
	
	Inp.focus();
	
	Inp.onblur = function(){
		if(Inp.style.display === 'none')return;
		renameFn(Inp,fileDataIn);
	}
	keyBlur(Inp);
	function fileDataIn(){
		var id = maxId(data);  //数据最大id+1
		parent.dataset.index = id;
		//添加数据
		var obj = {
			name:Inp.value,
			id:id, 
			pId:nowId,
			type:'folder',
			childrenId:[]
		};
		data[id] = obj;
		current.childrenId.unshift({'id':id});
		reload();
		Inp.removeEventListener('blur',rename);
	}
};

//删除文件夹
var delFile = btns[2];
delFile.onclick = function(){
	var nowChilds = getChildrenById(data,nowId);
	
	var nowChildId = data[nowId].childrenId;
	var len  = nowChilds.length;
	var hasFile = false;
	for( var i = 0;i<len;i++){
		 if(typeof nowChilds[i] === 'undefined')break;
		 if(nowChilds[i].checked){
		    hasFile = true;
		 	if(!isRec){
		 		myConfirm('你确定要放到回收站吗',yes);
		 		return;
		 	}
		    function yes(){  
		    	isMove(8,nowId,true);
			    message('succ','文件已删除');
			    return;
		    }
		    //如果在回收站删除 直接删除 不询问
		    del(nowChilds[i]);//删除 儿子儿子儿子...
			nowChildId.splice(i,1);
			nowChilds.splice(i,1);
			message('succ','文件已删除');
			i--;
		 };
	};
	if(hasFile){
		reload();//渲染
	}else{
		message('fail','没有可删除的文件');
	}
};

//重命名
var rename = btns[3];
rename.onclick = function(){
	var num = 0,node = null;
	var currentChild = getChildrenById(data,nowId);
	for(var i = 0; i<currentChild.length;i++){
		if(currentChild[i].checked){
			num++;
			node = fileitems[i];
		};
	}
	//选中一个的时候可以重命名
	if(num===1){
		var Inp = node.querySelector('.set-name');
		var title = node.querySelector('.title');
		var currentId = node.dataset.index*1;
		var current =data[currentId];
		
		Inp.value = title.innerHTML;
		Inp.style.display = 'block';
		title.style.display = 'none';
		
		Inp.focus();
		Inp.select();
		
		Inp.onblur = function(){
			//隐藏
			Inp.style.display = 'none';
			title.style.display = 'block';
			//取消选择0
			if(Inp.value.trim()!== title.innerHTML&&Inp.value.trim() !== ''){//有修改过且不为空
				if(nameExist(currentChild,Inp.value)){
					message('fail','名字已存在');
					return;
				};
				message('succ','修改成功');
				title.innerHTML = Inp.value;
				nameDataIn();
			};
		};
		
		function nameDataIn(){
			//修改数据层
			current.name = title.innerHTML;
			reload();
		}
		keyBlur(Inp);//键盘确定
	};
};


//全选
var selectAll = btns[4];

selectAll.onclick = function(){
	allSelect(true);
};

//-------取消选择---------------------
document.addEventListener('mousedown',function(e){
	var target = e.target ;
	if(target.classList.contains('file-container')){
		allSelect(false);
	}
});


//布局转换
var changeStyle  = btns[5];
changeStyle.onclick = function(e){
	fileBox.classList.toggle('colum');
	changeStyle.classList.toggle('active');
	load(data,fileBox);
	allSelect(false);
};


//回收站的清空功能
var clearAll  = btns[6];  
if(clearAll){
	clearAll.onclick = function(e){
		del(data[8]);
		reload();
	}
}
//----------------------------------------------------------------


//----------------------------右键自定义菜单---------------------------
var isOpenMenu = false;

(function(){
	var menu;
	//菜单打开
	document.addEventListener('contextmenu',function(e){
		e.preventDefault();
	});
	fileWrap.addEventListener('contextmenu',function(e){
	//鼠标在空白处跳出菜单	
	if(e.target.classList.contains('file-container')){ 
		if(isRec)return; //在回收站不能新建
		menu =  creatMenu(data_menu,false);
		fileWrap.appendChild(menu);
		menuMove(e,menu);
	};
	//鼠标在文件夹范围内跳出菜单
	if(getParentCls(e.target,'fileitem')){
		menu =  creatMenu(data_menu,true);
		fileWrap.appendChild(menu);
		menuMove(e,menu);
	}
	
	// 菜单隐藏
	document.addEventListener('mouseup',function(e){
		if(isOpenMenu){
			fileWrap.removeChild(menu);
			isOpenMenu = false;
		}
	});
});
})()

function menuMove(e,menu){
	var l,t;
	if(isDraw) return;
	isOpenMenu = true;	
	var x = e.pageX-main.offsetLeft,y = e.pageY-fileWrap.offsetTop;
	if(fileBox.offsetWidth - x<= menu.offsetWidth){ //防止菜单超出
		l =  fileBox.offsetWidth-menu.offsetWidth;
	}else{
		l = x;
	};
	if(fileBox.offsetHeight - y <= menu.offsetHeight){//防止菜单超出
		t = fileBox.offsetHeight - menu.offsetHeight;
	}else{
		t = y;
	};
	
	menu.style.display = 'flex';
	menu.style.opacity = '1';
	menu.style.left = l+'px';
	menu.style.top  = t + 'px';
}



//----------移动到弹出框----------------
(function(){
var toId,prev;
var listShow = document.querySelector('.listShow'); //点击移动到 弹出的操作框
var moveSelect = listShow.querySelectorAll('.moveplace button'); // 选择移动类型的按钮
var listShowBox = listShow.querySelector('.listShowBox'); //文档板块
var rubblishBox = listShow.querySelector('.rubbishBox'); //回收站板块

//选择目标区域是文件夹还是回收站
moveSelect[0].onclick = function(){
	
	rubblishBox.style.display = 'none';
	listShowBox.style.display = 'block';
	
	for(var i = 0;i<moveSelect.length;i++){
		moveSelect[i].classList.remove('active');
	}
	this.classList.add('active');
	listShowBox.innerHTML = creatList(data[0]);
			
	listClick(listShowBox); //添加点击事件
	
};
moveSelect[1].onclick = function(){
	
	listShowBox.style.display = 'none';
	rubblishBox.style.display = 'block';
	
	for(var i = 0;i<moveSelect.length;i++){
		moveSelect[i].classList.remove('active');
	}
	this.classList.add('active');
	rubblishBox.innerHTML = creatList(data[8]);
	listClick(rubblishBox); //添加点击事件
};

//给弹出框添加事件
listShow.addEventListener('mouseup',function(e){
	var target = e.target;

	if(target.className === 'listBtnCancel'){//取消按钮
		listShow.classList.remove('active');
		//模糊
		filter(false);
		//取消选择
		allSelect(false);
		toId = undefined;
		prev = undefined;
	};
	if(target.nodeName === 'SPAN'){    // 选择要 操作 的位置
		
		toId = target.dataset.index*1;
		if(!prev)prev = target;
		prev.style.color = '';			
		target.style.color = 'orange';
		prev = target;
	};
	
	if(target.className === 'listBtnConfirm'){    //确认
		filter(false);
		listShow.classList.remove('active');
		if(typeof toId === 'undefined'){
			allSelect(false);
			return ;
		}
		isMove(toId,nowId);
		toId = undefined;
		prev = undefined;
	};
});

//点文档隐藏移动框
document.addEventListener('mousedown',function(e){
	var target = e.target;
	if(target.classList.contains('file-container')){
		listShow.classList.remove('active');
		filter(false);
	};
});
})(); //----------------移动功能结束


//鼠标画框
var isDraw;
(function (){
fileWrap.onmousedown =function(e){
	if(isOpenMenu)return;
	if(!e.target.classList.contains('file-container'))return;
	
	var startX = e.pageX-main.offsetLeft,startY = e.pageY-fileWrap.offsetTop;//鼠标点击时的坐标
	
	isDraw = false; 
	
	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.height = div.style.width = 0;
	div.style.top = '-9999px';
	div.style.left = '-9999px';
	div.style.border = '1px dotted black';
		
	fileWrap.appendChild(div);
		
	//默认行为清除
	div.addEventListener('mousemove',function(e){
		e.preventDefault();
	})
	
	fileWrap.onmousemove = function(e){
			
		isDraw = true;
			
		var currentX = e.pageX-main.offsetLeft,currentY = e.pageY-fileWrap.offsetTop;
		div.style.height =  Math.abs(currentY - startY) + 'px';
		div.style.width =  Math.abs(currentX - startX) + 'px';
		div.style.top =  Math.min(currentY,startY) + 'px';
		div.style.left =  Math.min(currentX,startX) + 'px';
			
		//碰撞检测
		for(var i = 0 ;i<fileitems.length;i++){
			(function(i){
				if(duang(fileitems[i],div)){//撞上了
					var target = fileitems[i];
					var currentId = target.dataset.index*1;
					var current = getDataById(data,currentId);
					target.classList.add('active');             //文件框样式
					current.checked = true; //找到当前的数据 添加checked
				};
			})(i);
		};
	};
		
	//鼠标上抬  画框移除
	document.onmouseup = function(e){
		fileWrap.onmousemove = null;
		if(isDraw){
			fileWrap.removeChild(div);
			isDraw =false;
		};
	};
};
})();

//-----------------左边菜单部分功能---------------------------------

(function(){
var leftBox = document.querySelector('.left');
var leftMenu = document.querySelector('.left_menu');
var leftList = document.querySelector('.left_list');
var leftScroll = document.querySelector('.left_scroll');

//页面左右拉动------------------------------------
leftScroll.onmousedown = function(e){
	document.onmousemove = function(e){
		e.preventDefault();
		var left = e.pageX;
		if(left>=400){
			left = 400;
		};
		if(left<=200){
			left = 200;
		};
		leftScroll.style.left = left + 'px';
		leftBox.style.width = left +'px';
	};
	
	document.addEventListener('mouseup',function(e){
		document.onmousemove = null;
	});
	
};
})();
//-----------头部的一些功能--------------------
(function(){
var rightMenu  = document.querySelector('.rightmenu');
var rightRow = document.querySelector('.row');
var shutBtn = document.querySelector('.shutico');
var searchBtn = document.querySelector('.searchbtn');
var searchText = document.querySelector('.searchtext');
var menuOpen = document.querySelector('.menu_use');

//弹出右侧菜单
menuOpen.onclick = function(){
	rightMenu.style.width = '240px';
	rightMenu.style.right = '0';
	rightMenu.style.opacity = '1';
	shutBtn.style.display = 'block';
	rightRow.style.right = '244px';
};
shutBtn.onclick = function(){
	rightMenu.style.width = '';
	rightMenu.style.opacity = '';
	rightMenu.style.right = '';
	shutBtn.style.display = '';
	rightRow.style.right = '';
};

searchText.addEventListener('change',function(e){
	//搜索功能
	var value = searchText.value;
	searchFile(value,nowId,fileBox);
	searchText.value = '';
});


//搜索功能和右侧菜单的收合

document.addEventListener('click',function(e){
	
	var target = e.target;
	if(!target.classList.contains('searchtext')){
		searchText.classList.remove('active');
	};
	if(target.className === 'searchbtn'){
		searchText.classList.add('active');
		searchText.focus();
		searchText.select();
	};
	
	if(target.className!=='menu_use'){
		rightMenu.style.width = '0px';
		rightMenu.style.opacity = '';
		shutBtn.style.display = 'none';
		rightRow.style.right = '0px';
	};
});

rightMenu.addEventListener('click',function(e){
	e.stopPropagation();
});
})();

	
//回收站切换
(function(){
	var disk = document.querySelector('.disk');
	var rubblish = document.querySelector('.rubbish');
	
	
	disk.onmousedown = function(e){
		if(!fileBox.classList.contains('rec'))return;
		window.location.href = 'index.html';
	}
	
	rubblish.onmousedown = function(e){
		if(fileBox.classList.contains('rec'))return;
		window.location.href = 'recycle.html';
	}
	
})()

//文件夹拖动
filePull();