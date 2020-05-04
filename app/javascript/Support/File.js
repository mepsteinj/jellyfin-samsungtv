var File = {
	serverEntry : null,
	userEntry : null
};

File.getServerEntry = function() {
	return this.serverEntry;
};

File.setServerEntry = function(serverEntry) {
	this.serverEntry = serverEntry;
};

File.getUserEntry = function() {
	return this.userEntry;
};

File.setUserEntry = function(userEntry) {
	this.userEntry = userEntry;
};

File.deleteOldSettingsFile = function() {
	var fileSystemObj = new FileSystem();
	fileSystemObj.deleteCommonFile(curWidget.id + '/MB3_Settings.xml');
};

File.deleteSettingsFile = function() {
	var fileSystemObj = new FileSystem();
	fileSystemObj.deleteCommonFile(curWidget.id + '/MB3_Settings.json');
};

File.loadFile = function() {
	var fileSystemObj = new FileSystem();
	var bValid = fileSystemObj.isValidCommonPath(curWidget.id);
	if (!bValid) {
		fileSystemObj.createCommonDir(curWidget.id);
		var fileObj = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		var contentToWrite = '{"Version":"' + Main.getVersion() + '","Servers":[],"TV":{}}';
		fileObj.writeLine(contentToWrite);
		fileSystemObj.closeCommonFile(fileObj);
	}
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (!openRead) {
		fileSystemObj.createCommonDir(curWidget.id);
		var fileObj = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		var contentToWrite = '{"Version":"' + Main.getVersion() + '","Servers":[],"TV":{}}';
		fileObj.writeLine(contentToWrite);
		fileSystemObj.closeCommonFile(fileObj);
		return contentToWrite;
	} else {
		var fileContents = openRead.readAll();
		fileSystemObj.closeCommonFile(openRead);
		return fileContents;
	}
};

File.checkVersion = function(fileContent) {
	if (fileContent.Version === undefined) {
		return "Undefined";
	} else {
		return fileContent.Version;
	}
};

File.saveServerToFile = function(Id,Name,ServerIP) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);

		var serverExists = false;
		for (var index = 0; index < fileJson.Servers.length; index++) {
			if (Id == fileJson.Servers[index].Id) {
			  this.setServerEntry(index);
				serverExists = true;
				alert ("Server already exists in file - not adding - Server Entry: " + this.getServerEntry());
			}
		}
		if (serverExists == false) {
			this.setServerEntry(fileJson.Servers.length);
			fileJson.Servers[fileJson.Servers.length] = {"Id":Id, "Name":Name, "Path":ServerIP, "Default":false, "Users":[]};
			var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
			if (openWrite) {
				openWrite.writeLine(JSON.stringify(fileJson));
				fileSystemObj.closeCommonFile(openWrite);
				alert ("Server added to file - Server Entry: " + this.getServerEntry());
			}
		}
	}
};

File.setDefaultServer = function (defaultIndex) {
	var fileJson = JSON.parse(File.loadFile());
	for (var index = 0; index < fileJson.Servers.length; index++) {
		if (fileJson.Servers[defaultIndex].Id == fileJson.Servers[index].Id ) {
			fileJson.Servers[index].Default = true;
		} else {
			fileJson.Servers[index].Default = false;
		}
	}
	var fileSystemObj = new FileSystem();
	var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
	if (openWrite) {
		openWrite.writeLine(JSON.stringify(fileJson));
		fileSystemObj.closeCommonFile(openWrite);
	}
	Notifications.setNotification(fileJson.Servers[defaultIndex].Name + Main.messages.LabServerChangeTxt, Main.messages.LabServerChange, true);
};

File.deleteServer = function (index) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		fileJson.Servers.splice(index);
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson));
			fileSystemObj.closeCommonFile(openWrite);
		}
		if (fileJson.Servers.length == 0) {
			NewServer.start();
		} else {
			Servers.start();
		}
	}
};

File.addUser = function (userId, name, password, rememberPassword) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		//Check if user doesn't already exist - if does, alter password and save!
		var userFound = false;
		for (var index = 0; index < fileJson.Servers[this.getServerEntry()].Users.length; index++) {
			if (fileJson.Servers[this.getServerEntry()].Users[index].UserId == userId) {
				userFound = true;
				this.setServerEntry(index);
				fileJson.Servers[this.getServerEntry()].Users[index].Password = password;
				fileJson.Servers[this.getServerEntry()].Users[index].RememberPassword = rememberPassword;
				break;
			}
		}
		if (userFound == false) {
			this.setUserEntry(fileJson.Servers[this.getServerEntry()].Users.length);
			fileJson.Servers[this.getServerEntry()].Users[this.getUserEntry()] = {"UserId":userId, "UserName":name.toLowerCase(), "Password":password, "RememberPassword":rememberPassword, "Default":false, "HighlightColour":1, "ContinueWatching":true, "View1":"TVNextUp", "View1Name":"Next Up", "View2":"LatestMovies", "View2Name":"Latest Movies","LangInterface":"en"};
		}
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson));
			fileSystemObj.closeCommonFile(openWrite);
		}
	}
};

File.deleteUser = function (index) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		fileJson.Servers[this.getServerEntry()].Users.splice(index);
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson));
			fileSystemObj.closeCommonFile(openWrite);
		}
	}
};

File.deleteAllUsers = function (index) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		fileJson.Servers[this.getServerEntry()].Users = [];
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson));
			fileSystemObj.closeCommonFile(openWrite);
		}
	}
};

File.deleteUserPasswords = function () {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		for (var index = 0; index < fileJson.Servers[this.getServerEntry()].Users.length; index++) {
			fileJson.Servers[this.getServerEntry()].Users[index].Password = Sha1.hash("", true); // Do  so that users with no password are unaffected!
		}
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson));
			fileSystemObj.closeCommonFile(openWrite);
		}
	}
};

File.updateUserSettings = function (altered) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		fileJson.Servers[this.getServerEntry()].Users[this.getUserEntry()] = altered;
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson));
			fileSystemObj.closeCommonFile(openWrite);
		}
	}
};

File.updateServerSettings = function (altered) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		fileJson.Servers[this.getServerEntry()] = altered;
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson));
			fileSystemObj.closeCommonFile(openWrite);
		}
	}
};

File.writeAll = function (toWrite) {
	var fileSystemObj = new FileSystem();
	var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
	if (openWrite) {
		openWrite.writeLine(JSON.stringify(toWrite));
		fileSystemObj.closeCommonFile(openWrite);
	}
};

//---------------------------------------------------------------------------------------------------------------------------------
//-  GET FUNCTIONS
//---------------------------------------------------------------------------------------------------------------------------------

File.getUserProperty = function(property) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		if (!fileJson.Servers[this.getServerEntry()].Users[this.getUserEntry()]) { //In case we're not logged in yet.
			return null;
		}
		if (fileJson.Servers[this.getServerEntry()].Users[this.getUserEntry()][property] === undefined) {
			//Get System Default
			for (var index = 0; index < GuiSettings.Settings.length; index++) {
				if (GuiSettings.Settings[index] == property) {
					//Write setting here?
					fileJson.Servers[this.getServerEntry()].Users[this.getUserEntry()][property] = GuiSettings.SettingsDefaults[index];
					File.writeAll(fileJson);
					break;
				}
			}
		}
		return fileJson.Servers[this.getServerEntry()].Users[this.getUserEntry()][property];
	}
};

File.getTVProperty = function(property) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		if (fileJson.TV === undefined) {
			fileJson.TV = {};
			File.writeAll (fileJson);
		}
		if (fileJson.TV[property] === undefined) {
			//Get System Default
			for (var index = 0; index < GuiSettings.TVSettings.length; index++) {
				if (GuiSettings.TVSettings[index] == property) {
					//Write setting here?
					fileJson.TV[property] = GuiSettings.TVSettingsDefaults[index];
					File.writeAll(fileJson);
					break;
				}
			}
		}
		return fileJson.TV[property];
	}
};

//---------------------------------------------------------------------------------------------------------------------------------
//-  SET FUNCTIONS
//---------------------------------------------------------------------------------------------------------------------------------

File.setUserProperty = function(property, value) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);
		if (property == "Password") {
			value = Sha1.hash(value,true);
		}
		if (fileJson.Servers[this.getServerEntry()].Users[this.UserEntry()][property] !== undefined) {
			fileJson.Servers[this.ServerEntry()].Users[this.getUserEntry()][property] = value;
			File.writeAll(fileJson);
		}
		return
	}
};