var fs = require('fs');
var highland = require('highland');
var path = require('path');
var streams2 = require('./streams2');
var streams3 = require('./streams3');
var util = require('util');

var getModuleExcludeFolders = streams3.getModuleExcludeFolders;
var getModuleFolders = streams3.getModuleFolders;
var getModuleIncludeFolders = streams3.getModuleIncludeFolders;
var getModuleOverview = streams3.getModuleOverview;

var isFile = streams2.isFile;

function getDependenciesWithWhileLoop(dependencyText, dependencyExtractor, dependencyRegex) {
	var dependencies = [];

	while ((matchResult = dependencyRegex.exec(dependencyText)) !== null) {
		var dependency = dependencyExtractor(matchResult);

		if (dependency !== null) {
			dependencies.push(dependency);
		}
	}

	return dependencies;
};

function getDependenciesWithStreams(dependencyText, dependencyExtractor, dependencyRegex) {
	return dependencyText.split('\n')
		.map(RegExp.prototype.exec.bind(dependencyRegex))
		.map(dependencyExtractor)
		.filter(function(matchResult) {
			return matchResult !== null;
		});
};

function getLibraryDependency(matchResult) {
	if (matchResult == null) {
		return null;
	}

	var dependency = {
		type: 'library',
		group: matchResult[1],
		name: matchResult[2],
		version: matchResult[3]
	};

	if (dependency.version.indexOf('SNAPSHOT') != -1) {
		return null;
	}

	return dependency;
};

function getModuleDependencies(folder) {
	var buildGradlePath = path.join(folder, 'build.gradle');

	if (!isFile(buildGradlePath)) {
		return {};
	}

	var buildGradleContents = fs.readFileSync(buildGradlePath);

	var dependencyTextRegex = /dependencies \{([^\}]*)\n\}/;
	var dependencyTextResult = dependencyTextRegex.exec(buildGradleContents);

	if (!dependencyTextResult) {
		return {};
	}

	var dependencyText = dependencyTextResult[1];

	var libraryDependencyRegex = /\sgroup: "([^"]*)", name: "([^"]*)", [^\n]*version: "([^"]*)"/;
	var projectDependencyRegex = /\sproject\(":[^"]*:([^"]*)"/;

	var getLibraryDependencies = highland.partial(getDependenciesWithStreams, dependencyText, getLibraryDependency);
	var getProjectDependencies = highland.partial(getDependenciesWithStreams, dependencyText, getProjectDependency);

	return {
		libraryDependencies: getLibraryDependencies(libraryDependencyRegex),
		projectDependencies: getProjectDependencies(projectDependencyRegex)
	};
};

function getModuleDetails(folder) {
	var moduleOverview = getModuleOverview(folder);
	var moduleIncludeFolders = getModuleIncludeFolders(folder);
	var moduleExcludeFolders = getModuleExcludeFolders(moduleIncludeFolders);
	var moduleDependencies = getModuleDependencies(folder);

	var moduleDetailsArray = [moduleOverview, moduleIncludeFolders, moduleExcludeFolders, moduleDependencies];

	return moduleDetailsArray.reduce(util._extend, {});
};

function getProjectDependency(matchResult) {
	if (matchResult == null) {
		return null;
	}

	var dependency = {
		type: 'project',
		name: matchResult[1]
	};

	return dependency;
};

exports.getDependenciesWithWhileLoop = getDependenciesWithWhileLoop;
exports.getDependenciesWithStreams = getDependenciesWithStreams;
exports.getLibraryDependency = getLibraryDependency;
exports.getModuleFolders = getModuleFolders;
exports.getModuleDetails = getModuleDetails;