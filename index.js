const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const validate = require('mas-piano-validator');
const ora = require('ora');
const signale = require('signale');

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function main(input) {
	const spinner = ora({
		text: 'Processing...',
		spinner: 'balloon2'
	}).start();
	if (input.length === 0) {
		signale.error('Specify at least one path!');
		return;
	}
	// TODO: Handle other args
	const normalizedInput = path.normalize(input[0]);
	const result = await processPath(normalizedInput);
	spinner.stop();
	signale.info(validate.prettify(result));
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
