
var Views = {};
function getRandom(){ return (Math.floor(Math.random()*999999999) + 1000000000).toString(16); }

var fs = Ti.Filesystem;
var res_dir = Ti.Filesystem.resourcesDirectory;
var app_dir = fs.applicationDataDirectory;
var manifest = JSON.parse(fs.getFile(app_dir,"manifest.json").read().text);
		
function get_request(ev){
	var view_key = ev.view_key;
	if (!(view_key in Views)) {
		Views[view_key] = {
			xhrs: {},
			view: null,
			cookies: {},
			selected_files: {},
			fallbacks: [ev]
		};	
		return;
	}
	if (!Views[view_key].view){		
		Views[view_key].fallbacks.push(ev);
		return;
	}
	var view = Views[ev.view_key].view;
	var xhr_key = ev.xhr_key;
	var url = ev.url.replace(RegExp("^"+app_dir.replace("file://localhost","file://")),"")
					.replace(/\?\S*$/,"")
					.replace(/^file:\/+/,"")
					.replace(/^HTML\//,"");
					
	function return_to_client(resp){
		resp = escape(JSON.stringify(resp));
		var i = 0;
		var interval = setInterval(function(){
			i = i + 65536;
			var substr = resp.substr(0,i);
			resp = resp.substr(i);
			view.evalJS("window['__titanium_data_"+xhr_key+"'] += '"+substr+"';");
			if (resp.length == 0) {
				view.evalJS("window.__titanium_cb('"+xhr_key+"');");
				clearInterval(interval);
			}
		},10);	
	}
			
	if (url in manifest.files){
		var error = false;
		var file_buf = fs.getFile(app_dir,"HTML/"+url.replace(/:/g,"/")).read(); 
		if (typeof file_buf != "object") error = true;
		var text = error?null:file_buf.text;
		if (!error && /\?\S*m_callback=\S+/.test(ev.url)){
			m_callback = ev.url.match(/m_callback=\S+&|m_callback=\S+$/)[0].replace(/&/g,"").replace(/^m_callback=/gi,"");
			text += "\n\n";
			text += "try{ m['"+m_callback+"']();} catch(e){console.log('Callback f called: '+e.message); console.debug(e.stack)}";
		}			 
		
		return_to_client({
			xhr_key: xhr_key,
			status: error?404:200,
			statusText: error?"404 Not found":"200 OK",
			responseText: text,
			responseXML: null,
			responseType: error?null:manifest.files[url].mime.split("/").shift(),
			responseHeaders: {
				"Content-Type": manifest.files[url].mime
			},
			error: error
		});						
		return;
	};			
	var xhr_client = Views[view_key].xhrs[xhr_key] = Ti.Network.createHTTPClient();
	var boundary = "----WebKitFormBoundary"+getRandom();
	xhr_client.open(ev.method,unescape(ev.url));
	for(var i in ev.headers){
		var header = ev.headers[i];	
		if(header.key.toLowerCase() == "content-type" && header.val.match("multipart/form-data")){
			xhr_client.setRequestHeader("Content-Type","multipart/form-data; boundary=\""+boundary+"\"");
		}
		else xhr_client.setRequestHeader(header.key,header.val);
	}
	xhr_client.setRequestHeader("User-Agent",Views[view_key].view.evalJS("window.navigator.userAgent"));
	xhr_client.setRequestHeader("X-Requested-With",null);
	function getResponse(error){
		headers = {};
		headers["Content-Type"] = xhr_client.getResponseHeader("Content-Type");
		headers["Date"]  = xhr_client.getResponseHeader("Date");
		headers["Transfer-Encoding"]  = xhr_client.getResponseHeader("Transfer-Encoding");
		headers["Content-Type"] = xhr_client.getResponseHeader("Content-Type");
		xhr_client.getAllResponseHeaders().split("\r\n").map(function(a){
			a = a.split(":");
			headers[a[0]] = a[1];	
		});
		return_to_client({
			status: xhr_client.status,
			statusText: xhr_client.statusText,
			responseText: xhr_client.getResponseText(),
			responseXML: null,
			responseType: "",
			responseHeaders: headers,
			error: error
		});
	}
	xhr_client.onerror = function(e){
		getResponse(true);
	};
	xhr_client.onload = function(e){
		getResponse(false);
	};
	
	
	if (typeof ev.data == "string") {		
		return xhr_client.send(ev.data);	
	}
	var header = "";  
	for(var key in ev.data){
		var val = ev.data[key];
		header += "--"+boundary;
		header += "\r\nContent-Disposition: form-data; name=\""+key.toString()+"\"\r\n\r\n"+val.toString()+"\r\n";
	}			

	// Fileread part			
	// var content = Ti.Filesystem.getFile("tiproxy/xhr.js").read();  
	// header += "--"+boundary;
	// header += "\r\nContent-Disposition: form-data; name=\"file1\"; filename=\"xhr.js\"\r\n";
	// header += "Content-Type: application/octet-stream\r\n\r\n";
	// header += content;
	
	// if (!!ev.files){
		// for(var i in ev.files){
		// 				
		// }
	// }
	
	header += "\r\n--"+boundary+"--\r\n";
	// header += "Content-Disposition: form-data; name=\"" + name + "\";";  
	// header += "filename=\"" + filename + "\"\r\n";"; 
	// header += "Content-Type: application/octet-stream\r\n\r\n"; 
	
	xhr_client.send(header);	
};

Ti.App.addEventListener("xhr",get_request);

module.exports = {
	registerView: function(ev){
		if (ev.key in Views){
			Views[ev.key].view = ev.view;
			var interval = setInterval(function(){
				if (Views[ev.key].fallbacks.length == 0){
					clearInterval(interval);
					return;
				}
				get_request(Views[ev.key].fallbacks.shift());
			},500);
		}
		else {
			Views[ev.key] = {
				xhrs: {},
				view: ev.view,
				cookies: {},
				selected_files: {},
				fallbacks: []
			};	
		}
	}
};
