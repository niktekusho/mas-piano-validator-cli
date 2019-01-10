#!/usr/bin/env node

const meow = require('meow');

const main = require('.');

const cli = meow(`
	Usage:
	  $ mas-piano-validator <input>
`);

main(cli.input);
