var alerts = require('alerts')
var Location = require('location')
var log = require('log')('location-form')
var page = require('page')
var serialize = require('serialize')
var view = require('view')

var View = view(require('./template.html'))

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  log('render')

  ctx.view = new View(ctx.location || new Location(), {
    organization: ctx.organization
  })

  next()
}

View.prototype.action = function () {
  return this.model.isNew() ? 'Create' : 'Edit'
}

View.prototype.back = function () {
  return this.model.isNew() ? '/manager/organizations/' + this.options.organization._id() + '/show' :
    '/manager/locations/' + this.model._id() + '/show'
}

/**
 * Save!
 */

View.prototype.save = function (e) {
  log('saving')

  this.model.set(serialize(this.el))
  this.model.created_by(this.options.organization._id())

  var text = this.model.isNew() ? 'Created new location.' : 'Saved changes to location.'
  var self = this
  this.model.save(function (err) {
    if (err) {
      alerts.show({
        type: 'danger',
        text: err
      })
    } else {
      alerts.push({
        type: 'success',
        text: text
      })
      page('/manager/organizations/' + self.options.organization._id() + '/locations/' + self.model._id() + '/show')
    }
  })
}
