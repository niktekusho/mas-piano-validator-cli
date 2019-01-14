const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const chalk = require('chalk');
const validate = require('mas-piano-validator');
const {Signale} = require('signale');

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function main(input) {
	const logger = new Signale({interactive: true, scope: 'global', config: {displayScope: false}});
	logger.await('Processing...');
	if (input.length === 0) {
		logger.error('Specify at least one path!');
		return;
	}
	// TODO: Handle other args
	const normalizedInput = path.normalize(input[0]);
	let result = null;
	try {
		result = await processPath(normalizedInput);
	} catch (error) {
		logger.error(error.message);
		return;
	}
	// If, for whatever reason, result is still null, "let it die!"
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
}

function printChildrenResults(results) {
	const sublogger = new Signale();
	const fileLengths = results.filter(res => res && res.meta && res.meta.src).map(res => res.meta.src.length);
	const longestFileName = Math.max(...fileLengths);
	results.forEach(res => {
		// If result.meta is defined print the source of this result
		const logObject = {message: `[${chalk.cyan.underline(res.meta.src)}]${' '.repeat(longestFileName - res.meta.src.length + 1)}${res.summary}`};
		if (res.ok) {
			sublogger.success(logObject);
		} else {
			sublogger.warn(logObject);
		}
	});
}

/**
 * Process the file or the files inside the specified path.
 *
 * General algorithm:
 *
 * 1. If the path ends with .json process the file immediately, otherwise move on.
 * 2. If the path is a directory (fs.stat), then process all the JSON files in the directory.
 * 3. If none of the above is true, throw an Error saying the path could point to JSON files.
 *
 * @param {string} p Path to check
 * @returns {Promise<ValidationResult|ValidationResultsContainer>} Validation result.
 */
async function processPath(p) {
	if (p.endsWith('.json')) {
		return processFile(p);
	}
	const pathStat = await stat(p);
	if (pathStat.isDirectory()) {
		return processDir(p);
	}
	throw new Error('The path received did not point to JSON files.');
}

/**
 * Retrieve all the children of the directory and process all JSON files found.
 *
 * @param {string} dir Directory to process
 */
async function processDir(dir) {
	const children = await readdir(dir);

	// Run the validator only on json files
	const jsonChildrens = children.filter(child => child.endsWith('.json'));
	const jsonChildrensPath = jsonChildrens.map(jsonChild => path.join(dir, jsonChild));
	const childrenResultPromises = jsonChildrensPath.map(async childPath => {
		return {
			meta: {
				src: childPath
			},
			content: await readFile(childPath, {encoding: 'utf8'})
		};
	});
	const childrenResults = await Promise.all(childrenResultPromises);
	return validate.all(childrenResults);
}

async function processFile(file) {
	const content = await readFile(file, {encoding: 'utf8'});
	return validate(content, {src: file});
}

module.exports = main;
