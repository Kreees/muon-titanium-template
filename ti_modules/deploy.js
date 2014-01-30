var fs = Ti.Filesystem;
var res_dir = fs.resourcesDirectory;
var app_dir = fs.applicationDataDirectory;

module.exports = {};

man = JSON.parse(fs.getFile(res_dir,"HTML/manifest.json").read().text);
var app_manifest = fs.getFile(app_dir,"manifest.json");
Ti.API.info(app_manifest.exists());
var flag = true; 
if (app_manifest.exists()){
	try{
		var old_manifest_hash = JSON.parse(app_manifest.read().text).hash;
		if (old_manifest_hash == man.hash) flag = false;		
	}
 	catch(e){alert(e.message);}
}
if (flag) {
	app_manifest.write(fs.getFile(res_dir,"HTML/manifest.json"));	
	var html_file = fs.getFile(app_dir,"HTML");
	if (html_file.isDirectory()) html_file.deleteDirectory(true);
	if (html_file.isFile()) html_file.deleteFile();
	html_file.createDirectory();	
	for(var i in man.files){
		i = i.replace(/\:/g,"/");
		var dir = i.split("/");
		var file_name = dir.pop();
		var subdir = fs.getFile(html_file.nativePath);
		while(dir.length != 0){
			subdir = fs.getFile(subdir.nativePath,dir.shift());
			if (subdir.isDirectory()) continue;
			subdir.createDirectory();
		}
		fs.getFile(subdir.nativePath,file_name).write(fs.getFile(res_dir,"HTML/"+i));
	}			
}
