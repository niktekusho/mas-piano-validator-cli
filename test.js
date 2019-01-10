const execa = require('execa');

describe('Spawning the CLI in an other process', () => {
	it('should do stuff', async () => {
		await execa('./cli.js', ['./examples/example.json']).stdout.pipe(process.stdout);
	});
});
