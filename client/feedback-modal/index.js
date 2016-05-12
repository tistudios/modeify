var fs = require('fs')
var Alert = require('../alert')
var analytics = require('../analytics')
var log = require('../log')('feedback-modal')
var message = require('../messages')('feedback-modal')
var modal = require('../modal')
var request = require('../request')
var session = require('./session')

require('./style.css')

/**
 * Expose `Modal`
 */

var Modal = module.exports = modal({
  closable: true,
  template: fs.readFileSync(__dirname + '/template.html')
})

/**
 * Submit
 */

Modal.prototype.submit = function (e) {
  e.preventDefault()
  var alerts = this.find('.alerts')
  var button = this.find('button')
  var textarea = this.find('textarea')
  var feedback = textarea.value + ''
  var results = this.model.toJSON ? this.model.toJSON() : {}
  var self = this

  button.disabled = true
  if (!feedback || feedback.length < 1) {
    alerts.appendChild(Alert({
      type: 'warning',
      text: 'Please fill in the feedback field below.'
    }).el)
  } else {
    var data = {
      feedback: feedback,
      plan: session.plan().generateQuery(),
      results: results
    }

    // Remove the plan from the results (we have the query)
    delete data.results.plan

    request.post('/feedback', data, function (err) {
      if (err) {
        log.error('%e', err)
        alerts.appendChild(Alert({
          type: 'danger',
          text: 'Failed to submit feedback.'
        }).el)
        button.disabled = false
      } else {
        analytics.track('Submitted Feedback', data)

        alerts.appendChild(Alert({
          type: 'success',
          text: 'Thanks! We appreciate the feedback!'
        }).el)

        setTimeout(function () {
          self.hide()
        }, 2000)
      }
    })
  }
}

Modal.prototype.title = function () {
  return message('title')
}

Modal.prototype.placeholder = function () {
  return message('placeholder')
}
