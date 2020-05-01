var GuiNewServer = {
	elementIds : [ "1","2","3","4","port","host"],
	inputs : [ null,null,null,null,null],
	ready : [ false,false,false,false,false],
};

GuiNewServer.start = function() {
	alert("Page Enter : GuiNewServer");
	GuiHelper.setControlButtons(null, null, null, null, Main.messages.LabButtonReturn);
	//Insert html into page
	var div = "<div class='guiNewServer12key'> \
		<p style='padding-bottom:5px;'>" +  Main.messages.LabEnterIP + "</p> \
		<form><input id='1' type='text' size='5'  maxlength='3' value=''/>. \
		<input id='2' type='text' size='5'  maxlength='3' value=''/>. \
		<input id='3' type='text' size='5'  maxlength='3' value=''/>. \
		<input id='4' type='text' size='5'  maxlength='3' value=''/>: \
		<input id='port' type='text' size='8'  maxlength='5'/></form> \ \
		<p style='padding-top:10px;padding-bottom:5px'>" + Main.messages.LabOr + "</p> \
		<p style='padding-bottom:5px'>" + Main.messages.LabEnterHost + "</p> \
		<form><input id='host' style='z-index:10;' type='text' size='45' value=''/></form> \
		</div>";
	Support.widgetPutInnerHTML("pageContent", div);
	//Set Backdrop
	Support.fadeImage("images/bg1.jpg");
	Support.removeSplashScreen();
	//Prepare all input elements for IME
	GuiNewServer.createInputObjects();
	pluginAPI.registIMEKey();
};

//Prepare all input elements for IME on Load!
GuiNewServer.createInputObjects = function() {
	var previousIndex = 0;
	var nextIndex = 0;
	for (var index in this.elementIds) {
		previousIndex = index - 1;
		if (previousIndex < 0) {
			previousIndex = GuiNewServer.inputs.length - 1;
		}
		nextIndex = (previousIndex + 2) % GuiNewServer.inputs.length;
		GuiNewServer.inputs[index] = new GuiNewServerInput(this.elementIds[index],this.elementIds[previousIndex], this.elementIds[nextIndex]);
	}
};

//Function to check if IME is ready, and when so sets focus on first element in array
GuiNewServer.ready = function(id) {
	var ready = true;
	for (var i in GuiNewServer.elementIds) {
		if (GuiNewServer.elementIds[i] == id) {
			GuiNewServer.ready[i] = true;
		}
		if (GuiNewServer.ready[i] == false) {
			ready = false;
		}
	}
	if (ready) {
		document.getElementById(GuiNewServer.elementIds[0]).focus();
	}
};

//Function to delete all the contents of the boxes
GuiNewServer.deleteAllBoxes = function(currentId) {
	for (var index = 0;index < GuiNewServer.elementIds.length;index++) {
		document.getElementById(GuiNewServer.elementIds[index]).value="";
	}
};

//IME Key Handler
var GuiNewServerInput  = function(id, previousId, nextId) {
	var imeReady = function(imeObject) {
		installFocusKeyCallbacks();
		GuiNewServer.ready(id);
	};
	
	var ime = new IMEShell(id, imeReady, 'en');
	ime.setKeypadPos(1300,200);
	ime.setMode('_num');
	var previousElement = document.getElementById(previousId);
	var nextElement = document.getElementById(nextId);
	
	var installFocusKeyCallbacks = function () {
		ime.setKeyFunc(tvKey.KEY_ENTER, function (keyCode) {
			alert("Enter key pressed");
			GuiNotifications.setNotification(Main.messages.LabPleaseWait, Main.messages.LabCheckDetails, true);
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
					GuiNotifications.setNotification(Main.messages.LabPleaseReenter, Main.messages.LabIncorDetails, true);
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
		ime.setKeyFunc(tvKey.KEY_LEFT, function (keyCode) {
			previousElement.focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_RIGHT, function (keyCode) {
			nextElement.focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_UP, function (keyCode) {
			document.getElementById("1").focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_DOWN, function (keyCode) {
			document.getElementById("host").focus();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_BLUE, function (keyCode) {
			ime.setString(""); //Clears the currently focused Input - REQUIRED
			GuiNewServer.deleteAllBoxes();
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_RETURN, function (keyCode) {
			widgetAPI.blockNavigation(event);
			var fileJson = JSON.parse(File.loadFile());
			if (fileJson.Servers.length > 0) {
				document.getElementById("pageContent").focus();
				GuiServers.start();
			} else {
				widgetAPI.sendReturnEvent();
			}
			return false;
		});
		ime.setKeyFunc(tvKey.KEY_EXIT, function (keyCode) {
			widgetAPI.sendExitEvent();
			return false;
		});
	};
};