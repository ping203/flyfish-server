

var zlib = require('zlib');

var fs = require('fs');
var Path = require('path');

/**
 * date类型转成string
 * eg:
 * (new Date()).format("yyyyMMddhhmmss") ==> 20161010110655
 */
Date.prototype.format = function (fmt) { //author: meizz   
    var o = {
        "M+" : this.getMonth() + 1,               //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth() + 3) / 3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

// let filePath = "F:/project/fishjoy_develop/fishjoy_js/assets/resources/common/cfgs/all_cfgs.json";

// unzip_file();

var zip_file = function(filePath, topath) {
	if (!fs.existsSync(filePath)) {
		console.log("can not find path:" + filePath);
		return false;
	}

	fs.readFile(filePath, 'utf8', (err, data)=> {
		if (err) {
			return console.error(err);
		}else{
			// console.log("----------------", data);
			zlib.deflate(data, (err, buffer) => {
			  if (!err) {
					// console.log(buffer.toString('base64'));
					var baseName = Path.basename(filePath);
					// const newFileName = filePath.substring(0, filePath.lastIndexOf("."));
					baseName = baseName.substring(0, baseName.lastIndexOf("."));
					console.log("----newfile:", baseName );
					fs.writeFile(Path.join(topath, baseName), buffer.toString('base64'), (err) => {
						if (err){
							console.log(err);
						}else {
							// unzip_file();
							console.log(baseName + " success");
							// fs.unlinkSync(filePath);
						}
					})
			  } else {
				// handle error
			  }
			});
		}
	})
	return true;
};

var generateCtrlCfg = function(time1, time2, path, extra) {
	//更新压缩文件时间戳记录
	var timeStamp1 = (new Date(time1)).format("yyyyMMddhhmmss");
	var timeStamp2 = (new Date(time2)).format("yyyyMMddhhmmss");
	console.log("all_cfgs time:", timeStamp1);
	console.log("all_merge time:", timeStamp2);
	var data = {
		times: {
			all_cfgs: timeStamp1,
			all_merge: timeStamp2,
		},
		keys: {
			data_key: 'THIS_IS_A_TEST_KEY1029384756', //TODO:加密
			fight_key: 'fishjoy&2017_12_11_@12345',//TODO:加密
		},
	};
	for (var key in extra) {
		data[key] = extra[key];
	}
	var str = JSON.stringify(data);

	fs.writeFile(Path.join(path, 'json_list.cfg'), str, (err) => {
		if (err){
			console.log(err);
		}else {
			console.log("json_list success");
		}
	});
}

// zip_file("../../fishjoy_js/assets/resources/common/cfgs/all_cfgs.json");

// zip_file("../../fishjoy_js/assets/resources/game/cfgs/all_merge.json");

var tempHandle = function(src, dist) {
	var cfgStr = fs.readFileSync(src + "/urlCfg.json").toString();
	var cfg = JSON.parse(cfgStr);
	fs.readdir(src, function(err, files) {
		files.forEach(function(file) {
			var _src = src + "/" + file;
			var _dist =  file;
			var t1 = null, t2 = null;
			fs.statSync(_src).isDirectory() && (
				zip_file(_src + "/all_cfgs.json", _dist) && (t1 = fs.statSync(_src + "/all_cfgs.json").mtimeMs),
				zip_file(_src + "/all_merge.json", _dist) && (t2 = fs.statSync(_src + "/all_merge.json").mtimeMs),
				generateCtrlCfg(t1, t2, _dist, cfg[file] || {})
			);
		}) 
	});
}

tempHandle("客户端导出", "服务器导出");

// zip_file("客户端导出/CN/all_cfgs.json", "服务器导出/CN");

// zip_file("客户端导出/CN/all_merge.json", "服务器导出/CN");



