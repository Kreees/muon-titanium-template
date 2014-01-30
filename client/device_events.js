(function(){
	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	};
	
	window.CustomEvent = CustomEvent;
	
	if (window.m){
		m.exit = function(){ Ti.App.fireEvent("muon_exit",{}); };
		window.addEventListener("android:back",m.exit);
		m.__titanium_event = function(ev){
			try{window.dispatchEvent(new CustomEvent(ev,{}));}
			catch(e) {alert(e.message);}
		};
	}
})();
