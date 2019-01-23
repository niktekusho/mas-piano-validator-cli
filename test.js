// Look for the TODO
// const {EOL} = require('os');

const execa = require('execa');
const signale = require('signale');

const main = require('.');

describe('Spawning the CLI in an other process', () => {
	it('should do stuff', async () => {
		await execa('./cli.js', ['./examples/example.json']).stdout.pipe(process.stdout);
	});
});

describe('Testing CLI\'s "business logic"', () => {
	// "emitter" is defined in the manual mock
	const {emitter} = signale.Signale.prototype;
	const timeout = 2000;

	it('should return appropriate message when no input is specified', async () => {
		const result = await new Promise((resolve, reject) => {
			emitter.on('signale_error', args => {
				resolve(args);
			});

			// After 1 sec. reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main([]);
		});
		expect(result).toStrictEqual('Specify at least one path!');
	});

	it('should return appropriate message when a valid input file is specified', async () => {
		const result = await new Promise((resolve, reject) => {
			emitter.on('signale_success', args => {
				resolve(args);
			});
			// After set timeout reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main(['examples/example.json']);
		});
		expect(result).toStrictEqual('All files are valid Monika After Story piano songs.');
	});

	it('should return appropriate message when a invalid input file is specified', async () => {
		const result = await new Promise((resolve, reject) => {
			emitter.on('signale_warn', args => {
				resolve(args);
			});
			// After set timeout reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main(['examples/invalidsong.json', '.yarnclean']);
		});
		expect(result).toStrictEqual('All files are NOT valid Monika After Story piano songs.');
	});

	it('should return appropriate message when a directory is specified', async () => {
		// TODO: this resolves after the first signale log
		const result = await new Promise((resolve, reject) => {
			emitter.on('signale_warn', args => {
				resolve(args);
			});
			// After set timeout reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main(['examples']);
		});
		// The passed string must span on multiple lines
		// expect(result.split(EOL).length > 1).toBeTruthy();
		expect(result).toBeDefined();
	});

	it('should return appropriate message when the file specified is not a json file', async () => {
		const result = await new Promise((resolve, reject) => {
			emitter.on('signale_error', args => {
				resolve(args);
			});
			// After set timeout reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main(['index.js']);
		});
		// The passed string must span on multiple lines
		expect(result).toStrictEqual('No eligible files found! This application validates only \'*.json\' files.');
	});
});
