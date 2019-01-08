const execa = require('execa');

describe('Spawning the CLI in an other process', () => {
	it('should do stuff', async () => {
		await execa('./index.js', ['./examples/example.json']).stdout.pipe(process.stdout);
	});
});
