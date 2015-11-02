module.exports = markdown

var accounting = require('accounting')
var mustache = require('mustache')
var fs = require('fs')
var months = require('english-months')

var template = fs.readFileSync('./template.mustache').toString()
mustache.parse(template)

function markdown(bill) {
  var services = ( 'services' in bill ? total(bill.services) : 0 )
  var expenses = ( 'expenses' in bill ? total(bill.expenses) : 0 )
  var prior = ( 'prior' in bill ? chargeToAmount(bill.prior) : 0 )
  var due = ( services + expenses + prior )
  bill.date = fullDate(bill.date)
  bill.through = fullDate(bill.through)
  if ('services' in bill) {
    bill.services.forEach(function(project) {
      project.charge = format(chargeToAmount(project.charge))
      project.entries.forEach(function(entry) {
        entry.date = partialDate(entry.date) }) }) }
  if ('expenses' in bill) {
    bill.expenses.forEach(function(expense) {
      expense.charge = format(chargeToAmount(expense.charge)) }) }
  bill.totals = {
    services: format(services),
    expenses: format(expenses),
    prior: format(prior),
    due: format(due) }
  return mustache.render(template, bill) }

function chargeToAmount(charge) {
  return ( charge.dollars + ( charge.cents / 100 ) ) }

function format(amount) {
  return accounting.formatMoney(amount) }

function total(entries) {
  return entries.reduce(
    function(total, entry) {
      return ( total + chargeToAmount(entry.charge) ) },
    0) }

function fullDate(dateString) {
  var date = parse8601(dateString)
  return (
    months[date.month - 1] + ' ' +
    date.day + ', ' +
    date.year ) }

function partialDate(dateString) {
  var date = parse8601(dateString)
  return ( months[date.month - 1] + ' ' + date.day ) }

var ISO8601 = /(\d\d\d\d)-(\d\d)-(\d\d)/

function parse8601(dateString) {
  var match = ISO8601.exec(dateString)
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]) } }
  else {
    throw new Error('invalid date: ' + dateString) } }
