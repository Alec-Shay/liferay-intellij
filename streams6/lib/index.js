var fs = require('fs');
var streams2 = require('./streams2');
var streams4 = require('./streams4');
var streams5 = require('./streams5');
var streams6 = require('./streams6');

var createProjectWorkspace = streams6.createProjectWorkspace;
var getCoreDetails = streams5.getCoreDetails;
var getCoreFolders = streams5.getCoreFolders;
var getModuleDetails = streams4.getModuleDetails;
var getModuleFolders = streams4.getModuleFolders;
var isDirectory = streams2.isDirectory;

function createProject(portalSourceFolder, pluginSourceFolders) {
	var initialCWD = process.cwd();

	process.chdir(portalSourceFolder);

	if (!isDirectory('.idea')) {
		fs.mkdirSync('.idea');
	}

	var coreFolders = getCoreFolders();
	var moduleFolders = getModuleFolders('modules', 5);

	var coreDetails = coreFolders.map(getCoreDetails);
	var moduleDetails = moduleFolders.map(getModuleDetails);

	createProjectWorkspace(coreDetails, moduleDetails);

	process.chdir(initialCWD);
};

exports.createProject = createProject;