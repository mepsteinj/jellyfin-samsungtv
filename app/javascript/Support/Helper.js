var Helper = {
	helpPage : null
};

Helper.getHelpPage = function() {
  return this.helpPage;
};

//------------------------------------------------------------------------------------------------
//Helper isn't its own window, it just controls the help contents at the bottom of the screen
//------------------------------------------------------------------------------------------------

Helper.toggleHelp = function(helpPage) {
	if (document.getElementById("imagePlayerScreenSaverOverlay").style.visibility == ""){
		document.getElementById("imagePlayerScreenSaverOverlay").style.visibility = "hidden";
	}
	Helper.setHelpPage(helpPage);
	//Unhide help window
	document.getElementById("Help").style.visibility = "";
	//Set focus
	document.getElementById("envHelper").focus();
};

Helper.keyDown = function() {
	var keyCode;
	if (event) {
	 keyCode = event.keyCode;
	} else {
		return;
	}
	switch(keyCode) {
		case tvKey.KEY_YELLOW:
		case tvKey.KEY_RETURN:
			//Stops Return causing the app to exit when closing help text.
			widgetAPI.blockNavigation(event);
			if (document.getElementById("imagePlayerScreenSaverOverlay").style.visibility == "hidden"){
				document.getElementById("imagePlayerScreenSaverOverlay").style.visibility = "";
			}
			//If required for Screensaver call in ImagePlayerScreensaver
			if (document.getElementById("help").style.visibility == "") {
				//Hide help window
				document.getElementById("help").style.visibility = "hidden";

				//Set focus back to original page
				document.getElementById(this.helpPage).focus();
			}
			break;
	}
};

Helper.setHelpPage = function(helpPage) {
  this.helpPage = helpPage;
	Support.widgetPutInnerHTML("helpTitle", Main.messages.LabHelpPage);
	Support.widgetPutInnerHTML("helpContent", this.generateDisplayOneItemHelp());
};

Helper.generateDisplayOneItemHelp = function() {
	var htmlToAdd = "";
	if (this.getHelpPage() == "ImagePlayer") {
		htmlToAdd = Main.messages.LabHelpImagePlayer;
	} else {
		htmlToAdd = Main.messages.LabHelpOtherPlayer;
	}
	return htmlToAdd;
};

Helper.setControlButtons = function(redText, greenText, yellowText, blueText, returnText) {
	//Displays the coloured remote control buttons on screen to indicate their current function.
	//Each parameter is the button text. A null value means the button is hidden, 0 means don't change it.
	//The position value is calculated to group the visible buttons on the right.
	//The offset allows for longer labels.
		
	var buttonOffset = 90;
	var returnWidth = 0;
	var returnRight = 0;
	var blueWidth = 0;
	var blueRight = 0;
	var yellowWidth = 0;
	var yellowRight = 0;
	var greenWidth = 0;
	var greenRight = 0;
	var redWidth = 0;
	var redRight = 0;
	
	//Set control button visibility, inner text and position.
	if (returnText == null) {
		document.getElementById("returnButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("returnButton", "");
	} else {
		document.getElementById("returnButton").style.visibility = "";
		Support.widgetPutInnerHTML("returnButton", returnText);
		returnWidth = (returnText.length * 14) + 90
		returnRight = buttonOffset;
		document.getElementById("returnButton").style.right = returnRight + "px";
		document.getElementById("returnButton").style.width = returnWidth + "px";		
		buttonOffset += returnWidth;
	}		
	if (blueText == null) {
		document.getElementById("blueButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("blueButton", "");
	} else {
		document.getElementById("blueButton").style.visibility = "";
		Support.widgetPutInnerHTML("blueButton", blueText);
		blueWidth = (blueText.length * 14) + 90;
		blueRight = buttonOffset;
		document.getElementById("blueButton").style.right = blueRight + "px";
		document.getElementById("blueButton").style.width = blueWidth + "px";		
		buttonOffset += blueWidth;
	}
	if (yellowText == null) {
		document.getElementById("yellowButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("yellowButton", "");
	} else {
		document.getElementById("yellowButton").style.visibility = "";
		Support.widgetPutInnerHTML("yellowButton", yellowText);
		yellowWidth = (yellowText.length * 14) + 90;
		yellowRight = buttonOffset;
		document.getElementById("yellowButton").style.right = yellowRight + "px";
		document.getElementById("yellowButton").style.width = yellowWidth + "px";		
		buttonOffset += yellowWidth;
	}	
	if (greenText == null) {
		document.getElementById("greenButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("greenButton", "");
	} else {
		document.getElementById("greenButton").style.visibility = "";
		Support.widgetPutInnerHTML("greenButton", greenText);
		greenWidth = (greenText.length * 14) + 90;
		greenRight = buttonOffset;
		document.getElementById("greenButton").style.right = greenRight + "px";		
		document.getElementById("greenButton").style.width = greenWidth + "px";
		buttonOffset += greenWidth;
	}	
	if (redText == null) {
		document.getElementById("redButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("redButton", "");
	} else {
		document.getElementById("redButton").style.visibility = "";
		Support.widgetPutInnerHTML("redButton", redText);
		redWidth = (redText.length * 14) + 90;
		redRight = buttonOffset;
		document.getElementById("redButton").style.right = redRight + "px";		
		document.getElementById("redButton").style.width = redWidth + "px";
	}
};

