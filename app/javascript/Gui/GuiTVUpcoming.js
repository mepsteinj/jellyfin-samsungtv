var GuiTVUpcoming = {
	upcomingData : [],
	dateArray : [],
	topDayItem : 0,
	selectedDayItem : 0,
	selectedItem : 0,
	topLeftItem : 0,
	bannerItems : ["Series","Latest","Upcoming","Genre","A-Z"],
	selectedBannerItem : 0,
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1,
	divprepend1 : "",
	divprepend2 : "bottom_",
	backdropTimeout : null
};

GuiTVUpcoming.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

GuiTVUpcoming.getMaxDisplayBottom = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
};

GuiTVUpcoming.start = function() {
	alert("Page Enter : GuiTVUpcoming");
	GuiHelper.setControlButtons(null,null,null,GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED" ? "Music" : null,"Return");

	//Load Data
	var url = Server.getCustomURL("/Shows/Upcoming?format=json&Limit=40&Fields=AirTime,UserData,SeriesStudio,SyncInfo&UserId=" + Server.getUserID());
	var ItemData = Server.getContent(url);
	if (ItemData == null) { return; }

	//Reset Vars
	this.selectedItem = 0;
	this.selectedItem2 = -1; //Prevents any item being shown as selected!
	this.topLeftItem = 0;
	this.topLeftItem2 = 0;
	this.topDayItem = 0;
	this.selectedDayItem = 0;

	var sameDayCount = 0;
	var seperateDayCount = 0;

	//Split into arrays on a per day basis
	this.upcomingData[seperateDayCount] = new Array();
	this.upcomingData[seperateDayCount][sameDayCount] = ItemData.Items[0];
	var currentdate = ItemData.Items[0].PremiereDate.substring(0, 10);
	this.dateArray[0] = Support.AirDate(currentdate,"Episode");
	for (var index = 1; index < ItemData.Items.length; index++) {
		//Compare release date
		if (ItemData.Items[index].PremiereDate.substring(0, 10) == currentdate) {
			sameDayCount++;
		} else {
			currentdate = ItemData.Items[index].PremiereDate.substring(0, 10);
			seperateDayCount++;
			this.dateArray[seperateDayCount] = Support.AirDate(currentdate,"Episode");;
			this.upcomingData[seperateDayCount] = new Array();
			sameDayCount = 0;
		}
		this.upcomingData[seperateDayCount][sameDayCount] = ItemData.Items[index];
	}

	//Set PageContent
	document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='bannerMenu'></div>" +
			"<div id=Center class='HomeOneCenter'>" +
			"<p id='title1' style='position:relative;font-size:1.2em;padding-left:22px;z-index:5;'></p><div id='TopRow' style='margin-bottom:60px'><div id=Content></div></div>" +
			"<p id='title2' style='position:relative;font-size:1.2em;padding-left:22px;z-index:5;'></p><div id='BottomRow'><div id=Content2></div></div>" +
			"</div>";


	//If to determine positioning of content
	document.getElementById("Center").style.top = "140px";
	document.getElementById("Center").style.left = "200px";
	document.getElementById("Center").style.width = "1520px";

	if (ItemData.Items.length > 0) {
		//Generate Banner display
		for (var index = 0; index < this.bannerItems.length; index++) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem bannerItemPadding'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";
			} else {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='bannerItem'>"+this.bannerItems[index].replace(/_/g, ' ')+"</div>";
			}
		}

		//Display first XX series
		this.updateDisplayedItems();

		//Update Selected Collection CSS
		this.updateSelectedItems();

		//Display first XX series
		this.updateDisplayedItems2();

		//Update Selected Collection CSS
		this.updateSelectedItems2();

		//Update Titles
		this.updateTitles();

		//Update Banner
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
		this.selectedBannerItem = 0;

		//Update Counter
		this.updateCounter();

		document.getElementById("GuiTVUpcoming").focus();
	} else  {
		//Set message to user
		document.getElementById("counter").innerHTML = "";
		document.getElementById("content").style.fontSize="1.3em";
		document.getElementById("content").innerHTML = "Huh.. Looks like I have no content to show you in this view I'm afraid<br>Press return to get back to the previous screen";

		document.getElementById("noItems").focus();
	}
};

//---------------------------------------------------------------------------------------------------
//      TITLE + COUNTER SETTER
//---------------------------------------------------------------------------------------------------
GuiTVUpcoming.updateTitles = function() {
	document.getElementById("title1").innerHTML = this.dateArray[this.topDayItem];
	document.getElementById("title2").innerHTML = this.dateArray[this.topDayItem+1];
};

GuiTVUpcoming.updateCounter = function(isBottom) {
	if (this.selectedItem == -2) {
		document.getElementById("counter").innerHTML = (this.selectedBannerItem+1) + "/" + this.bannerItems.length;
	} else if (isBottom){
		document.getElementById("counter").innerHTML = (this.selectedDayItem+1) + "/" + this.upcomingData.length + " - " + (this.selectedItem2+1) + "/" + this.upcomingData[this.selectedDayItem].length;
	} else {
		document.getElementById("counter").innerHTML = (this.selectedDayItem+1) + "/" + this.upcomingData.length + " - " + (this.selectedItem+1) + "/" + this.upcomingData[this.selectedDayItem].length;
	}
};

//---------------------------------------------------------------------------------------------------
//      TOP ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
GuiTVUpcoming.updateDisplayedItems = function() {
	Support.updateDisplayedItems(this.upcomingData[this.topDayItem],this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.upcomingData[this.topDayItem].length),"Content",this.divprepend1,false,null,true);
};

//Function sets CSS Properties so show which user is selected
GuiTVUpcoming.updateSelectedItems = function () {
	Support.updateSelectedNEW(this.upcomingData[this.topDayItem], this.selectedItem, this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(), this.upcomingData[this.topDayItem].length), "series collection selected", "series collection", this.divprepend1, true);
};

GuiTVUpcoming.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlight"+Main.highlightColour+"Text";
			}
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == "Upcoming") {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == "Upcoming") {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
};

GuiTVUpcoming.keyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("notifications").style.visibility == "") {
		document.getElementById("notifications").style.visibility = "hidden";
		document.getElementById("notificationText").innerHTML = "";
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

	switch(keyCode)
	{
	case tvKey.KEY_LEFT:
		if (this.selectedItem == -2) {
			this.selectedBannerItem--;
			if (this.selectedBannerItem < 0) {
				this.selectedBannerItem = 0;
				this.openMenu();
			}
			this.updateSelectedBannerItems();
			this.updateCounter();
		} else {
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem++;
				this.openMenu();
			} else {
				if (this.selectedItem < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					this.updateDisplayedItems();
				}
				this.updateCounter();
			}
			this.updateSelectedItems();
		}
			break;
		case tvKey.KEY_RIGHT:
			if (this.selectedItem == -2) {
				this.selectedBannerItem++;
				if (this.selectedBannerItem >= this.bannerItems.length) {
					this.selectedBannerItem--;
				}
				this.updateSelectedBannerItems();
				this.updateCounter();
			} else {
				this.selectedItem++;
				if (this.selectedItem >= this.upcomingData[this.selectedDayItem].length) {
					this.selectedItem--;
				} else {
					if (this.selectedItem >= this.topLeftItem+this.getMaxDisplayBottom() ) {
						this.topLeftItem++;
						this.updateDisplayedItems();
					}
					this.updateSelectedItems();
					this.updateCounter();
				}
			}
		break;
		case tvKey.KEY_UP:
			if (this.selectedDayItem > 0 ) {
				this.topLeftItem = 0;
				this.topLeftItem2 = 0;

				//Tracks which day is selected (array pos of upcomingData)
				this.topDayItem--;
				this.selectedDayItem--;

				this.updateTitles();

				//Update Selected
				this.selectedItem  = 0;
				this.selectedItem2 = -1;
				this.updateDisplayedItems();
				this.updateSelectedItems();
				this.updateDisplayedItems2();
				this.updateSelectedItems2();
				this.selectedItem2 = 0;
				this.updateCounter();
			} else {
				this.selectedBannerItem = 0;
				this.selectedItem = -2;
				if (this.topLeftItem != 0) {
					this.topLeftItem = 0;
					if (this.ItemData.Items.length > 0) {
						this.updateDisplayedItems();
					}
				}
				this.updateSelectedItems();
				this.updateSelectedBannerItems();
				this.updateCounter();
			}
			break;
		case tvKey.KEY_DOWN:
			if (this.selectedItem == -2) {
				this.selectedItem = 0;
				this.selectedBannerItem = -1;
				this.updateSelectedBannerItems();
				this.updateSelectedItems();
				this.updateCounter();
			} else {
				//1st row to 2nd row items
				if (this.selectedDayItem < this.upcomingData.length) {
					//Set to 0 and reset display, then set to -1 and update selected so none are selected, then reset to 0
					if (this.topLeftItem != 0) {
						this.topLeftItem = 0;
						//Only update if there are items to show!!!
						if (this.ItemData.Items.length > 0) {
							this.updateDisplayedItems();
						}
					}

					//Tracks which day is selected (array pos of upcomingData)
					this.selectedDayItem++;

					this.selectedItem = -1;
					this.updateSelectedItems(true);
					this.selectedItem = 0;

					//Set Focus
					document.getElementById("GuiTVUpcomingBottom").focus();
					//Update Selected
					this.selectedItem2 = 0;
					this.updateSelectedItems2();
					this.updateCounter(true);
				}
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem(false);
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			this.openMenu();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_BLUE:
			if (this.selectedItem == -2) {
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					GuiMusicPlayer.showMusicPlayer("GuiTVUpcoming", "bannerItem"+this.selectedBannerItem,"bannerItem highlight"+Main.highlightColour+"Text");
				} else {
					GuiMusicPlayer.showMusicPlayer("GuiTVUpcoming", "bannerItem"+this.selectedBannerItem,"bannerItem bannerItemPadding highlight"+Main.highlightColour+"Text");
				}
			} else {
				GuiMusicPlayer.showMusicPlayer("GuiTVUpcoming", this.divprepend1 + this.upcomingData[this.selectedDayItem][this.selectedItem].Id,document.getElementById(this.divprepend1 + this.upcomingData[this.selectedDayItem][this.selectedItem].Id).className);
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
};

GuiTVUpcoming.openMenu = function() {
	if (this.selectedItem == -2) { //Banner menu
		if (this.selectedBannerItem == this.bannerItems.length-1) {
			document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem";
		} else if (this.selectedBannerItem == this.bannerItems.length-2) {
			document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem bannerItemPadding offWhite";
		} else {
			document.getElementById("bannerItem"+this.selectedBannerItem).className = "bannerItem bannerItemPadding";
		}
		GuiMainMenu.requested("GuiTVUpcoming", "bannerItem" + this.selectedBannerItem, "bannerItem bannerItemPadding highlight" + Main.highlightColour + "Text");
	} else {
		Support.updateURLHistory("GuiTVUpcoming", null,null,null,null,this.selectedItem,this.topLeftItem,true);
		GuiMainMenu.requested("GuiTVUpcoming", this.divprepend1 + this.upcomingData[this.selectedDayItem][this.selectedItem].Id);
	}
};

//---------------------------------------------------------------------------------------------------
//      BOTTOM ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------

GuiTVUpcoming.updateDisplayedItems2 = function() {
	var item = this.topDayItem+1;
	Support.updateDisplayedItems(this.upcomingData[item],this.selectedItem2,this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplayBottom(),this.upcomingData[item].length),"Content2",this.divprepend2,false,null,true);
};

//Function sets CSS Properties so show which user is selected
GuiTVUpcoming.updateSelectedItems2 = function () {
	var item = this.topDayItem+1;
	Support.updateSelectedNEW(this.upcomingData[item], this.selectedItem2, this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplayBottom(), this.upcomingData[item].length), "series collection selected", "series collection", this.divprepend2, true);
};


GuiTVUpcoming.bottomKeyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("notifications").style.visibility == "") {
		document.getElementById("notifications").style.visibility = "hidden";
		document.getElementById("notificationText").innerHTML = "";
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

	switch(keyCode)
	{
		case tvKey.KEY_LEFT:
			alert("LEFT BOTTOM");
			this.selectedItem2--;
			if (this.selectedItem2 < 0) {
				this.selectedItem2++;
				this.openMenu2();
			} else {
				if (this.selectedItem2 < this.topLeftItem2) {
					this.topLeftItem2--;
					if (this.topLeftItem2 < 0) {
						this.topLeftItem2 = 0;
					}
					this.updateDisplayedItems2();
				}
				this.updateSelectedItems2();
				this.updateCounter(true);
			}
			break;
		case tvKey.KEY_RIGHT:
			this.selectedItem2++;
			if (this.selectedItem2 >= this.upcomingData[this.selectedDayItem].length) {
				this.selectedItem2--;
			} else {
				if (this.selectedItem2 >= this.topLeftItem2+this.getMaxDisplayBottom() ) {
					this.topLeftItem2++;
					this.updateDisplayedItems2();
				}
				this.updateSelectedItems2();
				this.updateCounter(true);
			}
			break;
		case tvKey.KEY_UP:
			if (this.topLeftItem2 != 0) {
				this.topLeftItem2 = 0;
				this.updateDisplayedItems2();
			}

			this.selectedItem2 = -1;
			this.updateSelectedItems2(true);
			this.selectedItem2 = 0;

			this.selectedDayItem--;

			//Set Focus
			document.getElementById("guiTVUpcoming").focus();
			//Update Selected
			this.selectedItem = 0;
			this.updateSelectedItems();
			this.updateCounter();
			break;
		case tvKey.KEY_DOWN:
			if (this.selectedDayItem < this.upcomingData.length-1) {
				this.topLeftItem = 0;
				this.topLeftItem2 = 0;

				//Tracks which day is selected (array pos of upcomingData)
				this.topDayItem++;
				this.selectedDayItem++;

				this.updateTitles();

				//Update Selected
				this.selectedItem  = -1;
				this.selectedItem2 = 0;
				this.updateDisplayedItems();
				this.updateSelectedItems();
				this.selectedItem  = 0;
				this.updateDisplayedItems2();
				this.updateSelectedItems2();
				this.updateCounter(true);
			}
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER BOTTOM");
			this.processSelectedItem(true);
			break;
		case tvKey.KEY_TOOLS:
			widgetAPI.blockNavigation(event);
			this.openMenu2();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN BOTTOM");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_BLUE:
			GuiMusicPlayer.showMusicPlayer("GuiTVUpcomingBottom", this.divprepend2 + this.upcomingData[this.selectedDayItem][this.selectedItem2].Id,document.getElementById(this.divprepend2 + this.upcomingData[this.selectedDayItem][this.selectedItem2].Id).className);
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY BOTTOM");
			widgetAPI.sendExitEvent();
			break;
	}
};

GuiTVUpcoming.openMenu2 = function() {
	Support.updateURLHistory("GuiTVUpcoming", null,null,null,null,this.selectedItem2,this.topLeftItem2,false);
	GuiMainMenu.requested("GuiTVUpcomingBottom", this.divprepend2 + this.upcomingData[this.selectedDayItem][this.selectedItem2].Id);
};

//--------------------------------------------------------------------------------------------------------

GuiTVUpcoming.processSelectedItem = function (isBottom) {
	clearTimeout(this.backdropTimeout);
	if (this.selectedItem == -2) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "Series":
			var url = Server.getItemTypeURL("&IncludeItemTypes=Series"+Server.getTvViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			GuiDisplaySeries.start("All TV",url,0,0);
		break;
		case "Unwatched":
			var url = Server.getItemTypeURL("&IncludeItemTypes=Series"+Server.getTvViewQueryPart()+"&SortBy=SortName&SortOrder=Ascending&isPlayed=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
			GuiDisplaySeries.start("Unwatched TV",url,0,0);
		break;
		case "Latest":
			var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&isPlayed=false&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			GuiDisplaySeries.start("Latest TV",url,0,0);

		break;
		case "Genre":
			var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series"+Server.getTvViewQueryPart()+"&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,ItemCounts&userId=" + Server.getUserID());
			GuiDisplaySeries.start("Genre TV",url1,0,0);
		break;
		case"A-Z":
			GuiMusicAZ.start("TV",0);
			break;
		}
	} else {
		var selectedItem = (isBottom) ? this.selectedItem2 : this.selectedItem;
		Support.updateURLHistory("GuiTVUpcoming",null,null,null,null,null,null,null);

		var url = Server.getItemInfoURL(this.upcomingData[this.selectedDayItem][selectedItem].Id,null);
		GuiItemDetails.start(this.upcomingData[this.selectedDayItem][selectedItem].Name,url,0);
	}
};