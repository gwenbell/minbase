var pull = require('pull-stream')
var many = require('pull-many')
var mfr = require('map-filter-reduce')
var cont = require('cont')
var pull = require('pull-stream')
var createReduce = require('flumeview-reduce/inject')
var Store = require('flumeview-reduce/store')
var Remote = require('flumeview-reduce/store/remote')
var pCont = require('pull-cont/source')

function all(stream, cb) {
  pull(stream, pull.collect(cb))
}

//var plugs = require('../plugs')
//var sbot_links2 = plugs.first(exports.sbot_links2 = [])
//var sbot_query = plugs.first(exports.sbot_query = [])
//
exports.needs = {
  sbot_signs_get: 'first',
  sbot_links2: 'first',
  sbot_query: 'first'
}

exports.gives = {
//  connection_status: true,
  signifier: true,
  signified: true,
}

/*
  filter(rel: ['mentions', prefix('@')]) | reduce(name: rel[1], value: count())
*/

//var filter = {
//  $filter: {
//    rel: ["mentions", {$prefix: "@"}]
//  }
//}
//var map = {
//  $map: {
//    name: ['rel', 1],
//    id: 'dest',
//    ts: 'ts',
//  }
//}
//
//var reduce = {
//  $reduce: {
//    name: 'name',
//    id: 'id',
//    rank: {$count: true},
//    ts: {$max: 'ts'}
//  }
//}
//
//var filter2 = {
//  $filter: {
//    value: {
//      content: {
//        type: "about",
//        name: {"$prefix": ""},
//        about: {"$prefix": ""}
//      }
//    }
//  }
//}

var map2 = {
 $map: {
    name: ["value", "content", "name"],
    id: ['value', 'content', 'about'],
    ts: "timestamp"
  }
}

//union with this query...

var names = NAMES = []
function update(name) {
  var n = names.find(function (e) {
    return e.id == name.id && e.name == e.name
  })
  if(!n) {
    name.rank = 1
    //this should be inserted at the right place...
    names.push(name)
  }
  else
    n.rank = n.rank += (name.rank || 1)
}

var ready = false, waiting = []

//var merge = {
//  $reduce: {
//    name: 'name',
//    id: 'id',
//    rank: {$sum: 'rank'},
//    ts: {$max: 'ts'}
//  }
//}

function add_sigil(stream) {
  return pull(stream, pull.map(function (e) {
      if (e && e.id && e.name && e.id[0] !== e.name[0])
        e.name = e.id[0] + e.name
      return e
    })
  )
}

//var queryNamedGitRepos = [
//  {$filter: {
//    value: {
//      content: {
//        type: "git-repo",
//        name: {"$prefix": ""}
//      }
//    }
//  }},
//  {$map: {
//    name: ["value", "content", "name"],
//    id: ['key'],
//    ts: "timestamp"
//  }},
//  reduce
//]
exports.create = function (api) {

//  var exports = {}
//  exports.connection_status = function (err) {
//    if(!err) {
//      pull(
//        many([
//          api.sbot_links2({query: [filter, map, reduce]}),
//          add_sigil(api.sbot_query({query: [filter2, map2, reduce]})),
//          add_sigil(api.sbot_query({query: queryNamedGitRepos}))
//        ]),
//        //reducing also ensures order by the lookup properties
//        //in this case: [name, id]
//        mfr.reduce(merge),
//        pull.collect(function (err, ary) {
//          if(!err) {
//            NAMES = names = ary
//            ready = true
//            while(waiting.length) waiting.shift()()
//          }
//        })
//      )
//
//      pull(many([
//        api.sbot_links2({query: [filter, map], old: false}),
//        add_sigil(api.sbot_query({query: [filter2, map2], old: false})),
//        add_sigil(api.sbot_query({query: queryNamedGitRepos, old: false}))
//      ]),
//      pull.drain(update))
//    }
//  }
//
//  function async(fn) {
//    return function (value, cb) {
//      function go () { cb(null, fn(value)) }
//      if(ready) go()
//      else waiting.push(go)
//    }
//  }
//
//  function rank(ary) {
//    //sort by most used, or most recently used
//    return ary.sort(function (a, b) { return b.rank - a.rank || b.ts - a.ts })
//  }
//
  //we are just iterating over the entire array.
  //if this becomes a problem, maintain two arrays
  //one of each sort order, but do not duplicate the objects.
  //that should mean the space required is just 2x object references,
  //not 2x objects, and we can use binary search to find matches.

  function get(opts, cb) {
    api.sbot_signs_get(opts, cb)
  }

  var view = createReduce(Remote(get, Store))
  (1, function (m, mentions) {
    m = m || {}
    mentions.forEach(function (mention) {
      m[mention.target] = m[mention.target] || {}
      m[mention.target][mention.source] = mention.signifier
    })
    return m
  }, function (data) {
    var out = []
    if(Array.isArray(data.value.content.mentions))
      data.value.content.mentions.filter(function (e) {
        return e.name && 'string' == typeof e.name && e.link
      }).forEach(function (e) {
        out.push({source: data.value.author, signifier: e.name || e.image, target: e.link})
      })
    else if(data.value.content.type == 'about') {
      if(data.value.content.name)
        out.push({source: data.value.author, signifier: data.value.content.name, target: data.value.content.about})
      if(data.value.content.image)
        out.push({
          source: data.value.author,
          signifier: 
            ( isBlob(data.value.content.image) ?
              data.value.content.image :
              data.value.content.link ),
          target: data.value.content.about})

    }
    return out
  })({filename: './fake.log'}, '_signs', null)


  function async(fn) {
    return cont(function (arg, cb) {
      view.since.once(function () {
        view.get(function (err, value) {
          if(err) return cb(err)
          else return cb(null, fn(arg, value))
        })
      })
    })
  }

//  exports.signifier = async(function (id) {
//    return function (cb) {
//      view.since.once(function 
//
//    })
////    return rank(names.filter(function (e) { return e.id == id}))
//  })
//
//  exports.signified = async(function (name) {
//    var rx = new RegExp('^'+name)
//    return rank(names.filter(function (e) { return rx.test(e.name) }))
//  })
//

  exports.signifier = async(function (id, m) {
    var names = m[id], counts = {}
    for(var k in names)
      counts[names[k]] = (counts[names[k]] || 0) + 1
    var out = []
    for(var k in counts)
      out.push({name: k, id: id, rank: counts[k]}) //HACK, just for testing.
    return out
  })


  exports.signified = async(function (name, m) {
    var rx = new RegExp('^'+name.replace(/^@/, ''))
    var counts = {}
    for(var id in m) {
      for(var k in m[id]) {
        var sign = m[id][k]
        if(rx.test(sign)) {
          counts[sign] = (counts[sign] || {})
          counts[sign][id] = (counts[sign][id] || 0) + 1
        }
      }
    }
    var out = []
    for(var name in counts)
      for(var id in counts[name]) {
        out.push({name: '@'+name, id: id, rank: counts[name][id]}) //HACK, just for testing.
      }
    out.sort(function (a, b) {
      return b.rank - a.rank
    })
    return out
  })


  return exports
}

