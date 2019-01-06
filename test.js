const execa = require('execa');

describe('CLI testing', () => {
	it('should do stuff', async () => {
		await execa('./index.js', ['./examples/example.json']).stdout.pipe(process.stdout);
	});
});
