const {EOL} = require('os');

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
	const {emitter} = signale;
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
			emitter.on('signale_info', args => {
				resolve(args);
			});
			// After set timeout reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main(['examples/example.json']);
		});
		expect(result).toStrictEqual('This file is a valid Monika After Story piano song!');
	});

	it('should return appropriate message when a invalid input file is specified', async () => {
		const result = await new Promise((resolve, reject) => {
			emitter.on('signale_info', args => {
				resolve(args);
			});
			// After set timeout reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main(['examples/invalidsong.json']);
		});
		expect(result).toStrictEqual('This file is NOT a valid Monika After Story piano song.');
	});

	it('should return appropriate message when a directory is specified', async () => {
		const result = await new Promise((resolve, reject) => {
			emitter.on('signale_info', args => {
				resolve(args);
			});
			// After set timeout reject the promise
			setTimeout(() => reject(new Error('Timeout reached!')), timeout);

			main(['examples']);
		});
		// The passed string must span on multiple lines
		expect(result.split(EOL).length > 1).toBeTruthy();
	});
});
