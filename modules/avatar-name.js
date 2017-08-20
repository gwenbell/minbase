var h = require('hyperscript')
var isBlob = require('ssb-ref').isBlob

exports.needs = { signifier: 'first' }

exports.gives = 'avatar_name'

exports.create = function (api) {

  return function name (id) {
    var n = h('span', id.substring(0, 10))

    api.signifier(id, function (_, names) {
      names = names.filter(function (n) {
        return !isBlob(n.name)
      }).sort(function (a, b) { return b.rank - a.rank })

      if(names.length) n.textContent = names[0].name
    })

    return n
  }
}


