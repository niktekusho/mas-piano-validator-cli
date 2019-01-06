#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const validate = require('mas-piano-validator');
const meow = require('meow');
const ora = require('ora');
const signale = require('signale');

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const cli = meow(`
	Usage:
	  $ mas-piano-validator <input>
`);

if (cli.input.length === 0) {
	signale.error('Specify at least one path');
	process.exit(1);
}

// TODO: cleanup code

const spinner = ora({
	text: 'Processing...',
	spinner: 'balloon2'
}).start();

// TODO: pass the other input specified
main(cli.input);

async function main(input) {
	const normalizedInput = preprocessArgument(input[0]);
	const result = await processPath(normalizedInput);
	await postProcess(result);
}

function preprocessArgument(arg) {
	return path.normalize(arg);
}

async function processPath(filePath) {
	const pathStat = await stat(filePath);
	if (pathStat.isDirectory()) {
		return processDir(filePath);
	}
	if (filePath.endsWith('.json')) {
		return processFile(filePath);
	}
	throw new Error('This application can only validate JSON files.');
}

async function processDir(dir) {
	const children = await readdir(dir);

	// Run the validator only on json files
	const jsonChildrens = children.filter(child => child.endsWith('.json'));
	const jsonChildrensPath = jsonChildrens.map(jsonChild => path.join(dir, jsonChild));
	const childrenResultPromises = jsonChildrensPath.map(async childPath => {
		return {
			childPath,
			content: await parse(childPath),
			result: null
		};
	});
	const childrenResults = await Promise.all(childrenResultPromises);
	childrenResults.forEach(child => {
		child.result = validate(child.content);
	});
	return childrenResults;
}

async function processFile(file) {
	const parsedObject = await parse(file);
	return validate(parsedObject);
}

function postProcess(result) {
	spinner.stop();
	if (result === null || result === undefined) {
		signale.error('Error');
		return;
	}
	if (Array.isArray(result)) {
		const invalidSongs = result.filter(singleRes => singleRes.result.ok === false);
		if (invalidSongs.length === 0) {
			signale.success('All files are valid Monika After Story piano songs!');
		} else {
			signale.warn('Some songs are NOT valid Monika After Story piano songs.');
			invalidSongs.forEach(invalidSong => logResult(invalidSong));
		}
		return;
	}

	logResult(result);
}

function logResult(result) {
	console.log(result);
	if (result.ok) {
		signale.success('This file is a valid Monika After Story piano song!');
	} else {
		signale.error('This file is NOT a valid Monika After Story piano song...');
	}
}

async function parse(filePath) {
	const fileContent = await readFile(filePath, {encoding: 'utf8'});
	return JSON.parse(fileContent);
}
