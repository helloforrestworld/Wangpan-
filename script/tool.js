
//-----------本地存储------------
function setData(){
	window.localStorage.setItem('data',JSON.stringify(data));
}
function getData(){
	return JSON.parse(window.localStorage.getItem('data')); 
}

//----------重新渲染-------
function reload(){
	load(nowId);
	loadlist();
	setData();//存储数据
}

//拿到 id 拿数据
function getDataById(data,id){
	return data[id];
}

//根据id 拿儿子
function getChildrenById(data,id){
	
	var children = [],ids = data[id].childrenId ,len = ids.length;
	for(var i= 0;i<len;i++){
		children.push(data[ids[i].id])
	}
	return children;
}

//根据id  拿自己以及所有父级
function getParentsById(data,id){
	
	var parents = [],current = data[id];
	if(current){
		parents.push(current);
		parents =  getParentsById(data,current.pId).concat(parents);
	}
	return parents;
}


//碰撞检测
function duang(current, target){
      var currentRect = current.getBoundingClientRect(),
          targetRect = target.getBoundingClientRect();
        
      // 拿到当前拖拽元素四个边距离文档左侧和上侧的绝对距离
      var currentL = currentRect.left,
          currentT = currentRect.top,
          currentR = currentRect.right,
          currentB = currentRect.bottom;
          
      var targetL = targetRect.left,
          targetT = targetRect.top,
          targetR = targetRect.right,
          targetB = targetRect.bottom; 
          
      return currentR >= targetL && currentB >= targetT && currentL <= targetR && currentT <= targetB;
}



//找到 指定 class 祖先
function getParentCls(ele,tarCls){
	var cls = ele.classList;
	if(typeof cls === 'undefined')return;
	
	if(cls.contains(tarCls)){
		return ele;
	};
	return getParentCls(ele.parentNode,tarCls);
}


//数据的最大id   (避免id重复)
function maxId(userData){
	return  ++userData.maxId;
}

//选中文件 
function fileCheck(target){
	var currentId = getParentCls(target,'fileitem').dataset.index*1;//通过图片或者是其他元素找到父级fileitem
	
	var current = getDataById(data,currentId); //找到当前的 添加checked
		
	target.classList.add('active');
	target.parentNode.classList.add('active');//边框  
	
	current.checked  = true;
}


//检测同名
function nameExist(data,value){
	for(var i= 0;i<data.length;i++){
		
		if(data[i].name === value){
			return true;
			break;
		}
	}
	return false;
}


//弹出消息框
function message(cls,value){
	var message = document.querySelector('.message');
	
	message.className = `message ${cls}`;
	message.style.top = '0px';
	message.style.height = '30px';
	message.innerHTML = value;
	
	setTimeout(function(){
		message.style.height = '0px';
		message.style.top = '-40px';
	},1000)
	
}

	//确定框
function myConfirm(value,yesEvent,noEvent){
	var box = document.querySelector('.confirm');
	var shutdown = box.querySelector('span');
	var Text = box.querySelector('.text');
	var check = box.querySelector('.checkbox');
	var btns = box.querySelectorAll('button');
	box.style.display = 'block';
	Text.innerHTML = value;
	filter(true);
	
	btns[0].onclick  = function(){
		if(typeof yesEvent === 'function') yesEvent();
		close();
	}
	btns[1].onclick = function(){
		
		if(typeof noEvent ==='function') noEvent();
		close();
	}
		
	shutdown.onclick = function(){
		close();
	}
	
	check.onclick =function(){
		check.classList.toggle('active');
	}
	function close(){
		filter(false);
		box.style.display = 'none';
	}
}


//删除 数据
function del(delData){
	var ids = delData.childrenId;
	if(delData.id!== 8){  // 8 是回收站
		delete data[delData.id];
	}else{
		delData.childrenId = [];
	}
	if(ids.length){
		for(var i= 0;i<ids.length;i++){
			del(data[ids[i].id]);
		}
	}
	
}


//移动功能函数
function isMove(toId,nowId,isdel){
	
	var childId = data[nowId].childrenId;
	var nowChilds =  getChildrenById(data,nowId);  //当前文件夹的儿子
	var tarChildId =  data[toId].childrenId;      
	var tarChilds =  getChildrenById(data,toId); // 目标文件夹的 儿子
	
	var tarParent  =getParentsById(data,toId);
	
	
	if(isdel){    //回收站可以重名
		moveFile();
		message('succ','删除成功');
		return;
	}
	
	
	if(data[toId].type === 'img'){//不能移动到图片里面
		message('fail','无效的移动');
		return;
	};
	
	if(toId===nowId){  				//不能移动到当前目录
		message('fail','不能移动到当前目录');
		return;
	};
	
	
	for(var i= 0;i<childId.length;i++){
		if(data[ childId[i].id ].checked){
			for(var k= 0 ;k<tarParent.length;k++){   //不能移动到自身子文件里面
				if(tarParent[k].id === data[ childId[i].id ].id){
					message('fail',`${data[ childId[i].id ].name}文件移动失败 `);
					data[ childId[i].id ].checked = false;
					return;
				};
			};
		};
	};
	
	var coverObj = [];     //存放需要判断覆盖的数据
	for(var i = 0;i<nowChilds.length;i++){
		if(!nowChilds[i].checked)continue;
		for(var j = 0;j<tarChilds.length;j++){
			if(tarChilds[j].name === nowChilds[i].name){
				coverObj.push({tar:tarChilds[j],move:nowChilds[i],
					tarIndex:j,moveIndex:i});
			};
		};
	};
	
	
	if(!coverObj.length){ //没有需要覆盖的
		moveFile();
		message('succ','文件成功移动');
	};
	
	
	if(coverObj.length){  //有需要覆盖的
		var coverBox = document.querySelector('.cover');
		var coverNum = document.querySelector('.coverNum');
		var coverList = document.querySelector('.flieCover');
		var btns = document.querySelectorAll('.fileCoverBtn button');
		btns[0].onclick = function(){           // 整个取消移动
			coverBox.classList.remove('active');
			message('succ','已取消移动');
		}
		btns[0].style.display = ''; 
		btns[1].onclick = function(){			//确定按钮
			coverBox.classList.remove('active');
			message('succ','移动完成');
			coverObj.forEach(function(item){    //如果有还没选择的操作   则自动 默认是 忽略 不移动该文件
				if(item.move.checked){
					item.move.checked = false;
					message('succ','没选择的文件已自动忽略');
				}	
			})
			moveFile();
		}
		
		coverNum.innerHTML = `你有${coverObj.length}个文件重名了.`;
		coverBox.classList.add('active');
		coverList.innerHTML = '';
		coverObj.forEach(function(item){     //生成文件选项
			var coverItem =  creatCover(coverObj,item,childId,tarChildId,'move');
			coverList.appendChild(coverItem);
		})
	};
	
	
	function moveFile(){
		var nowChilds =  getChildrenById(data,nowId);   //如果有覆盖的操作 实际数据已变化
		if(!nowChilds.length){  
			reload();
			return;
		};
		var childId = data[nowId].childrenId;
		var tarChildId =  data[toId].childrenId;
		for(var i = 0;i<nowChilds.length;i++){
			if(nowChilds[i].checked){
				addArrcopy(nowChilds[i])  //副本操作的一些规则
				delArrcopy(nowChilds[i])
				
				nowChilds[i].pId = toId; 
				nowChilds[i].checked = false;
				
				tarChildId.push({id:nowChilds[i].id});
				
				childId.splice(i,1);
				nowChilds.splice(i,1);
				i--;
			};
		};
		reload();
		allSelect(false); //取消选择
	};
};

//-----------创建覆盖弹窗列表(移动)--------------
function creatCover(coverArr,item,childId,tarChildId){
	var btns = document.querySelectorAll('.fileCoverBtn button');
	var li = document.createElement('li');
	var span = document.createElement('span');
	span.innerHTML =`文件:${ item.move.name}`;	
	var div = document.createElement('div');
	div.className = 'flieCover-btn';
	var btn1 = document.createElement('button');
	btn1.innerHTML = '覆盖';
	btn1.onclick = function(){
		btns[0].style.display = 'none'; //意味着不取消移动
		
		addArrcopy(item.move);         //对副本或副本主操作
		delArrcopy(item.move);
		//添加
		item.move.pId = item.tar.pId;
		data[item.tar.pId].childrenId.push({id:item.move.id});
		childId.splice(item.moveIndex,1);
		item.move.checked = false;
		moveIndex(coverArr,item.moveIndex);
		
		//删除
		del(item.tar);
		tarChildId.splice(item.tarIndex,1);
		tarIndex(coverArr,item.tarIndex);
		
		this.parentNode.parentNode.classList.add('active');
	}
	
	var btn2 = document.createElement('button');
	btn2.innerHTML = '新建副本';
	btn2.onclick = function(){
		btns[0].style.display = 'none'; //意味着不取消移动
		
		item.move.pId = item.tar.pId;
		item.move.checked = false;
		childId.splice(item.moveIndex,1);
		moveIndex(coverArr,item.moveIndex);
		data[item.tar.pId].childrenId.push({id:item.move.id});
		copyExist(item.move,item.tar);
		
		this.parentNode.parentNode.classList.add('active');
		
	}
	var btn3 = document.createElement('button');
	btn3.innerHTML = '忽略';
	btn3.onclick = function(){
		btns[0].style.display = 'none'; //意味着不取消移动
		
		item.move.checked = false;
		this.parentNode.parentNode.classList.add('active');
	}
	div.appendChild(btn1);
	div.appendChild(btn2);
	div.appendChild(btn3);
	
	li.appendChild(span);
	li.appendChild(div);
	
	return li;
}

//重置childrenId 的索引
function moveIndex(coverArr,nowIndex){       //移动一个后 他后面的 index 减一
	coverArr.forEach(function(item){
		item.index>nowIndex? --item.moveIndex:item.moveIndex;
	})
}
function tarIndex(coverArr,nowIndex){
	coverArr.forEach(function(item){
		   item.index>nowIndex? --item.tarIndex:item.tarIndex;
	})
}

//目标对象复制()并添加
function deepCopy(target,toId){
	var arr = [];
	var id;
 	doCopy(target,toId);
	function doCopy(target,toId){
		var newObj = {};
		id = maxId(data);
		for (var i in target){
			newObj[i] = target[i];
			if(i === 'id'){     //switch
				newObj[i] = id;
			}
			if(i ==='pId'){
				newObj[i] = toId;
			}
			//副本信息清空!!
			if(i==='copy'){
				newObj[i] = 0;
			}
			if(i==='coverId'){
				newObj[i] = undefined;
			}
			if(i==='showcopy'){
				newObj[i] = undefined;
			}
			if(i==='arrCopy'){
				newObj[i] = [];
			}
			if(i==='checked'){
				newObj[i] = false;
			}
		}
		arr.push(newObj);
		if(newObj.childrenId.length){        //复制他以及他所有儿子  放到一个数组里面
			newObj.childrenId = []; //新儿子
			var childs = getChildrenById(data,target.id);
			for(var i = 0;i<childs.length;i++){
				newObj.childrenId.push({id:id+1});
				doCopy(childs[i],newObj.id);
			}
		}
	}
	return arr;
}


//复制
function copy(){
	arrCheck=[];
	var childs = getChildrenById(data,nowId);
	
	for(var i = 0;i<childs.length;i++){
		if(childs[i].checked){
			arrCheck.push(childs[i]);
		}
	}
}
//粘贴
function paste(){
	console.log(1);
	arrCopyBox  = [];
	arrCheck.forEach(function(item){
		arrCopyBox.push(deepCopy(item,nowId));
	})
	
	//用于存放需要覆盖操作的对象
	var coverObj = [];
	var tarChilds = getChildrenById(data,nowId);

	//把需要覆盖的存起来
	for(var i = 0;i<arrCopyBox.length;i++){
		for(var j =0 ;j<tarChilds.length;j++){
			if(arrCopyBox[i][0].name === tarChilds[j].name){
				newItem = arrCopyBox.splice(i,1);
				coverObj.push({move:newItem,tar:tarChilds[j]});
				i--;
				break;
			}
		}
	}
	
	
	if(coverObj.length){  //有需要覆盖的
		var coverBox = document.querySelector('.cover');
		var coverNum = document.querySelector('.coverNum');
		var coverList = document.querySelector('.flieCover');
		var btns = document.querySelectorAll('.fileCoverBtn button');
		btns[0].onclick = function(){           // 整个取消移动
			coverBox.classList.remove('active');
			message('succ','已取消复制');
			arrCheck=[];
		}
		btns[0].style.display = ''; 
		btns[1].onclick = function(){			//确定按钮
			coverBox.classList.remove('active');
			message('succ','复制完成');
			arrCheck=[];
			reload();
		}
		
		coverNum.innerHTML = `你有${coverObj.length}个文件重名了大哥.`;
		coverBox.classList.add('active');
		coverList.innerHTML = '';//coverObj[ {move:[[obj1,obj2,obj3 ]],tar:tarobj},...]
		coverObj.forEach(function(item){     //生成文件选项
			var coverItem =  creatCover2(item);
			coverList.appendChild(coverItem);
		})
	};
	
	// 没有重名的部分
	if(arrCopyBox.length){
		copyFile(arrCopyBox)
	}
	
	function copyFile(arrCopy){
		var newId = 0;
		arrCopy.forEach(function(item){
				newId = item[0].id
				data[nowId].childrenId.push({id:newId});
				item[0].pId = nowId;
				for(var i = 0; i < item.length;i++){
					data[item[i].id] = item[i];
				}
		})
		arrCheck=[];//粘贴板
		reload();
		console.log('结束')
	}
}


//-----------创建覆盖弹窗列表(复制)--------------
function creatCover2(arrCopyItem){   //arrCopyItem{move:[[obj1,obj2,obj3 ]],tar:tarobj}
	var btns = document.querySelectorAll('.fileCoverBtn button');
	var li = document.createElement('li');
	var span = document.createElement('span');
	span.innerHTML =`文件:${ arrCopyItem.move[0][0].name}`;	
	var div = document.createElement('div');
	div.className = 'flieCover-btn';
	var btn1 = document.createElement('button');
	btn1.innerHTML = '覆盖';
	btn1.onclick = function(){
		btns[0].style.display = 'none'; //意味着不取消移动
		
		del(arrCopyItem.tar);
		
		for(var i = 0;i<arrCopyItem.move[0].length;i++){
			data[arrCopyItem.move[0][i].id] = arrCopyItem.move[0][i];
		}
		var parent = data[nowId];
		for(var i = 0;i<parent.childrenId.length;i++){
			if(parent.childrenId[i].id ===arrCopyItem.tar.id){
				parent.childrenId.splice(i,1);
			}
		}
		
		data[nowId].childrenId.push({id:arrCopyItem.move[0][0].id});
		this.parentNode.parentNode.classList.add('active');
	}
	
	var btn2 = document.createElement('button');
	btn2.innerHTML = '新建副本';
	btn2.onclick = function(){
		btns[0].style.display = 'none'; //意味着不取消移动
		
		for(var i = 0;i<arrCopyItem.move[0].length;i++){
			data[arrCopyItem.move[0][i].id] = arrCopyItem.move[0][i];
		}
		copyExist(arrCopyItem.move[0][0],arrCopyItem.tar);
		data[nowId].childrenId.push({id:arrCopyItem.move[0][0].id});
		this.parentNode.parentNode.classList.add('active');
		
	}
	var btn3 = document.createElement('button');
	btn3.innerHTML = '忽略';
	btn3.onclick = function(){
		btns[0].style.display = 'none'; //意味着不取消移动
		this.parentNode.parentNode.classList.add('active');
	}
	div.appendChild(btn1);
	div.appendChild(btn2);
	div.appendChild(btn3);
	
	li.appendChild(span);
	li.appendChild(div);
	
	return li;
}


//始终保持副本1 副本2... 的顺序添加	(包括删除副本再添加)

//副本改名
function copyExist(copyFile,coverTar){
						
	if(typeof coverTar.arrCopy ==='undefined')coverTar.arrCopy=[];
	if(typeof coverTar.copy === 'undefined')coverTar.copy = 0 ;
						
	if(coverTar.arrCopy.length){    //查看是否存有副本缓存
		
		var num = coverTar.arrCopy.shift();
		var newName = copyFile.name+`(${num})`;
		var isExist = existMore(newName,coverTar); //新名字是否被占用了
		
		if(isExist){
			num = coverTar.arrCopy.shift();  //如果被占用 ？ 用数组下一个 或者 copy数++ 
			copyFile.name += num? `(${num})`:`(${++coverTar.copy})`;
		}else{
			copyFile.name += `(${num})`;
		}
		
		copyFile.coverId =  coverTar.id;
		copyFile.showcopy = num;
	}else{
		var newName = copyFile.name+`(${coverTar.copy+1})`;
		
		var existIndex= existMore(newName,coverTar)
		coverTar.copy = existIndex?existIndex:coverTar.copy ; //检测新名字是否存在 存在则纳入副本
		
		copyFile.name+=`(${++coverTar.copy})`;
		copyFile.coverId = coverTar.id;
		copyFile.showcopy = coverTar.copy;
	}
};

//给副本主存放信息
function addArrcopy(obj){	
	if(typeof obj.coverId === 'undefined')return;
	var coverId  =  obj.coverId ;  // 副本主id
	if(!data[coverId])return ; //如果副本主已经不在了 就返回
	var arrCopy =  data[coverId].arrCopy = data[coverId].arrCopy||[];
	arrCopy.push(obj.showcopy);   //存放移动或删除的副本 的副本次序
	arrCopy.sort(function(a,b){     //由小到大排序    确保添加副本的时候由小到大
		return a - b;
	})
	obj.coverId = undefined;
} 
//删除副本主的 副本信息
function delArrcopy(obj){
	if(!obj.copy)return;   //如果它不是一个副本主  return;
	obj.copy = 0;
	obj.arrCopy = [];
}

function existMore(newName,coverTar){       //丧心病狂 有人在文件夹 创建了名为 file(1)的文件
	var copyIndex;             
	var TarParentChilds = getChildrenById(data,coverTar.pId);
	for(var i = 0;i<TarParentChilds.length;i++){
		if(TarParentChilds[i].name === newName){
			var existObj = TarParentChilds[i];
			var len = existObj.name.length;
			
			copyIndex =  existObj.name.match(/\(\d*\)$/)[0].match(/\d+/)*1;
			
			existObj.coverId = coverTar.id;   //纳入副本
			existObj.showcopy =copyIndex;
		}
	}
	return copyIndex;
}


//------------全选/取消全选
function allSelect(boolean,picked){
	
	var currentChild = getChildrenById(data,nowId);
	for(var i = 0;i<fileitems.length;i++){
		if(picked){
			if(fileitems[i].dataset.index*1===picked.id)continue;
		}
		boolean? fileitems[i].classList.add('active'):fileitems[i].classList.remove('active');
		if(currentChild[i])currentChild[i].checked = boolean? true : false;
	}
}
function select(index,toSelect){ 
	data[index].checked = toSelect? true:false;
}


//创建菜单
function creatMenu(dataMenu,isFile){
	
	var div = document.createElement('div');
	div.className = 'menu';
	
	var menuList = [];
	if(isFile){
		if(isRec){
			menuList = ['del','rename','moveto'];
		}else{
			menuList = ['del','rename','moveto','copyto','paste'];
		}
	}else{
		menuList = ['creat','upload','paste'];
	}
	
	menuList.forEach(function(item){
		var a = document.createElement('a');
		var span = document.createElement('span');
		span.innerHTML = dataMenu[item].name;
		span.onmouseup = dataMenu[item].click;
//		a.onmouseup = dataMenu[item].click;
		span.style.background = dataMenu[item].background;
		span.style.backgroundSize = dataMenu[item]['background-size'];
		a.appendChild(span);
		div.appendChild(a);
	})

	return div;
}



//----------搜索功能-------------
function searchFile(value,nowId,father){
	
	var childId = data[nowId].childrenId;
	var eles = father.children;
	
	for(var i = 0 ;i<childId.length;i++){
		(function(i){
			if( data[childId[i].id].name === value){
				eles[i].style.color = 'gold';
				father.addEventListener('mousedown',function(e){
					eles[i].style.color = '';
				})
				
			};
		})(i);
	};
}

//---------模糊-------------

function filter(boolean){
	var arr = [];
	var fileBox = document.querySelector('.file-container');
	var leftBox = document.querySelector('.left');
	var buttonBox = document.querySelector('.button');
	var banner = document.querySelector('.banner');
	arr.push(fileBox,leftBox,buttonBox,banner);
	for(var i = 0 ;i<arr.length;i++){
		boolean?arr[i].classList.add('blur'):arr[i].classList.remove('blur');
	}
}	


function filePull(){
	document.addEventListener('mousemove',function(e){
		e.preventDefault();
	})
	
	document.addEventListener('mousedown',function(e){
		var target = e.target;
		if(!getParentCls(target,'fileitem')||target.nodeName =='INPUT')return;//如果点的不是文件以内或者点的是选择按钮 return;
		var wrap = document.querySelector('.disk_wrap');
		var parent = getParentCls(target,'fileitem');
			
		var name = parent.querySelector('.title');
		var pullIndex = parent.dataset.index*1;
		var imgShowBox = document.querySelector('.imgShowBox');
		var timer = null;
		clearTimeout(timer);
		
		select(pullIndex,true);//选中
			
		var div = document.createElement('div');
		var src = isRec?'./image/recycle/file.png':'./image/file.png';
		div.style.backgroundImage = `url(${parent.classList.contains('img')?
		'./image/littlepaper.png' :src})`;
		div.style.position = 'absolute';
		div.style.left = '-9999px';
		div.style.border =  '1px solid #ededed';
		div.style.backgroundColor = '#fff';
		div.style.backgroundRepeat = 'no-repeat';
		div.style.backgroundPosition = '0px 6px ';
		div.style.backgroundSize =parent.classList.contains('img')? '14%':'20px';
		div.style.padding = '4px 30px'; 
		div.style.textAlign = 'center';
		div.style.font =  "16px/24px '黑体'"
		div.innerHTML = name.innerHTML;
			
		wrap.appendChild(div);
		document.addEventListener('mousemove',divMove)
		function divMove(e){
			var moveParent = getParentCls(e.target,'fileitem');
			var moveIndex =moveParent?moveParent.dataset.index*1:undefined;
			var menu =document.querySelector('.menu');
			if(menu){
				wrap.removeChild(div);
				document.removeEventListener('mousemove',divMove);
				document.removeEventListener('mouseup',mousUp);
				return;
			}//文件弹出菜单  不出现拖拽框
				
			//拖动文件到目录  目录随着鼠标位置打开
			var listParent = getParentCls(e.target,'list-tile');
			if(listParent){
				if(!listParent.nextElementSibling)return;
				var timer = setTimeout(function(){
					listParent.firstElementChild.classList.add('active');
					listParent.nextElementSibling.classList.add('active');
				},800)
			}
				
			var moveX = e.pageX,moveY = e.pageY;
			if(pullIndex!==moveIndex){     //拖动出文件夹范围外才显示
				div.style.left = moveX+10 + 'px';
				div.style.top = moveY+10 + 'px';
				div.style.cursor = 'pointer';
			}
		}
			
		document.addEventListener('mouseup',mousUp);
		function mousUp(e){
			var tarUp = e.target;
			var upParent = getParentCls(tarUp,'fileitem')||getParentCls(tarUp,'list-tile');
			var upIndex = upParent?upParent.dataset.index*1:undefined;
			if(upParent&&pullIndex!==upIndex){ //拖动到本文件夹 不进行移动
				var upIndex = upParent.dataset.index*1;
				isMove(upIndex,nowId);
			}
			div.style.transition = pullIndex==upIndex?'': '200ms'; 
			div.style.left = div.offsetLeft-200 + 'px';
			div.style.opacity = 0;
			setTimeout(function(){
				wrap.removeChild(div);
			},200) ;
			document.removeEventListener('mousemove',divMove);
			document.removeEventListener('mouseup',mousUp);
		}
	})
}

function renameFn(Inp,fn,isNewFile){
		
		Inp.previousElementSibling.style.display = 'block';
		Inp.style.display = 'none';
		
		var currentChild = getChildrenById(data,nowId);
		if(Inp.value.trim()===''){
			message('fail','名称不能为空');
			fileBox.removeChild(fileBox.firstElementChild);
		}else{
			if(nameExist(currentChild,Inp.value)){
				message('fail','名字已存在');
				fileBox.removeChild(fileBox.firstElementChild);
				return;
			};
			
			message('succ','添加成功');
			Inp.previousElementSibling.innerHTML = Inp.value;
			
			if(fn)fn();
		};
	}


function keyBlur(Inp){
	
	window.addEventListener('keydown',keyDown);
	
	window.addEventListener('keyup',function(e){
		if(e.keyCode!==13) return;
		window.removeEventListener('keydown',keyDown);
	})
	function keyDown(e){
		if(e.keyCode===13){
			Inp.onblur();
		}
	};
}