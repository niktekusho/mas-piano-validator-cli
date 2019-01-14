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

	// Preprocess all arguments
	const validationItems = [];
	// TODO: evaluate other ways to do this
	/* eslint-disable no-await-in-loop */
	for (const i of input) {
		const normalizedInput = path.normalize(i);
		// TODO: remove before merge
		logger.debug(normalizedInput);

		if (normalizedInput.endsWith('.json')) {
			const content = await readFile(normalizedInput, {encoding: 'utf8'});
			const validationItem = createValidationItem(normalizedInput, content);
			validationItems.push(validationItem);
			return;
		}
		const pathStat = await stat(normalizedInput);
		if (pathStat.isDirectory()) {
			const children = await readdir(normalizedInput);

			// Run the validator only on json files
			const jsonChildrens = children.filter(child => child.endsWith('.json'));
			const jsonChildrensPath = jsonChildrens.map(jsonChild => path.join(normalizedInput, jsonChild));
			const childrenResultPromises = jsonChildrensPath.map(async childPath => {
				return createValidationItem(childPath, await readFile(childPath, {encoding: 'utf8'}));
			});
			validationItems.push(...await Promise.all(childrenResultPromises));
		} else {
			logger.warn(`Ignoring ${normalizedInput} since it is not a JSON file.`);
		}
	}

	if (validationItems.length === 0) {
		// TODO: better msg
		logger.warn('No JSON files found.');
		return;
	}

	const result = validate.all(validationItems);

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

function createValidationItem(filePath, content) {
	return {
		meta: {
			src: filePath
		},
		content
	};
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

module.exports = main;
