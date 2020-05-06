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

	//Get the current text if needed.
	if (redText == 0) {
		redText = document.getElementById("redButton").innerHTML;
		if (redText == "") {
			redText = null;
		}
	}
	if (greenText == 0) {
		greenText = document.getElementById(greenButton").innerHTML;
		if (greenText == "") {
			greenText = null;
		}
	}
	if (yellowText == 0) {
		yellowText = document.getElementById("yellowButton").innerHTML;
		if (yellowText == "") {
			yellowText = null;
		}
	}
	if (blueText == 0) {
		blueText = document.getElementById("blueButton").innerHTML;
		if (blueText == "") {
			blueText = null;
		}
	}
	if (returnText == 0) {
		returnText = document.getElementById("returnButton").innerHTML;
		if (returnText == "") {
			returnText = null;
		}
	}
	//Calculate an offset value if the label is longer than 5 characters.
	var redOffset = 0;
	if (redText != null) {
		redOffset = (redText.length > 5) ? (redText.length *6)+5 : 0;
	}
	var greenOffset = 0;
	if (greenText != null) {
		greenOffset = (greenText.length > 5) ? (greenText.length *6)+5  : 0;
	}
	var yellowOffset = 0;
	if (yellowText != null) {
		yellowOffset = (yellowText.length > 5) ? (yellowText.length *6)+5 : 0;
	}
	var blueOffset = 0;
	if (blueText != null){
		blueOffset = (blueText.length > 5) ? (blueText.length *6)+5 : 0;
	}
	var returnOffset = 0;
	if (returnText != null) {
		returnOffset = (returnText.length > 5) ? (returnText.length *6)+5 : 0;
	}
	//Add the offset values to item's standard position.
	var redPos = (redText == null) ? 0 : 602;
	redPos = redPos + redOffset + greenOffset + yellowOffset + blueOffset + returnOffset;
	var greenPos = (greenText == null) ? 0 : 468;
	greenPos = greenPos + greenOffset + yellowOffset + blueOffset + returnOffset;
	var yellowPos = (yellowText == null) ? 0 : 322;
	yellowPos = yellowPos + yellowOffset + blueOffset + returnOffset;
	var bluePos = (blueText == null) ? 0 : 185;
	bluePos = bluePos + blueOffset + returnOffset;
	var returnPos = (returnText == null) ? 0 : 75;
	returnPos = returnPos + returnOffset;
	//This section moves the items right if some are not being displayed.
	if (returnText == null) {
		bluePos = bluePos -90;
		yellowPos = yellowPos -90;
		greenPos = greenPos -90;
		redPos = redPos -90;
	}
	if (blueText == null) {
		yellowPos = yellowPos -150;
		greenPos = greenPos -150;
		redPos = redPos -150;
	}
	if (yellowText == null) {
		greenPos = greenPos -130;
		redPos = redPos -130;
	}
	if (greenText == null) {
		redPos = redPos -150;
	}
	//Set control button visibility, inner text and position.
	if (redText == null) {
		document.getElementById("redButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("redButton", null);
	} else {
		document.getElementById("redButton").style.visibility = "";
		Support.widgetPutInnerHTML("redButton", redText);
		document.getElementById("redButton").style.right = redPos + "px";
	}
	if (greenText == null) {
		document.getElementById("greenButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("greenButton", null);
	} else {
		document.getElementById("greenButton").style.visibility = "";
		Support.widgetPutInnerHTML("greenButton", greenText);
		document.getElementById("greenButton").style.right = greenPos + "px";
	}
	if (yellowText == null) {
		document.getElementById("yellowButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("yellowButton", null);
	} else {
		document.getElementById("yellowButton").style.visibility = "";
		Support.widgetPutInnerHTML("yellowButton", yellowText);
		document.getElementById("yellowButton").style.right = yellowPos + "px";
	}
	if (blueText == null) {
		document.getElementById("blueButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("blueButton", null);
	} else {
		document.getElementById("blueButton").style.visibility = "";
		Support.widgetPutInnerHTML("blueButton", blueText);
		document.getElementById("blueButton").style.right = bluePos + "px";
	}
	if (returnText == null) {
		document.getElementById("returnButton").style.visibility = "hidden";
		Support.widgetPutInnerHTML("returnButton", null);
	} else {
		document.getElementById("returnButton").style.visibility = "";
		Support.widgetPutInnerHTML("returnButton", returnText);
		document.getElementById("returnButton").style.right = returnPos + "px";
	}
};

