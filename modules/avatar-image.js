'use strict'
var h = require('hyperscript')
var path = require('path')
var visualize = require('visualize-buffer')
var pull = require('pull-stream')
var self_id = require('../keys').id
var isBlob = require('ssb-ref').isBlob

exports.needs = {
  blob_url: 'first',
  signifier: 'first'
}

exports.gives = {
  avatar_image: true
}

function isFunction (f) {
  return 'function' === typeof f
}

//var ready = false
//var waiting = []

//var last = 0

var cache = {}

exports.create = function (api) {
  var avatars  = {}
  return {
    avatar_image: function (author, classes) {
      classes = classes || ''
      if(classes && 'string' === typeof classes) classes = '.avatar--'+classes

      function gen (id) {
        if(cache[id]) return h('img', {src: cache[id]})
        var img = visualize(new Buffer(author.substring(1), 'base64'), 256)
        cache[id] = img.src
        return img
      }

      var blob

      api.signifier(author, function (err, names) {
        var avatar = names.filter(function (e) {
          return isBlob(e.name)
        }).sort(function (a, b) {
          return b.rank - a.rank
        }).shift()
        if(avatar) {
          if(img) img.src = api.blob_url(avatar.name)
          else blob = avatar.name
        }
      })

      var img = blob ? h('img', {src: api.blob_url(blob)}) : gen(author)

      ;(classes || '').split('.').filter(Boolean).forEach(function (c) {
        img.classList.add(c)
      })

      return img
    }
  }
}

