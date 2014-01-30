var views = {};

var __fs = Ti.Filesystem;

Ti.App.addEventListener("deploy",function(_data_){
	var addr = _data_.data || address;
	var client = Ti.Network.createHTTPClient();
	client.open("GET","http://"+addr+":3000/projects/1.json");
	client.onerror = function(e){
		alert("Cant' deploy project");
	};
	client.onload = function(e){
		try {
			var ret = JSON.parse(this.responseText);
			deploy_project(ret.project.files);
		}
		catch(e){alert(e.error);}
	};
	client.send();		
});

function deploy_project(_data_){
	var client = Ti.Network.createHTTPClient();
	var data = null;
	
	function getNextFile(){
		if (_data_.length == 0){
			_view_ = Ti.UI.createWebView();
			_view_.setUrl(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory+"/project/index.html").nativePath);
		win.add(_view_);
		return;
	}
	data = _data_.shift();
	client.open("GET",data.url);
	client.send();				
	};

	client.onload = function(e){
		var path = data.path.split("/");
		var current_path = "";
		for(var i in path){
			if (path[i].length == 0) continue;
			if (path[i].indexOf(".") == 0) continue;
			current_path += "/"+path[i];
			var _path_ = __fs.getFile(__fs.applicationDataDirectory).nativePath+current_path;
			var _file_ = __fs.getFile(_path_);
			if (!_file_.isDirectory()){
				if (!_file_.createDirectory()){
				}
			}
		}
		var  file = __fs.getFile(__fs.applicationDataDirectory+current_path+"/"+data.file_name);
		if (file.write(this.responseData) === false) Ti.App.fireEvent("deploy_resp",{data:{url:data.url,error:"Can't write file"}});				
		else getNextFile();
	};
	getNextFile();
}

module.exports = {};
