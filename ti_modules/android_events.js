module.exports = {
	registerView: function(obj){
		["android:back","android:camera","android:focus","android:search","android:voldown","android:volup"].map(function(ev_type){
			obj.win.addEventListener(ev_type,function(){				
					obj.view.evalJS("m && m.__titanium_event('"+ev_type+"');");	
			});
		});	
	}
};
