Ti.App.addEventListener("command",function(cmd){
	var data;
	try	{data = eval(cmd.data);}
	catch(e){
		alert(e);
		Ti.App.fireEvent("command_resp",{data:"error"});
		return;
	}
	try {data = JSON.stringify(data);}
	catch(e) {data.toString();}
	Ti.App.fireEvent("command_resp",{data:data});
});