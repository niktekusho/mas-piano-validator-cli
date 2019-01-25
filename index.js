const fs = require('fs');
const {extname, join} = require('path');
const {promisify} = require('util');

const chalk = require('chalk');
const validate = require('mas-piano-validator');
const {Signale} = require('signale');
const cwd = require('prepend-cwd');

const readFile = promisify(fs.readFile);

// "readFile" wrapper: it resolves with path AND content
async function wrappedReadFile(filePath) {
	const fileContent = await readFile(filePath, {
		encoding: 'utf8'
	});
	return {
		content: fileContent,
		path: filePath
	};
}

async function main(input) {
	const logger = new Signale({
		interactive: true,
		scope: 'global',
		config: {
			displayScope: false
		}
	});
	if (input.length === 0) {
		logger.error('Specify at least one path!');
		return;
	}

	logger.await('Processing...');

	// The flow is divided into 4 tasks:
	// 1. Input validation
	// 2. Valid input read
	// 3. "mas-piano-validation" step
	// 4. Show results

	// Step 1: input validation
	// The general idea is to filter all arguments and keep only the JSON files

	const jsonFilesPaths = [];
	const ignoredFiles = [];

	// This could be very well async: in this case, sync performance isn't as bad as it looks... 😉
	while (input.length > 0) {
		// Get the first current element in the array (this does side effects on the array)
		const arg = input.shift();
		// Normalize path
		const normalizedPath = cwd(arg);
		// Is the path a directory? If it is, then evaluate the *direct* children
		const stat = fs.statSync(normalizedPath);
		if (stat.isDirectory()) {
			// Get the direct children
			const children = fs.readdirSync(normalizedPath);
			const resolvedChildren = children.map(child => join(normalizedPath, child));
			// Add the children at the end of the array
			input.push(...resolvedChildren);
			// "arg" is a path to a file
			// Check for the extension: only json files are allowed
			// Do regex match case insensitive
		} else if (extname(normalizedPath).match(/json$/i)) {
			jsonFilesPaths.push(normalizedPath);
		} else {
			ignoredFiles.push(`Ignoring ${arg} since it is not a JSON file.`);
		}
	}

	// Possible breakpoint: if there are no json files to be read then tell the user and quit
	if (jsonFilesPaths.length === 0) {
		logger.error('No eligible files found! This application validates only \'*.json\' files.');
		return;
	}

	// Step 2: read files contents
	const files = await Promise.all(jsonFilesPaths.map(wrappedReadFile));

	// Step 3: validation! 🎉
	const validationItems = new validate.ValidationInputContainer();

	files.forEach(file => {
		validationItems.add(file.content, file.path);
	});

	const result = validate.all(validationItems);

	// Step 4: Show the results!
	// First the good news...
	// Both ValidationResult and ValidationResultsContainer have the ok and summary properties (they implement the same "interface")
	const globalMsg = result.summary;
	if (result.ok) {
		logger.success(globalMsg);
	} else {
		logger.warn(globalMsg);
	}
	// Only ValidationResultsContainer has possible children
	if (result.results) {
		printChildrenResults(result.results);
	}

	// Then report ignored files
	ignoredFiles.forEach(ignored => logger.warn(ignored));
}

function printChildrenResults(results) {
	const sublogger = new Signale();
	const fileLengths = results.map(res => res.source ? res.source.length : 0);
	const longestFileName = Math.max(...fileLengths);
	results.forEach(res => {
		// If result.meta is defined print the source of this result
		const logObject = {
			message: `[${chalk.cyan.underline(res.source)}]${' '.repeat(longestFileName - res.source.length + 1)}${res.summary}`
		};
		if (res.ok) {
			sublogger.success(logObject);
		} else {
			sublogger.warn(logObject);
		}
	});
}

module.exports = main;
