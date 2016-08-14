var redis = require('redis');
var client = redis.createClient();

exports.throw = function(bottle,callback) {
	bottle.time = bottle.time || Date.now();
	var bottleId = Math.random().toString(16);
	var type = {male:0,female:1};

	//瓶子按男女划分到不同的redis
	client.SELECT(type[bottle.type],function(){
		client.HMSET(bottleId,bottle,function(err,result) {
			if (err) {
				return callback({'code':'0','msg':'过一会再试','method':'POST'});
			}
			callback({'code':'1','msg':'保存成功','method':'POST'});
			client.EXPIRE(bottleId,86400);
		});
	});

};

exports.picks = function(info,callback) {
	client.SELECT('all',function(){
		//
		//一定几率捞取到海星
		//
		client.RANDOMKEY(function(err,bottleId){
			if (!bottleId) {
				return callback({'code':'0','msg':'什么都没有哦','method':'post'});
			}
			client.HGETALL(bottleId,function(err,bottle){
				callback({'code':'1','msg':'获取到瓶子','method':'POST','data':bottle});
			});
			
		});
	});
};