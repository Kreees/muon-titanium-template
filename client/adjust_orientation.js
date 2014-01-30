window.addEventListener("load",function(){
	var meta = document.head.querySelectorAll("meta[name='viewport']");
	meta = meta[meta.length - 1];
	if (!meta) return;
	content = (meta.content?meta.content:"").split(",").map(function(a){
		a = a.split("=");
		return a;
	});
	for(var i=0,len=metas.length;i<len;i++){
		(metas[i].name == "viewport") && (meta = metas[i]); 
	}
	var data = meta.content.split(",");
});
