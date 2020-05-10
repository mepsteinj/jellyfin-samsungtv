var NewServer = {
	elementIds : [ "1","2","3","4","port","host"],
	inputs : [ null,null,null,null,null],
	ready : [ false,false,false,false,false],
};

NewServer.start = function() {
	alert("Page Enter : NewServer");
	Helper.setControlButtons(null, null, null, null, Main.messages.LabButtonReturn);
	//Insert html into page
	Support.widgetPutInnerHTML("pageContent",
	"<div class='newServer12key'>" +
	"<p style='padding-bottom:5px;'>" + Main.messages.LabEnterIP + "</p>" +
	"<form>" +
	"<input id='1' type='text' size='5' maxlength='3' value=''/>." +
	"<input id='2' type='text' size='5' maxlength='3' value=''/>." +
	"<input id='3' type='text' size='5' maxlength='3' value=''/>." +
	"<input id='4' type='text' size='5' maxlength='3' value=''/>:" +
	"<input id='port' type='text' size='8' maxlength='5' value=''/>" +
	"</form>" +
	"<p style='padding-top:10px;padding-bottom:5px'>" + Main.messages.LabOr + "</p>" +
	"<p style='padding-bottom:5px'>" + Main.messages.LabEnterHost + "</p>" +
	"<form>" +
	"<input id='host' style='z-index:10;' type='text' size='45' value=''/>" +
	"</form>" +
	"</div>");
	Support.removeSplashScreen();
	document.getElementById("topPanel").style.visibility = "";
	
	//Prepare all input elements for IME
	NewServer.createInputObjects();
	pluginAPI.registIMEKey();
};

//Prepare all input elements for IME on Load!
NewServer.createInputObjects = function() {
	var previousIndex = 0;
	var nextIndex = 0;
	for (var index in this.elementIds) {
		previousIndex = index - 1;
		if (previousIndex < 0) {
			previousIndex = NewServer.inputs.length - 1;
		}
		nextIndex = (previousIndex + 2) % NewServer.inputs.length;
		this.inputs[index] = new NewServerInput(this.elementIds[index],this.elementIds[previousIndex], this.elementIds[nextIndex]);
	}
};

//Function to check if IME is ready, and when so sets focus on first element in array
NewServer.ready = function(id) {
	var ready = true;
	for (var i in this.elementIds) {
		if (this.elementIds[i] == id) {
			this.ready[i] = true;
		}
		if (this.ready[i] == false) {
			ready = false;
		}
	}
	if (ready) {
		document.getElementById(this.elementIds[0]).focus();
	}
};

//Function to delete all the contents of the boxes
NewServer.deleteAllBoxes = function(currentId) {
	for (var index = 0;index < this.elementIds.length;index++) {
		document.getElementById(this.elementIds[index]).value="";
	}
};

//IME Key Handler
var NewServerInput  = function(id, previousId, nextId) {
	var imeReady = function(imeObject) {
		installFocusKeyCallbacks();
		NewServer.ready(id);
	};
	
	var ime = new IMEShell(id, imeReady, 'en');
	ime.setKeypadPos(1310,250);
	ime.setMode('_num');
	
	var previousElement = document.getElementById(previousId);
	var nextElement = document.getElementById(nextId);
	
	var installFocusKeyCallbacks = function() {
		ime.setKeyFunc(tvKey.KEY_ENTER, function(keyCode) {
			alert("Enter key pressed");
			Notifications.setNotification(Main.messages.LabPleaseWait, Main.messages.LabCheckDetails, true);
			//Get content from 4 boxes
			var IP1 = document.getElementById('1').value;
			var IP2 = document.getElementById('2').value;
			var IP3 = document.getElementById('3').value;
			var IP4 = document.getElementById('4').value;
			var host = document.getElementById('host').value;
			if (IP1 == "" || IP2 == "" || IP3 == "" || IP4 == "" ) {
				//Check if host is empty
				if (host == "") {
					//not valid
					Notifications.setNotification(Main.messages.LabPleaseReenter, Main.messages.LabIncorDetails, true);
				} else {
					document.getElementById("pageContent").focus();
					//Timeout required to allow notification command above to be displayed
					setTimeout(function(){Server.testConnectionSettings(host,false);}, 1000);
				}
			} else {
				var Port = document.getElementById('port').value;
				if (Port == "") {
					Port = "8096";
				}
				var ip = IP1 + '.' +  IP2 + '.' +  IP3 + '.' +  IP4 + ':' + Port;
				document.getElementById("pageContent").focus();
				//Timeout required to allow notification command above to be displayed
				setTimeout(function(){Server.testConnectionSettings(ip,false);}, 1000);
			}
		});
		ime.setKeyFunc(tvKey.KEY_LEFT, function(keyCode) {
			previousElement.focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_RIGHT, function(keyCode) {
			nextElement.focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_UP, function(keyCode) {
			document.getElementById("1").focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_DOWN, function(keyCode) {
			document.getElementById("host").focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_BLUE, function(keyCode) {
			ime.setString(""); //Clears the currently focused Input - REQUIRED
			this.deleteAllBoxes();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_RETURN, function(keyCode) {
			widgetAPI.blockNavigation(event);
			var fileJson = JSON.parse(File.loadFile());
			if (fileJson.Servers.length > 0) {
				document.getElementById("pageContent").focus();
				Servers.start();
			} else {
				widgetAPI.sendReturnEvent();
			}
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_EXIT, function(keyCode) {
			widgetAPI.sendExitEvent();
			return false;
		});
	};
};