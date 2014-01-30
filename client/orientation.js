(function(w){
	var metas = document.head.getElementsByTagName("meta");
	var meta = null;
	for(var i=0,len=metas.length;i<len;i++){
		(metas[i].name == "viewport") && (meta = metas[i]); 
	}
	
	var last_touch = null;
	
	window.addEventListener("touchstart",function(e){
		var ts = e.timeStamp;
		if (!last_touch || ts - last_touch > 500 || e.fingers > 1){
			last_touch = ts;
			return;
		}
		last_touch = ts;
		e.preventDefault();				
	});
	
	window.addEventListener("orientationchange",function(){
		var new_meta = document.createElement("meta");
		new_meta.name = "viewport"; new_meta.content = meta.content;
		document.head.removeChild(meta);
		document.head.appendChild(new_meta);			
	});
})(window);
