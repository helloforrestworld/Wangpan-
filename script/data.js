var user_data = {
	"maxId":11,
	"0":{
		"name":"根目录",
		"id":0,
		"type":"folder",
		"childrenId":[{'id':1},{'id':2},{'id':6},{'id':7}]
	},
	"1":{
		"name":"框架",
		"id":1,
		"pId":0,
		"type":"folder",
		"childrenId":[{'id':3},{'id':4}]
	},
	"2":{
		"name":"Html5",
		"id":2,
		"pId":0,
		"type":"folder",
		"childrenId":[]
	},
	"3":{
		"name":"React",
		"id":3,
		"pId":1,
		"type":"folder",
		"childrenId":[]
	},
	"4":{
		"name":"Vue",
		"id":4,
		"pId":1,
		"type":"folder",
		"childrenId":[{'id':5}]
	},
	"5":{
		"name":"Vue-ci",
		"id":5,
		"pId":4,
		"type":"folder",
		"childrenId":[]
	},
	"6":{
		"name":"妹子's",
		"id":6,
		"pId":0,
		"type":"img",
		"src":"./image/pic/timg.jpg",
		"childrenId":[]
	},
	"7":{
		"name":"妹子",
		"id":7,
		"pId":0,
		"type":"img",
		"src":"./image/pic/1.jpg",
		"childrenId":[]
	},
	//回收站数据
	"8":{
		"name":"回收站",
		"id":8,
		"type":"folder",
		"childrenId":[{'id':9}]
	},
	"9":{
		"name":"框架",
		"id":9,
		"pId":8,
		"type":"folder",
		"childrenId":[{'id':10},{'id':11}]
	},
	"10":{
		"name":"Html5",
		"id":10,
		"pId":9,
		"type":"folder",
		"childrenId":[]
	},
	"11":{
		"name":"React",
		"id":11,
		"pId":9,
		"type":"folder",
		"childrenId":[]
	},
};


var data_menu = {
	"creat":{
		"name":"新建文件夹",
		"click":function(){
			addFile.onclick();
		},
		"background":'url(./image/addfile.png)2px 14px no-repeat',
		"background-size":'16%'
	},
	"del":{
		"name":"删除",
		"click":function(){
			delFile.onclick();
		},
		"background":'url(./image/delete.png)4px 20px no-repeat',
		"background-size":'12%'
	},
	"rename":{
		"name": "重命名",
		"click":function(){
			rename.onclick();
		},
		"background":'url(./image/rename.png)4px 20px no-repeat',
		"background-size":'12%'
	},
	"moveto":{
		"name":"移动到",
		"click":function(){
			var listShowBtns = listShow.querySelectorAll('.listBtn button'); 
			listShowBtns[0].innerHTML = '移动';
			
			listShow.classList.add('active');
			listShowBox.innerHTML = creatList(data[0]);
			
			listClick(listShowBox); //添加点击事件
			
			//模糊
			filter(true);
		},
		"background":'url(./image/move.png)4px 20px no-repeat',
		"background-size":'12%'
	},
	"copyto":{
		"name":"复制",
		"click":function(){
			copy();
		},
		"background":'url(./image/copy.png)4px 20px no-repeat',
		"background-size":'12%'
	},
	"paste":{
		"name":"粘贴",
		"click":function(){
			paste();
		},
		"background":'url(./image/copy.png)4px 20px no-repeat',
		"background-size":'12%'
	},
	"upload":{
		"name":"上传文件",
		"click":function(){
			message('succ',"功能还没添加")
		},
		"background":'url(./image/upload.png)4px 18px no-repeat',
		"background-size":'12%'
	}
}

