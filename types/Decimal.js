var SqlType = require('../lib/SqlType')
var inherits = require('util').inherits
var BigNumber = require('big-number').n

module.exports = Decimal
inherits(Decimal, SqlType)

function Decimal(precision, scale) {
	if ( !(this instanceof Decimal) ) return new Decimal(precision, scale)
	SqlType.call(this)

	if (precision != null) {
		if (scale == null) scale = 0
		this.assertValidPrecision(precision)
		this.assertValidScale(scale, precision)
	} else if (scale != null) {
		throw new Error('cannot declare scale without precision')
	} else {
		precision = this.DEFAULT_PRECISION
		scale = this.DEFAULT_SCALE
	}

	this._precision = precision
	this._scale = scale
}

Decimal.prototype.isValidValue = function(value) {
	if (typeof value === 'number') {
		var digits = Math.min(20, this._scale)
		  , parts = value.toFixed(digits).split('.')
		  , left = parts[0].replace(/^-/, '')
		  , right = (parts[1] || '').replace(/0+$/, '')
	} else if (typeof value === 'string') {
		// BigNumber accepts empty strings, we don't
		if (value === '') return false

		parts = value.split('.')
	  left = BigNumber(parts[0]).toString().replace(/^-/, '')
	  right = parts.length > 1 ? BigNumber(parts[1]).toString() : ''

	  if (left === "Invalid Number" || right === "Invalid Number") return false
	} else {
		return false
	}

	var weight = left.length
	if (this.MAX_WEIGHT != null && weight > this.MAX_WEIGHT) {
		return false
	}

	// Coerce scale, then count digits
	var scale = Math.min(right.length, this._scale)
	var precision = weight + scale

	return precision <= this._precision
}

Decimal.prototype.assertValidScale = function(scale, precision) {
	if (scale > precision) {
		throw new Error('scale must be less than or equal to precision')
	}

	if (scale < 0) {
		throw new Error('scale must be zero or positive')
	}

	if (scale > this.MAX_SCALE) {
		throw new Error('scale exceeds maximum of ' + this.MAX_SCALE)
	}
}

Decimal.prototype.assertValidPrecision = function(precision) {
	if (precision <= 0) {
		throw new Error('precision must be positive')
	}

	if (precision > this.MAX_PRECISION) {
		throw new Error('precision exceeds maximum of ' + this.MAX_PRECISION)
	}
}
