(function(w){
	function getRandom(){
		return (Math.floor(Math.random()*999999999) + 1000000000).toString(16);
	}
	
	w = window;
	var ignore_headers = ["Accept-Charset",
		"Accept-Encoding",
		"Access-Control-Request-Headers",
		"Access-Control-Request-Method",
		"Connection",
		"Content-Length",
		"Cookie",
		"Cookie2",	
		"Content-Transfer-Encoding",
		"Date",
		"Expect",
		"Host",
		"Keep-Alive",
		"Origin",
		"Referer",
		"TE",
		"Trailer",
		"Transfer-Encoding",
		"Upgrade",
		"User-Agent",
		"Via"
	];
			
	var ignore_headers_startswith = [
		"Sec-",
		"Proxy-"
	];	
	
	var XHR = w.XMLHttpRequest;
	var f = function(){		
		this.readyState = p.UNSENT;
		this.url = '';
		this.headers = [];
		
		this.onerror = null;
		this.onabort = null;
		this.onreadystatechange = null;
		this.onload = null;
		this.onloadend = null;
		this.onloadstart = null;
		this.onprogress = null;
		
		this.withCredentials = false;
	};
	
	// var rsch = function(state){
		// if (this instanceof f){
			// this.readyState = state;
			// var o = document.createEvent("Events");
			// o.initEvent("readystatechange",false,false)
			// this.dispatchEvent(o);
		// }
	// }
	
	var fd= (function(){{}
		var _prev_file = File;
		var fd = function(form){
			this.__key__ = getRandom();
			this.object = {},
			this.files = {};
		};
		fd.prototype.append = function(key,val){
			if (val instanceof _prev_file){
				return;
			}
			if (val instanceof File){
				this.files[key] = val.file_token;
				return;
			}
			if (key in this.object){
				if (!_.isArray(this.object[key])){
					this.object[key] = [this.object[key]];
				}
				this.object[key].push(val);					 
			}
			else this.object[key] = val;
		};
		return fd;
	})();
	
	var file = function(){};
	
	f.prototype = Object.create(XMLHttpRequest.prototype);
	p = f.prototype;
	
	p.UNSENT = 0;
	p.OPENED = 1;
	p.HEADERS_RECIEVED = 2;
	p.LOADING = 3;
	p.DONE = 4;
	
	p.open = function(method,url,async,user,password){
		this.readyState = p.OPENED;
		if (!method) throw Error("Method is not set");
		if ('string' != typeof method) throw Error("Wrong method argument");
		if (["GET","POST","PUT","DELETE",'HEAD'].indexOf(method.toUpperCase()) == -1) throw Error("Wrong method");
		this.method = method;
		if ('string' != typeof url) throw Error("Wrong url argument");
		this.url = url;
		async = !!async;
		this.async = async;
		if (!user) return;
		if ('string' != typeof user) throw Error("Wrong user argument");
		this.user = user;
		if (!password) return;
		if ('string' != typeof password) throw Error("Wrong password argument");
		this.password = password;
		if ('function' == typeof _this.onreadystatechange) _this.onreadystatechange(null,true);
	};
	
	p.abort = function(){		
		this.readyState = p.DONE;
		Ti.App.removeEventListener("xhr_abort."+xhr_key);
		if ('function' == typeof _this.onreadystatechange) _this.onreadystatechange(null,true);
		if ('function' == typeof _this.onabort) _this.onabort(null,true);
	};

	var __xhrs__ = {};
		
	window.__titanium_cb = function titanium_response(xhr_key){
		var data = window["__titanium_data_"+xhr_key];		
		var _this = __xhrs__[xhr_key];		
		delete __xhrs__[xhr_key];
		delete window["__titanium_data_"+xhr_key];
		try{data = JSON.parse(unescape(data));}		
		catch(e){alert(e.message); data = {error: true};}				
		setTimeout(function(){
			_this.readyState = p.DONE;			
			_this.status = data.status;
			_this.statusText = data.statusText;
			_this.responseText = data.responseText;
			_this.responseXML = data.responseXML;
			_this.responseType = data.responseType;
			responseHeaders = data.responseHeaders;
			_this.getResponseHeaders = function(str){			
				return responseHeaders[str];
			};
			_this.getAllResponseHeaders = function(){
				var ret = [];
				for(var i in responseHeaders){
					ret.push(i+":"+responseHeaders[i]);
				}			
				return ret.join("\r\n");
			};
			if ('function' == typeof _this.onreadystatechange) _this.onreadystatechange(null,false);
			if (!data.error) {if ('function' == typeof _this.onload) _this.onload();}
			else if ('function' == typeof _this.onerror) _this.onerror();
			if ('function' == typeof _this.onloadend) _this.onloadend();
		},1);
		return 10;			
	};
	
	p.send = function(data){
		var _this = this;
		var xhr_key = getRandom();
		__xhrs__[xhr_key] = this;
		
		this.readyState = p.LOADING;
		this.data = data;
		
		this.statusText = null;
		this.response = null;
		this.responseText = null;
		this.responseXML = null;
		this.responseType = null;
		this.responseBody = '';
		this.responseBlob = null;

		var responseHeaders = {};
				
		this.getResponseHeaders = function(str){			
			return responseHeaders[str];
		};
		this.getAllResponseHeaders = function(){
			var ret = [];
			for(var i in responseHeaders){
				ret.push(i+":"+responseHeaders[i]);
			}			
			return ret.join("\r\n");
		};
		this.overrideMimeType = function(){};	
		window["__titanium_data_"+xhr_key] = '';					
		Ti.App.fireEvent("xhr",{
			view_key: __titanium__key__,
			xhr_key: xhr_key,
			method: this.method,
			url: this.url,
			headers: this.headers,
			async: true,
			user: this.user,
			password: this.password,
			data: this.data
		});		
		
	};
	p.setRequestHeader = function(key,val){
		if ('string' != typeof key) throw Error("Wrong arguments");
		if (ignore_headers.indexOf(key) != -1) return;
		for(var i in ignore_headers_startswith){
			var ignore = ignore_headers_startswith[i];
			if (key.match(RegExp("^"+ignore))) return;
		}
		if(!!val) this.headers.push({
			key: key,
			val: val.toString()
		});
		else {
			var new_headers = [];
			for(var i = 0; i < this.headers.length; i++){
				if (this.headers[i].key != key) new_headers.push(this.headers[i]);
			}
			this.headers = new_headers;
		}
	};
	w.XMLHttpRequest = f;
	w.FormData = fd;	
	w.File = file;
})(window);
