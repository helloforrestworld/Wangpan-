
//根据数据渲染文件夹
function creatFiles(data,file){
	var str = ``,i,len = data.length;
	var turn = file.classList.contains('colum')?true:false;
	for(i=0;i<len;i++){    /*rec*/
		str += `<div class="fileitem ${data[i].type}" data-index="${data[i].id}">
					<div class="pic ${data[i].type}"${data[i].type==='img'?
					`style = "background-image:url(${data[i].src})"`:``}></div>
					<div class="name">
						<span class = "title">${data[i].name}</span>
						<input type="text" value="新建文件夹" class = 'set-name' />
					</div>${turn?`<div class="type">${data[i].type}</div>`:``}
				</div>`
	};	
	return str;
};

//生成导航面包削
function creatNavs(data,isRec){
	var str = ``,i,len = data.length;
	
	if(len === 1){
	  return str = `<a href = "javascript:;" data-index ="${isRec?8:0}">${isRec?'回收站':'根目录'}</a>`;
	}
	
	str =  `<a href = "javascript:;"class = "back">返回上一级 |</a>`;
	for(i = 0; i<len ; i++){
		
		str += `<a href = "javascript:;" data-index ="${data[i].id}">${data[i].name}</a>`;
		
		if(i!==len-1) str+='>';
	}
	
	return str;
}


//新建文件夹
function addFiles(file){
	var turn = file.classList.contains('colum')?true:false; //判断是否横向布局
	
	var fileitem =  document.createElement('div');
	fileitem.className = 'fileitem folder';
	
	var pic = document.createElement('div');
	pic.className = 'pic';
	
	var name = document.createElement('div');
	name.className = 'name';
	
	var title =  document.createElement('span');
	title.className = 'title';
	title.style.display = 'none';
	
	var Inp = document.createElement('input');
	Inp.className = 'set-name';
	Inp.type = 'text';
	Inp.style.display = 'block';
	
	
	name.appendChild(title);
	name.appendChild(Inp);
	
	fileitem.appendChild(pic);
	fileitem.appendChild(name);
	
	if(turn){
		var type = document.createElement('div');
		type.className = 'type';
		type.innerHTML = 'folder';	
		fileitem.appendChild(type);
	}
	return fileitem;
}



//生成左侧导航列表
function creatList(dataRoot){
	var str = ``,childId = dataRoot.childrenId,len = childId.length,i;
	var type = dataRoot.type;
		if(type === 'folder'){
			str += `<li><span data-index = "${dataRoot.id}" class = "list-tile ${type}">${len?'<strong></strong>':''}<em></em>${dataRoot.name}</span>`
		};
		if(type === 'img'){
			str += `<li><span data-index = "${dataRoot.id}" class = "list-tile ${type}">
			<em class = "${type}" style ="background-image:url(${dataRoot.src})">
			</em>${dataRoot.name}</span>`
		}
			if(len){ 
				str += `<ul>`;
				for(i=0;i<len;i++){
					str += `${creatList(  data[  childId[i].id ] )}`;
				}
				str += `</ul>`;
			}
		str += `</li>`;
	
	return str;
}



//点击自身隐藏所有
function listClick(wrapUl){
	var firstList = wrapUl.children;
	var len = firstList.length;
				
	if(firstList[0].firstElementChild.onclick)	return;
	
	for(var  i=0;i<len;i++){
		var caption = firstList[i].firstElementChild;
		caption.onclick = function(){
			
			var next =  this.nextElementSibling;  
			var gParent = wrapUl;
			var aUl  =  gParent.querySelectorAll('ul');
			for(var i=0;i<aUl.length;i++){
				if(aUl[i]!== next){
					aUl[i].classList.remove('active');
				}
			}
							
			if(next){
				next.classList.toggle('active');
				listClick(next);
			}
		}
	}
				
};