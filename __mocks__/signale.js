const EventEmitter = require('events');

const signale = jest.genMockFromModule('signale');

console.log(signale instanceof signale.Signale);

signale.Signale.prototype.emitter = new EventEmitter();

// Stub every function
for (const property in signale) {
	if (Object.prototype.hasOwnProperty.call(signale, property)) {
		const value = signale[property];
		if (typeof value === 'function') {
			signale.Signale.prototype[property] = function (args) {
				this.emitter.emit(`signale_${property}`, args);
			};
		}
	}
}

module.exports = signale;
