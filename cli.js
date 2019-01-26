#!/usr/bin/env node

const meow = require('meow');

const main = require('.');

const cli = meow(`
	Usage:
	  $ mas-piano-validator <input>
`);

// Meow by default does not support the alias for --help, so this is the suggested solution
// (https://github.com/sindresorhus/meow/issues/46#issuecomment-234776549)
if (cli.flags.h) {
	// Automatically calls process.exit
	cli.showHelp();
}

main(cli.input);
