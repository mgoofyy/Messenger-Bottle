var express = require("express");
var redis = require("./redis.js");

var app = express();
app.use(express.bodyParser());

app.post('/',function(req,res){
	//当前是一个非法请求，空瓶子
	if (!(req.body.owner && req.body.type && req.body.content)) {
		console.log("这是一个空瓶子（非法请求）");
		res.json({
					'method':'POST',
					'code':'0',
					'msg' : '请求参数不正确'
				});
	}
	redis.throw(req.body,function(result){
		res.json(result);
	});
});

app.get('/',function(req,res){
	res.json({
				'method':'get',
				'code':'0',
				'msg' : '请求方式不正确'
			});
});

app.post('/pick',function(req,res){
	//捞瓶子的时候只是限制男女
	if (!(req.body.type)) {
		res.json({
					'method':'POST',
					'code':'0',
					'msg' : '请求参数不正确'
				});
	}
			
	redis.picks(req.body,function(result){
		res.json(result);
	});
});

app.get('/pick',function(req,res){
	res.json({
				'method':'get',
				'code':'0',
				'msg' : '请求方式不正确'
			});
});



app.listen(3000);