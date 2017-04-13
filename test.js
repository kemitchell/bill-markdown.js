var assert = require('assert')
var fs = require('fs')
var markdown = require('./')

var bill = require('./example.json')
var expected = fs.readFileSync('./example.md').toString()

try {
  assert.equal(markdown(bill), expected)
} catch (e) {
  fs.writeFileSync('./actual', e.actual)
  throw e
}
