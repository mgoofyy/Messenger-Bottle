var redis = require('redis');
var client = redis.createClient();
var client2 = redis.createClient();
var client3 = redis.createClient();

exports.throw = function(bottle,callback) {

	client2.SELECT(2,function(){
		client2.GET(bottle.owner,function(err,result){
			if (result > 10) {
				return callback({
					'code':'0',
					'msg' : '当前瓶子已经用完',
					'method':'POST'
				});
			}
			client2.INCR(bottle.owner,function(){
				console.log("已经设置瓶子的有效期");
				client2.TTL(bottle.owner,function(err,ttl){
					if (ttl == -1) {
						//设置瓶子的生存时间
						//
						
						client2.EXPIRE(bottle.owner,86400);
					}
					console.log(ttl);
				});
			});
		});
	});

	bottle.time = bottle.time || Date.now();
	var bottleId = Math.random().toString(16);
	var type = {male:0,female:1};

	//瓶子按男女划分到不同的redis
	client.SELECT(type[bottle.type],function(){
		client.HMSET(bottleId,bottle,function(err,result) {
			if (err) {
				return callback({'code':'0','msg':'过一会再试','method':'POST'});
			}
			callback({'code':'1','msg':'保存成功','method':'POST','bottle':bottle});
			client.EXPIRE(bottleId,86400);
		});
	});

};

exports.picks = function(info,callback) {
		
		//选择REDIS 3数据表
		client3.SELECT(3,function(){
			 client3.GET(info.owner,function(err,result){
			 	if (result > 10) {
			 		return callback({
			 			'code':'1',
			 			'msg':'你今天的瓶子已经用完了',
			 			'method':'POST'
			 		});	
			 	}

			 	client3.INCR(info.owner,function(){
				console.log("已经设置瓶子的有效期");
				client3.TTL(info.owner,function(err,ttl){
					if (ttl == -1) {
						//设置瓶子的生存时间
						client3.EXPIRE(info.owner,86400);
					}
					console.log(ttl);
				});
			});

			 });
		});

		//一定几率捞取到海星
		if (Math.random() <= 0.2) {
			return callback({'code':'0','msg':'获取了海星','method':'POST'});
		}
		
		var type = {all:Math.round(Math.random()), male:0 ,female:1};

		info.type = info.type || 'all';

		client.SELECT(type[info.type],function(){
			 
			client.RANDOMKEY(function(err,bottleId){

				if (!bottleId) {
					return callback({'code':'0','msg':'什么都没有哦','method':'post'});
				}
				client.HGETALL(bottleId,function(err,bottle){
					if (err) {
						return callback({'code':'0','msg':'漂流瓶子破损了','method':'post'});
					}
					// client.DEL(bottleId);
					callback({'code':'1','msg':'获取到瓶子','method':'POST','data':bottle});
				});
			
			});
		});	
};

exports.throwBack = function(bottle,callback) {
	var type = { male:0, female:1 };

	var bottleId = Math.random().toString(16);
	client.SELECT(type[bottle.type],function(){
		client.HMSET(bottleId,bottle,function(error,result){
			console.log(error + ' ======= ' + bottle.type + bottle.time  + result + '   ' + bottleId);
			if (error) {
				return callback({
								'code':'0',
								'msg':'等会再试一下',
								'err':error
								});
			}
			callback({
					'code':'1',
					'msg':result
					});
			var time = bottle.time + 86400000 - Date.now();
			// console.log(typeof(time));
			client.PEXPIRE("bottleId",time.toString());
		});
	});
}