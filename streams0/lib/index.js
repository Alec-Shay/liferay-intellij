var fs = require('fs');
var streams2 = require('./streams2');
var streams3 = require('./streams3');
var streams4 = require('./streams4');
var streams5 = require('./streams5');
var streams0 = require('./streams0');

var createProjectObjectModels = streams0.createProjectObjectModels;
var createProjectWorkspace = streams0.createProjectWorkspace;
var getCoreDetails = streams5.getCoreDetails;
var getCoreFolders = streams5.getCoreFolders;
var getFilePath = streams5.getFilePath;
var getModuleDetails = streams4.getModuleDetails;
var getModuleFolders = streams3.getModuleFolders;
var getPluginDetails = streams5.getPluginDetails;
var getPluginFolders = streams5.getPluginFolders;
var getPluginSDKRoot = streams5.getPluginSDKRoot;
var isDirectory = streams2.isDirectory;
var isFile = streams2.isFile;

function createProject(portalSourceFolder, otherSourceFolders) {
	var initialCWD = process.cwd();

	process.chdir(portalSourceFolder);

	if (!isDirectory('.idea')) {
		fs.mkdirSync('.idea');
	}

	if (isFile('.idea/jsLibraryMappings.xml')) {
		fs.unlinkSync('.idea/jsLibraryMappings.xml');
	}

	if (!isDirectory('.idea/libraries')) {
		fs.mkdirSync('.idea/libraries');
	}

	var coreFolders = getCoreFolders();

	var includeSubRepos = true;
	var moduleFolders = [];
	var pluginFolders = [];

	for (var i = 0; i < otherSourceFolders.length; i++) {
		var otherSourceFolder = otherSourceFolders[i];

		if (isPluginsSDK(otherSourceFolder)) {
			var newFolders = getPluginFolders(portalSourceFolder, otherSourceFolder);

			pluginFolders = pluginFolders.concat(newFolders);
		}
		else {
			includeSubRepos &= isBladeWorkspace(otherSourceFolder);

			var newFolders = getModuleFolders(portalSourceFolder, otherSourceFolder, true);

			moduleFolders = moduleFolders.concat(newFolders);
		}
	}

	var portalSourceModulesRootPath = getFilePath(portalSourceFolder, 'modules');

	var newFolders = getModuleFolders(portalSourceFolder, portalSourceModulesRootPath, includeSubRepos);

	moduleFolders = moduleFolders.concat(newFolders);

	var coreDetails = coreFolders.map(getCoreDetails);
	var moduleDetails = moduleFolders.map(getModuleDetails);
	var pluginDetails = pluginFolders.map(getPluginDetails);

	createProjectWorkspace(coreDetails, moduleDetails, pluginDetails);

	process.chdir(initialCWD);
};

function isBladeWorkspace(otherSourceFolder) {
	return isFile(getFilePath(otherSourceFolder, 'gradle.properties'));
};

function isPluginsSDK(otherSourceFolder) {
	return getPluginSDKRoot(otherSourceFolder) != null;
};

function prepareProject(portalSourceFolder, otherSourceFolders) {
	var initialCWD = process.cwd();

	process.chdir(portalSourceFolder);

	var coreFolders = getCoreFolders();

	var includeSubRepos = false;
	var moduleFolders = [];

	for (var i = 0; i < otherSourceFolders.length; i++) {
		var otherSourceFolder = otherSourceFolders[i];

		if (!isPluginsSDK(otherSourceFolder)) {
			includeSubRepos &= isBladeWorkspace(otherSourceFolder);

			var newFolders = getModuleFolders(portalSourceFolder, otherSourceFolder, true);

			moduleFolders = moduleFolders.concat(newFolders);
		}
	}

	var portalSourceModulesRootPath = getFilePath(portalSourceFolder, 'modules');

	var newFolders = getModuleFolders(portalSourceFolder, portalSourceModulesRootPath, includeSubRepos);

	moduleFolders = moduleFolders.concat(newFolders);

	var coreDetails = coreFolders.map(getCoreDetails);
	var moduleDetails = moduleFolders.map(getModuleDetails);

	createProjectObjectModels(coreDetails, moduleDetails);

	process.chdir(initialCWD);
};

exports.createProject = createProject;
exports.prepareProject = prepareProject;