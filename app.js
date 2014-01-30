var fs = Ti.Filesystem;
var res_dir = fs.resourcesDirectory;
var app_dir = fs.applicationDataDirectory;

(function() {
	// var xhr = require("tiproxy/net"),
		// ti_api = require("tiproxy/ti_api"),
		// deployer = require("tiproxy/deploy");	
		
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));		
	var key = (Math.floor(Math.random()*999999999) + 1000000000).toString(16);		
	var temp_m = fs.getFile(res_dir,"ti_modules").getDirectoryListing();
	var modules = [];
	for(var i in temp_m){
		if (!/\.js$/.test(temp_m[i]) || /^_/.test(temp_m[i])) continue;
		var mod = require("ti_modules/"+temp_m[i].replace(/\.js$/g,""));
		mod.init && mod.init();	
		modules.push(mod);		
	}
	delete temp_m;
	
	var manifest = JSON.parse(fs.getFile(app_dir,"manifest.json").read().text);
	
	var index_file = fs.getFile(app_dir,"HTML/index.html").read().text;	
	var html_tag_part = index_file.match(/<html[\s\S]*?>/i)[0].replace(/(<html\s*)|(>)/gi,"");
	index_file = index_file.replace(/(^\s*(<!doctype html>)?\s*<html[\S\s]+?>)|(<\/html>\s*$)/i,"");
	var meta_tag = index_file.match(/<meta[^>]*?name=[\'\"]viewport[\'\"][^>]*?>/i)[0];
	
	meta_tag && (meta_tag =meta_tag.match(/content=[\"\'][\S\s]*?[\"\']/i)[0]);
	meta_tag && (meta_tag = meta_tag.replace(/content=/ig,"").replace(/[\"\']/g,"").split(",")
			   .map(function(a){
			   		a = a.split("=");
			   		return {key: a[0].replace(/(^\s+)|(\s+$)/g,""),val: parseInt(a[1].replace(/(^\s+)|(\s+$)/g,""))};
			   }));
	var orient = meta_tag?meta_tag.filter(function(a){return (a.key == "orientation");}):[];
	var pack_data = fs.getFile(app_dir,"/HTML/pack/"+manifest["package"]);
	pack_data = pack_data.read().text;
	pack_data = pack_data.replace(/<\/script/gi,"</scr\"+\"ipt");
	pack_data = pack_data.replace(/<script/gi,"<scr\"+\"ipt");
	index_file += "<script type='text/javascript'>"+pack_data+"</script>";
		
	index_file += "<script>window.__titanium__key__ = '"+key+"';</script>";
	
	var clients_files = fs.getFile(res_dir,"client").getDirectoryListing();	
	for(var i in clients_files)
		index_file += "<script src='"+fs.getFile(res_dir,"client/"+clients_files[i]).nativePath+"'></script>";

	var app_file = fs.getFile(app_dir,"HTML/app.html");
		
	app_file.write("<!DOCTYPE html><html "+html_tag_part+">"+index_file+"</html>");

	var win = Ti.UI.createWindow({
		backgroundColor: "#333",
		fullscreen: true,
		exitOnClose: true,
		navBarHidden: true,
		orientationModes: orient?orient.map(
			function(a){
				switch(a.val.toString()){
					case "0": return Ti.UI.PORTRAIT;
					case "-90": return Ti.UI.LANDSCAPE_LEFT;
					case "90": return Ti.UI.LANDSCAPE_RIGHT;
					case "180": return Ti.UI.UPSIDE_PORTRAIT;
				};
			}):null
	});
		
	var view = Ti.UI.createWebView({
		right: 0, left:0, bottom: 0, top:0,
		enableZoomControls: false,
		showScrollbars: false,
		pluginState: Ti.UI.Android?Ti.UI.Android.WEBVIEW_PLUGINS_ON:undefined,
		backgroundColor: "#333",
		url: app_file.nativePath,		
	});
	
	Ti.App.addEventListener("muon_exit",function(){
		win.close();
	});
	
	win.add(view);		
	win.open();
	modules.map(function(a){
		a.registerView && a.registerView({key: key,view: view, win: win});
	});
})();
