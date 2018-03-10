'use strict';

/**
 * Custom error class used in unifile
 */
class UnifileError extends Error {
	static get ENOTSUP() { return 'ENOTSUP'; }
	static get EISDIR() { return 'EISDIR'; }
	static get EACCES() { return 'EACCES'; }
	static get EINVAL() { return 'EINVAL'; }
	static get ENOENT() { return 'ENOENT'; }
	static get EIO() { return 'EIO'; }

	constructor(code, message, ...params) {
		super(message, ...params);
		this.name = 'UnifileError';
		this.code = code;
		// use defineProperty in order to send the message field
		// when using express res.send(err)
		Object.defineProperty(this, 'message', {
			value: message,
			writable: false,
			enumerable: true,
			configurable: true
		});
	}
}

module.exports = {
	UnifileError: UnifileError,
	BatchError: BatchError
};