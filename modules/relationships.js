var pull = require('pull-stream')
var createReduce = require('flumeview-reduce/inject')
var Store = require('flumeview-reduce/store')
var Remote = require('flumeview-reduce/store/remote')
var pCont = require('pull-cont/source')

//this is a bit crude, and doesn't actually show unfollows yet.

//function makeQuery (a, b) {
//  return {"$filter": {
//      value: {
//        author: a,
//        content: {
//          type: 'contact',
//          contact: b,
//          following: true
//        }
//      },
//    }}
//}
//

exports.needs = {
  sbot_friends_get: 'first',
  sbot_stream: 'first',
  sbot_query: 'first'
}

exports.gives = {
  follows: true,
  followers: true,
  follower_of: true
}

exports.create = function (api) {
  function get(opts, cb) {
    api.sbot_friends_get(opts, function (err, data) {
      var l = JSON.stringify(data)
      cb(err, data)
    })
  }

  var view = createReduce(Remote(get, Store))
  (2, function (g, rel) {
    if(!g) g = {}
    G.addEdge(g, rel.from, rel.to, rel.value)
    return g
  }, function (data) {
    if(data.value.content.type === 'contact' && ref.isFeed(data.value.content.contact)) {
      var tristate = (
        data.value.content.following ? true
      : data.value.content.flagged || data.value.content.blocking ? false
      : null
      )
      return {
        from: data.value.author,
        to: data.value.content.contact,
        value: tristate
      }
    }
  })({filename: './fake.log'}, '_friends', null)

  //live stream into the view
//  view.since.once(function (v) {
//    pull(
//      api.sbot_stream({gt: v, live: true}),
//      view.createSink()
//    )
//  })
//

  return {
    follows: function (id) {
      return pCont(function (cb) {
      if(!cb) throw new Error('cb expected')
      view.since.once(function () {
        view.get({}, function (err, g) {
          var out = []
          for(var k in g[id])
              if(g[id][k]) out.push(k)
          cb(null, pull.values(out))
        })
      })
//      return api.sbot_query({query: [
//        makeQuery(id, {$prefix:"@"}),
//        {"$map": ['value', 'content', 'contact']}
//      ]})
      })
    },

    followers: function (id) {
      return pCont(function (cb) {
        view.since.once(function () {
          view.get({}, function (err, g) {
            var out = []
            for(var k in g)
              if(g[k][id])
                out.push(k)
            cb(null, pull.values(out))
          })
        })
      })
//      return api.sbot_query({query: [
//        makeQuery({$prefix:"@"}, id),
//        {"$map": ['value', 'author']}
//      ]})
    },

    follower_of: function (source, dest, cb) {
      view.since.once(function () {
        view.get({}, function (err, g) {
          cb(null, g[source] && g[source][dest])
//          var out = []
//          for(var k in g)
//            if(g[k][id])
//              out.push(k)
//          cb(null, out)
        })
      })

//      pull(
//        api.sbot_query({query: [
//          makeQuery(source, dest),
//          {$map: ['value', 'content', 'following']}
//        ]}),
//        pull.collect(function (err, ary) {
//          if(err) return cb(err)
//          else cb(null, ary.pop()) //will be true, or undefined/false
//        })
//      )
    }
  }

}
