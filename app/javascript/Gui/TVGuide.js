//The currently visible TV guide is held in a multidimensional array called programGrid.
//programGrid gets refilled each time the TV guides moves either to an earlier or later time or up or down the list of channels.
//Each row is an array of programs. Each program is an array containing the channel ID and the program ID.
//Therefore this.programGrid[this.selectedRow][this.selectedColumn][1] is the ID of the currently selected program.
//Some other examples might be..
//this.programGrid[this.selectedRow][this.selectedColumn][0] = the ID of this channel.
//this.programGrid[this.selectedRow][this.selectedColumn+1][1] = the ID of the program on next.
//this.programGrid[this.selectedRow+1][this.selectedColumn][1] = the ID of the current program on the next channel.
//Once you've got your ID you can go look for it in this.Channels or this.Programs to find out more.
//Row -1 is the banner menu. Column -1 is the channel name list.

var TVGuide = {
	Programs : null,
	Channels : null,
	programGrid : [],
	selectedRow : 0,
	selectedColumn : 0,
	selectedBannerItem : 0,
	topChannel : 0,
	guideStartTime : 0,
	bannerItems : ["Guide","Channels","Recordings"],
	currentView : "Guide",
	startParams : []
};

TVGuide.onFocus = function() {
	Helper.setControlButtons("Record  ",null, null, MusicPlayer.Status == "PLAYING" || MusicPlayer.Status == "PAUSED" ? "Music" : null, "Return");
};

TVGuide.start = function(title, url, selectedRow, selectedColumn, topChannel, startTime) {
	//Save Start Params
	this.startParams = [title,url];

	//Reset Values
	this.Programs = null;
	this.Channels = null;
	this.programGrid = [];
	this.selectedRow = selectedRow;
	this.selectedColumn = selectedColumn;
	this.selectedBannerItem = 0;
	this.topChannel = topChannel;
	this.guideStartTime = startTime;
	Support.widgetPutInnerHTML("counter", "");
	//Create the banner menu and program details.
	Support.widgetPutInnerHTML("pageContent", "<div id=bannerSelection class='bannerMenu'></div>" +
			"<div id='tvGuide' class='tvGuide'></div>" +
			"<div id='tvGuideProgramImage' class='tvGuideProgramImage'></div>" +
			"<div id=tvGuideProgramDetails class='tvGuideProgramDetails'>" +
				"<div id='tvGuideSubData' class='tvGuideSubData'></div>" +
				"<div id='tvGuideOverview' class='tvGuideOverview'></div>" +
			"</div>");

	//Populate the banner menu.
	var bannerSelection = "";
	for (var index = 0; index < this.bannerItems.length; index++) {
		bannerSelection += "<div id='bannerItem" + index + "'>"+this.bannerItems[index].replace(/_/g, ' ') + "</div>";
	}
	Support.widgetPutInnerHTML("bannerSelection", bannerSelection);

	//Load Data
	this.Channels = Server.getContent(url);

	if (this.Channels.Items.length > 0) {
		//Get Programs
		var channelIDs = "";
		for (var index = 0; index < this.Channels.Items.length; index++) {
			if (index == this.Channels.Items.length-1) {
				channelIDs += this.Channels.Items[index].Id;
			} else {
				channelIDs += this.Channels.Items[index].Id + ',';
			}
		}

		//Set the date range for the guide data request.
		//Minimum program ending time.
		var minEnd = this.guideStartTime;
		var minEndYear = minEnd.getUTCFullYear();
		var minEndMonth = minEnd.getUTCMonth()+1;
		var minEndDay = minEnd.getUTCDate();
		var minEndHour = minEnd.getUTCHours();
		var minEndMin = minEnd.getMinutes();
		if (minEndMin >= 30){
			minEndMin = "30";
		} else {
			minEndMin = "00";
		}
		if (minEndMonth < 10){minEndMonth = "0"+minEndMonth;}
		if (minEndDay < 10){minEndDay = "0"+minEndDay;}
		if (minEndHour < 10){minEndHour = "0"+minEndHour;}

		var minEndDate =   minEndYear + "-" + minEndMonth + "-" + minEndDay + "T"+ minEndHour + "%3A" + minEndMin + "%3A01.000Z";


		//Maximum start time. (24hour after the minimum end time).
		var maxStart = new Date();
		maxStart.setTime( minEnd.getTime() + 60*60*24*1000 - 60000);
		var maxStartMonth = maxStart.getUTCMonth()+1;
		var maxStartDay = maxStart.getUTCDate();
		var maxStartHour = maxStart.getUTCHours();
		var maxStartMin = maxStart.getMinutes();
		if (maxStartMin >= 29){
			maxStartMin = "29";
		} else {
			maxStartMin = "59";
		}
		if (maxStartMonth < 10){maxStartMonth = "0"+maxStartMonth;}
		if (maxStartDay < 10){maxStartDay = "0"+maxStartDay;}
		if (maxStartHour < 10){maxStartHour = "0"+maxStartHour;}

		var maxStartDate = minEndYear + "-" + maxStartMonth + "-" + maxStartDay + "T"+ maxStartHour + "%3A" + maxStartMin + "%3A59.000Z";

		//Request the program data.
		var programsURL = Server.getServerAddr() + "/LiveTv/Programs?UserId=" + Server.getUserID() + "&MaxStartDate="+maxStartDate+"&MinEndDate="+minEndDate+"&channelIds=" + channelIDs + "&ImageTypeLimit=1&EnableImages=false&SortBy=StartDate&EnableTotalRecordCount=false&EnableUserData=false";
		this.Programs = Server.getContent(programsURL);
	}
	if (this.Programs.Items.length > 0) {
		this.updateDisplayedItems();
		this.updateSelectedItems();

	} else {
	  Support.widgetPutInnerHTML("tvGuide", "Hmm, it looks like there is no guide data right now.");
		this.selectedRow = -1;
		this.updateSelectedItems();
	}
	//Set Focus for Key Events
	document.getElementById("evnTVGuide").focus();
};

TVGuide.updateDisplayedItems = function() {
	//Create Table
	var d = Support.tvGuideStartTime(this.guideStartTime);
	var offset = File.getTVProperty("ClockOffset");
	var hour = d.getHours()+offset;
	var minute = d.getMinutes();
	var nextHour = hour+1;
	if (nextHour >= 24){nextHour = nextHour -24;}
	var subsequentHour = nextHour+1;
	if (subsequentHour >= 24){subsequentHour = subsequentHour -24;}
	var finalHour = subsequentHour+1;
	if (finalHour >= 24){finalHour = finalHour -24;}
	var htmlToAdd = "<div id='tvGuideTopLine' class='tvGuideTopLine'>";
	if (minute < 30) {
		htmlToAdd +=    "<div id='tvGuideDay' class='tvGuideDay highlight"+Main.highlightColour+"Background'>Today</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + hour + ":00</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + hour + ":30</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + nextHour + ":00</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + nextHour + ":30</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + subsequentHour + ":00</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + subsequentHour + ":30</div>";
	} else {
		htmlToAdd +=    "<div id='tvGuideDay' class='tvGuideDay highlight"+Main.highlightColour+"Background'>Today</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + hour + ":30</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + nextHour + ":00</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + nextHour + ":30</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + subsequentHour + ":00</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + subsequentHour + ":30</div>" +
						"<div class='tvGuideHour highlight"+Main.highlightColour+"Background'>" + finalHour + ":00</div>";
	}
	htmlToAdd +=    "</div>";
	for (var index = 0; index < this.Channels.Items.length - this.topChannel; index++) {
		htmlToAdd +=    "<div id='Row" + this.Channels.Items[index + this.topChannel].Id + "' class=tvGuideChannelLine>";
		if (this.Channels.Items[index + this.topChannel].ImageTags.Primary){
			var imgsrc = Server.getImageURL(this.Channels.Items[index + this.topChannel].Id,"Primary",300,300,0,false,0);
			htmlToAdd +=    "<div id='" + this.Channels.Items[index + this.topChannel].Id + "' class='tvGuideChannelName tvGuideChannelNameBg' style=background-image:url(" +imgsrc+ ")>" + this.Channels.Items[index + this.topChannel].Number + ":</div>";
		} else {
			htmlToAdd +=    "<div id='" + this.Channels.Items[index + this.topChannel].Id + "' class='tvGuideChannelName tvGuideChannelNameBg'>" + this.Channels.Items[index + this.topChannel].Number + ": " + this.Channels.Items[index + this.topChannel].Name + "</div>";
		}
		var channelLineWidth = 0;
		var programsInThisLine = [];
		var live = false;
		for (var programIndex = 0; programIndex < this.Programs.Items.length; programIndex++) {
			if (this.Channels.Items[index + this.topChannel].Id == this.Programs.Items[programIndex].ChannelId) {
				//7.9px = 1min (Obviously fractions of a pixels are not possible but we want to avoid compound error. We'll round it later with ~~programWidth.)
				var programWidth = 0;
				var programStartDate = new Date(this.Programs.Items[programIndex].StartDate);
				var hiddenMins = (this.guideStartTime.getTime() - programStartDate.getTime()) / 60000;
				if (hiddenMins < 0) {
					hiddenMins = 0;
				}
				programWidth = (Support.tvGuideProgramDurationMins(this.Programs.Items[programIndex]) - hiddenMins) *7.9;
				var currentChannelLineWidth = channelLineWidth;
				channelLineWidth = channelLineWidth + programWidth + 8; //the extra 8 pixels are the CSS border and margin.
				if (channelLineWidth >= 1450) {
					programWidth = 1450 - currentChannelLineWidth - 8;
				}
				if (programWidth > 10) {
					var bgColour = "";
					if (this.Programs.Items[programIndex].IsNews) {
						bgColour = "background-color:rgba(82,51,120,1);";
					} else if (this.Programs.Items[programIndex].IsSports) {
						bgColour = "background-color:rgba(10,124,51,1);";
					} else if (this.Programs.Items[programIndex].IsKids) {
						bgColour = "background-color:rgba(11,72,125,1);";
					} else if (this.Programs.Items[programIndex].IsMovie) {
						bgColour = "background-color:rgba(164,57,19,1);";
					}
					htmlToAdd +=    "<div id='" + this.Programs.Items[programIndex].Id + "' class='tvGuideProgram tvGuideProgramBg' style='width:" + ~~programWidth + "px'>";

					if (live == false && Support.tvGuideProgramElapsedMins(this.Programs.Items[programIndex]) > 0 && Support.tvGuideProgramElapsedMins(this.Programs.Items[programIndex]) < Support.tvGuideProgramDurationMins(this.Programs.Items[programIndex])) {
						htmlToAdd +=    "<div id='tvGuideProgramName' class=tvGuideProgramName><font color=red>Live: </font>" + this.Programs.Items[programIndex].Name + "</div>";
						live = true;
					} else {
						htmlToAdd +=    "<div id='tvGuideProgramName' class=tvGuideProgramName>" + this.Programs.Items[programIndex].Name + "</div>";
					}
					var startDate = new Date(this.Programs.Items[programIndex].StartDate);
					var startHours = startDate.getHours()+offset;
					var startMinutes = startDate.getMinutes();
					if (startMinutes < 10){startMinutes = "0"+startMinutes;}
					var endDate = new Date(this.Programs.Items[programIndex].EndDate);
					var endHours = endDate.getHours()+offset;
					var endMinutes = endDate.getMinutes();
					if (endMinutes <10){endMinutes = "0"+endMinutes;}
					var timeStr = startHours + ":" + startMinutes + " - " + endHours + ":" + endMinutes;
					htmlToAdd +=        "<div id='tvGuideProgramTime' class=tvGuideProgramTime>" + timeStr + "</div>" +
										"<div id='tvGuideProgramGenre' class=tvGuideProgramGenre style='" + bgColour + "'></div>";
					if (this.Programs.Items[programIndex].TimerId){
						htmlToAdd +=    "<div id='tvGuideProgramScheduled' class=tvGuideProgramScheduled></div>";
					}
					if (this.Programs.Items[programIndex].SeriesTimerId){
						htmlToAdd +=    "<div id='tvGuideSeriesScheduled' class=tvGuideSeriesScheduled></div>";
					}
					htmlToAdd +=    "</div>";
					programsInThisLine.push([this.Channels.Items[index + this.topChannel].Id,this.Programs.Items[programIndex].Id]);
				}
				if (channelLineWidth >= 1450) {
					break;
				}
			}
		}
		htmlToAdd += "</div>";
		this.programGrid[index] = programsInThisLine;
		if (this.programGrid.length == 7){
			break;
		}
	}
	var timeLineHeight = 80 + (this.programGrid.length * 104);
	var timeLinePos = 355 + (Support.tvGuideOffsetMins() * 7.9);
	htmlToAdd += "<div id='tvGuideCurrentTime' class='tvGuideCurrentTime' style='height:" + timeLineHeight + "px;left:" + timeLinePos + "px;'>";
	Support.widgetPutInnerHTML("tvGuide", htmlToAdd);
};

TVGuide.updateSelectedItems = function () {
	//Check in case the defaults point to a channel line with no program data.
	if (this.selectedRow == 0 && this.selectedColumn == 0 && this.programGrid[0].length == 0){
		this.selectedColumn = -1;
	}
	if (this.selectedColumn == -1) {
		for (var rowIndex = 0; rowIndex < this.programGrid.length; rowIndex++) {
			if (rowIndex == this.selectedRow) {
				document.getElementById(this.Channels.Items[rowIndex + this.topChannel].Id).className = "tvGuideChannelName highlight"+Main.highlightColour+"Background";
			} else {
				document.getElementById(this.Channels.Items[rowIndex + this.topChannel].Id).className = "tvGuideChannelName tvGuideChannelNameBg";
			}
		}
		for (var rowIndex = 0; rowIndex < this.programGrid.length; rowIndex++) {
			for (var columnIndex = 0; columnIndex < this.programGrid[rowIndex].length; columnIndex++) {
				//if (this.programGrid[rowIndex][columnIndex][1] !== undefined) {
					document.getElementById(this.programGrid[rowIndex][columnIndex][1]).className = "tvGuideProgram tvGuideProgramBg";
				//}
			}
		}
	} else {
		for (var rowIndex = 0; rowIndex < this.programGrid.length; rowIndex++) {
			document.getElementById(this.Channels.Items[rowIndex + this.topChannel].Id).className = "tvGuideChannelName tvGuideChannelNameBg";
		}
		for (var rowIndex = 0; rowIndex < this.programGrid.length; rowIndex++) {
			//alert(this.programGrid[rowIndex].length);
			for (var columnIndex = 0; columnIndex < this.programGrid[rowIndex].length; columnIndex++) {
				//alert("got here");
				if (columnIndex == this.selectedColumn && rowIndex == this.selectedRow) {
					document.getElementById(this.programGrid[rowIndex][columnIndex][1]).className = "tvGuideProgram highlight"+Main.highlightColour+"Background";
				} else {
					document.getElementById(this.programGrid[rowIndex][columnIndex][1]).className = "tvGuideProgram tvGuideProgramBg";
				}
			}
		}
	}
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem && this.selectedRow == -1) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlight"+Main.highlightColour+"Text";
			}
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == this.currentView) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == this.currentView) {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
	//Add program details under the guide.
	if (this.selectedRow >= 0) {
		var programmeURL = "";
		var programImage = "";
		if (this.selectedColumn == -1 && this.Channels.Items[this.selectedRow + this.topChannel].CurrentProgram !== undefined) {
			programmeURL = Server.getItemInfoURL(this.Channels.Items[this.selectedRow + this.topChannel].CurrentProgram.Id,"");
		} else if (this.programGrid[this.selectedRow][this.selectedColumn] !== undefined) {
			programmeURL = Server.getItemInfoURL(this.programGrid[this.selectedRow][this.selectedColumn][1],"");
		}
		if (programmeURL != ""){
			var ProgrammeDetails = Server.getContent(programmeURL);
			var subdata = "";
			var overview = "";
			if (this.selectedColumn == -1) {
				subdata = this.Channels.Items[this.selectedRow + this.topChannel].CurrentProgram.Name + ": " +
											  this.Channels.Items[this.selectedRow + this.topChannel].CurrentProgram.StartDate.substring(11,16) +
											  " - " + this.Channels.Items[this.selectedRow + this.topChannel].CurrentProgram.EndDate.substring(11,16);
				overview = ProgrammeDetails.Overview;
				if (this.Channels.Items[this.selectedRow + this.topChannel].CurrentProgram.ImageTags.Primary){
					programImage = Server.getImageURL(this.Channels.Items[this.selectedRow + this.topChannel].CurrentProgram.Id,"Primary",300,300,0,false,0);
				}
			} else {
				var program = this.getProgramFromId(this.programGrid[this.selectedRow][this.selectedColumn][1]);
				if (program) {
					subdata = program.Name + ": " + program.StartDate.substring(11,16) + " - " + program.EndDate.substring(11,16);
					if (program.TimerId){
						subdata +=  "<div id='tvGuideSubDataProgramScheduled' class=tvGuideSubDataProgramScheduled></div>";
					}
					if (program.SeriesTimerId){
						subdata +=  "<div id='tvGuideSubDataSeriesScheduled' class=tvGuideSubDataSeriesScheduled></div>";
					}
					overview = ProgrammeDetails.Overview;
				}
				if (ProgrammeDetails.ImageTags.Primary){
					programImage = Server.getImageURL(ProgrammeDetails.Id,"Primary",300,300,0,false,0);
				}
			}
			document.getElementById("tvGuideProgramImage").style.backgroundImage = "url(" +programImage+ ")";
			Support.widgetPutInnerHTML("tvGuideSubData", subdata);
			Support.widgetPutInnerHTML("tvGuideOverview", overview);
		}
	}
};

TVGuide.getProgramFromId = function(programId){
	var program = null;
	for (var programIndex = 0; programIndex < this.Programs.Items.length; programIndex++) {
		if (this.Programs.Items[programIndex].Id == programId) {
			program = this.Programs.Items[programIndex];
		}
	}
	return program;
};

TVGuide.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("notifications").style.visibility == "") {
		Notifications.delNotification();
		widgetAPI.blockNavigation(event);
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}

	//Update Screensaver Timer
	Support.screensaver();

	//If screensaver is running
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		//End Screensaver
		GuiImagePlayerScreensaver.stopScreensaver();
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}

	switch(keyCode) {
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.processRightKey();
			break;
		case tvKey.KEY_UP:
			alert("UP");
			this.processUpKey();
			break;
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey();
			break;
		case tvKey.KEY_PANEL_CH_UP:
		case tvKey.KEY_CH_UP:
			this.processChannelUpKey();
			break;
		case tvKey.KEY_PANEL_CH_DOWN:
		case tvKey.KEY_CH_DOWN:
			this.processChannelDownKey();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			this.processSelectedItem();
			break;
		case tvKey.KEY_PLAY:
			this.playCurrentChannel();
			break;
		case tvKey.KEY_RED:
			alert("RECORD");
			this.processRecord();
			break;
		case tvKey.KEY_BLUE:
			//Focus the music player
			if (this.selectedRow == -1) {
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					MusicPlayer.showMusicPlayer("TVGuide", "bannerItem"+this.selectedBannerItem, "bannerItem highlight" + Main.highlightColour + "Text");
				} else {
					MusicPlayer.showMusicPlayer("TVGuide", "bannerItem"+this.selectedBannerItem, "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
				}
			} else if (this.selectedColumn == -1) {
				MusicPlayer.showMusicPlayer("TVGuide",this.Channels.Items[this.selectedRow + this.topChannel].Id, "tvGuideChannelName highlight" + Main.highlightColour + "Background");
			} else {
				MusicPlayer.showMusicPlayer("TVGuide", this.programGrid[this.selectedRow][this.selectedColumn][1], "tvGuideProgram highlight" + Main.highlightColour + "Background");
			}
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("TVGuide", this.startParams[0],this.startParams[1], null, null, this.selectedRow, this.topChannel, null);
			MainMenu.requested("TVGuide", this.ItemData.Items[this.selectedRow].Id);
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

TVGuide.openMenu = function() {
	if (this.selectedRow == -1) { //Banner menu
		document.getElementById("bannerItem0").className = "bannerItem bannerItemPadding offWhite";
		MainMenu.requested("TVGuide", "bannerItem0","bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
	} else { //Channel column
		document.getElementById(this.Channels.Items[this.selectedRow + this.topChannel].Id).className = "tvGuideChannelName tvGuideChannelNameBg";
		MainMenu.requested("TVGuide",this.Channels.Items[this.selectedRow + this.topChannel].Id,"tvGuideChannelName highlight"+Main.highlightColour+"Background");
	}
};

TVGuide.processLeftKey = function() {
	var nowTime = new Date();
	if (this.selectedRow < 0) {
		//Move left along the banner menu.
		this.selectedBannerItem--;
		if (this.selectedBannerItem == -1){
			this.selectedBannerItem = 0;
			this.openMenu();
		}
		this.updateSelectedItems();
	} else if (this.selectedColumn > 0) {
		//Move left in the guide grid.
		this.selectedColumn--;
		this.updateSelectedItems();
	} else if (this.selectedColumn == -1) {
		//Open the main menu.
		this.openMenu();
	} else if (nowTime.getTime() - this.guideStartTime.getTime()  > 300000){
		//Move to the channel names column.
		this.selectedColumn = -1;
		this.updateSelectedItems();
	} else {
		//Refocus the guide time.
		var guideTime = new Date();
		guideTime.setTime(this.guideStartTime.getTime() - 9000000); //move the clock back 2.5 hours.
		TVGuide.start("Guide",this.startParams[1],this.selectedRow,0,this.topChannel,guideTime);
	}
};

TVGuide.processRightKey = function() {
	if (this.selectedRow < 0) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem == this.bannerItems.length){
			this.selectedBannerItem--;
		}
		this.updateSelectedItems();
	} else if (this.selectedColumn < this.programGrid[this.selectedRow].length-1) {
		this.selectedColumn++;
		this.updateSelectedItems();
	} else if (this.programGrid[this.selectedRow].length > 0) {
		var guideTime = new Date();
		guideTime.setTime(this.guideStartTime.getTime() + 9000000); //move the clock forward 2.5 hours.
		//this.guideStartTime = guideTime;
		//this.updateDisplayedItems();
		//this.updateSelectedItems();
		TVGuide.start("Guide",this.startParams[1],this.selectedRow,0,this.topChannel,guideTime);
	} else {
		//Nowhere to move right to.
	}
};

TVGuide.processUpKey = function() {
	if (this.selectedRow > 0) { //Move up a row.
		while (this.selectedColumn > this.programGrid[this.selectedRow-1].length-1) {
			this.selectedColumn--;
		}
		this.selectedRow--;
		this.updateSelectedItems();
	} else if (this.topChannel > 0) { //Scroll up a page.
		var newTopChannel = this.topChannel - 7;
		if (this.selectedColumn == -1) {
			TVGuide.start("Guide",this.startParams[1],6,-1,newTopChannel,this.guideStartTime);
		} else {
			TVGuide.start("Guide",this.startParams[1],6,0,newTopChannel,this.guideStartTime);
		}
	} else { //Move up to the banner menu.
		this.selectedRow--;
		if (this.selectedRow < -1) {
			this.selectedRow = -1;
		}
		this.updateSelectedItems();
	}
};

TVGuide.processChannelUpKey = function() {
	if (this.topChannel > 0) { //Scroll up a page.
		var newTopChannel = this.topChannel - 7;
		if (this.selectedColumn == -1) {
			this.start("Guide",this.startParams[1], 0, -1, newTopChannel, this.guideStartTime);
		} else {
			this.start("Guide", this.startParams[1], 0, 0, newTopChannel, this.guideStartTime);
		}
	} else { // If we're already on the first page, jump to the top row.
		if (this.selectedColumn == -1) {
			this.start("Guide", this.startParams[1], 0, -1, 0, this.guideStartTime);
		} else {
			TVGuide.start("Guide", this.startParams[1], 0, 0, 0, this.guideStartTime);
		}
	}
};

TVGuide.processDownKey = function() {
	if (this.selectedRow < this.programGrid.length-1) { //Move down a row.
		while (this.selectedColumn > this.programGrid[this.selectedRow+1].length-1) {
			this.selectedColumn--;
		}
		this.selectedRow++;
		this.updateSelectedItems();
	} else if (this.Channels.Items.length > this.topChannel + 7) { //Scroll down a page.
		var newTopChannel = this.topChannel + 7;
		if (this.selectedColumn == -1) {
			this.start("Guide", this.startParams[1], 0, -1, newTopChannel, this.guideStartTime);
		} else {
			this.start("Guide", this.startParams[1], 0, 0, newTopChannel, this.guideStartTime);
		}
	}
};

TVGuide.processChannelDownKey = function() {
	if (this.Channels.Items.length > this.topChannel + 7) { //Scroll down a page.
		var newTopChannel = this.topChannel + 7;
		if (this.selectedColumn == -1) {
			this.start("Guide", this.startParams[1], 0, -1, newTopChannel, this.guideStartTime);
		} else {
			this.start("Guide", this.startParams[1], 0, 0, newTopChannel, this.guideStartTime);
		}
	} else { // If we're already on the last page, jump to the bottom row.
		this.selectedRow = this.Channels.Items.length % 8;
		this.updateSelectedItems();
	}
};

TVGuide.processRecord = function () {
	if (this.selectedRow >= 0 && this.selectedColumn >= 0) {
		var programId = this.programGrid[this.selectedRow][this.selectedColumn][1];
		var program = this.getProgramFromId(programId);
		var timer = this.getNewLiveTvTimerDefaults(programId);
		if (!program.TimerId){
			this.createLiveTvTimer(timer);
		} else if (program.IsSeries && !program.SeriesTimerId){
			if (program.TimerId){
				this.cancelLiveTvTimer(program.TimerId);
			}
			this.createLiveTvSeriesTimer(timer);
		} else {
			if (program.SeriesTimerId){
				this.cancelLiveTvSeriesTimer(program.SeriesTimerId);
			}
			if (program.TimerId){
				this.cancelLiveTvTimer(program.TimerId);
			}
		}
	}
};

TVGuide.getTimers = function() {
	var url = Server.getServerAddr() + "/LiveTv/Timers";
	return Server.getContent(url);
};

TVGuide.getNewLiveTvTimerDefaults = function (options) {

	options = options || {};

	var url = Server.getServerAddr() + "/LiveTv/Timers/Defaults?programId=" + options;

	return Server.getContent(url);
};

TVGuide.createLiveTvTimer = function (item) {

	if (!item) {
		return;
	}

	var url = Server.getServerAddr() + "/LiveTv/Timers";

	Server.POST(url, item);
	Support.loading(1250);
	document.getElementById("noItems").focus();
	setTimeout(function(){
		TVGuide.start("Guide",TVGuide.startParams[1],TVGuide.selectedRow,TVGuide.selectedColumn,TVGuide.topChannel,TVGuide.guideStartTime);
	}, 1250);
};

TVGuide.createLiveTvSeriesTimer = function (item) {
	if (!item) {
		return;
	}
	var url = Server.getServerAddr() + "/LiveTv/SeriesTimers";
	Server.POST(url, item);
	Support.loading(1250);
	document.getElementById("noItems").focus();
	setTimeout(function(){
		TVGuide.start("Guide",TVGuide.startParams[1],TVGuide.selectedRow,TVGuide.selectedColumn,TVGuide.topChannel,TVGuide.guideStartTime);
	}, 1250);
};

TVGuide.cancelLiveTvSeriesTimer = function (id) {
	if (!id) {
		return;
	}

	var url = Server.getServerAddr() + "/LiveTv/SeriesTimers/" + id;

	Server.DELETE(url);
	Support.loading(1250);
	document.getElementById("noItems").focus();
	setTimeout(function(){
		TVGuide.start("Guide",TVGuide.startParams[1],TVGuide.selectedRow,TVGuide.selectedColumn,TVGuide.topChannel,TVGuide.guideStartTime);
	}, 1250);
};

TVGuide.cancelLiveTvTimer = function (id) {
	if (!id) {
		return;
	}

	var url = Server.getServerAddr() + "/LiveTv/Timers/" + id;

	Server.DELETE(url);
	Support.loading(1250);
	document.getElementById("noItems").focus();
	setTimeout(function(){
		TVGuide.start("Guide",TVGuide.startParams[1],TVGuide.selectedRow,TVGuide.selectedColumn,TVGuide.topChannel,TVGuide.guideStartTime);
	}, 1250);
};


TVGuide.processSelectedItem = function () {
	if (this.selectedRow == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "Guide":
			var url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&Limit=100&EnableFavoriteSorting=true&UserId=" + Server.getUserID());
			var guideTime = new Date();
			var timeMsec = guideTime.getTime();
			var startTime = timeMsec - 300000; //rewind the clock five minutes.
			guideTime.setTime(startTime);
			TVGuide.start("Guide",url,0,0,0,guideTime);
			break;
		case "Channels":
			Support.updateURLHistory("TVGuide",null,null,null,null,null,null,false);
			var url = Server.getCustomURL("/LiveTV/Channels?StartIndex=0&EnableFavoriteSorting=true&userId=" + Server.getUserID());
			GuiDisplaySeries.start("Channels LiveTV",url,0,0);
			break;
		case "Recordings":
			Support.updateURLHistory("TVGuide",null,null,null,null,null,null,false);
			var url = Server.getCustomURL("/LiveTV/Recordings?SortBy=StartDate&SortOrder=Descending&StartIndex=0&fields=SortName&UserId=" + Server.getUserID());
			GuiDisplaySeries.start("Recordings LiveTV",url,0,0);
			break;
		}
	} else {
		this.playCurrentChannel();
	}
};

TVGuide.playCurrentChannel = function () {
	if (this.selectedRow >= 0) {
		Support.updateURLHistory("TVGuide",this.startParams[0],this.startParams[1],null,null,this.selectedRow,this.topChannel,null);
		var url = Server.getItemInfoURL(this.Channels.Items[this.selectedRow + this.topChannel].Id,"");
		GuiPlayer.start("PLAY",url,0,page);
	}
};

TVGuide.returnFromMusicPlayer = function() {
	this.selectedRow = 0;
	this.updateDisplayedItems();
	this.updateselectedRows();
};