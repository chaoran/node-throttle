var redis = require('redis')
  , finish = require('finish')
  
var Throttle = module.exports = function(key, options) {
  this.key = key
  
  options = options || {}
  this.span = options.span || 15 * 60 * 1000 // 15 mins
  this.accuracy = options.accuracy || 10 
  this.interval = this.span / this.accuracy
}

Throttle.configure = function(config) {
  this.rdb = redis.createClient(config.port, config.host)
}

Throttle.prototype.increment = function(n, callback) {
  var that = this
    , now = Date.now()
    , index = Math.floor((now % this.span) / this.interval)
  
  this.read(function(err, count) {
    if (err) return callback(err);

    Throttle.rdb.hincrby(that.key, index, n, function(err) {
      if (err) return callback(err);
      callback(null, count + n)
    })
  })
}

Throttle.prototype.read = function(callback) {
  var that = this
    , now = Date.now()
    , index = Math.floor((now % this.span) / this.interval)

  finish(function(async) {
    async(function(done) {
      Throttle.rdb.pttl(that.key, done)
    })
    async(function(done) {
      Throttle.rdb.hgetall(that.key, done)
    })
  }, function(err, replies) {
    if (err) return callback(err);

    var ttl = replies[0]
      , hash = replies[1] || {}

    if (ttl < that.span) {
      for (var i = 0; i < that.accuracy; ++i) {
        if (hash[i]) hash[i-that.accuracy] = hash[i];
        hash[i] = '0'
      }
      Throttle.rdb.hmset(that.key, hash)
      if (ttl < 0) {
        Throttle.rdb.pexpire(that.key, 2 * that.span - (now % that.span))
      } else {
        Throttle.rdb.pexpire(that.key, ttl + that.span)
      }
    }

    var count = 0
    for (var i = index - that.accuracy + 1; i <= index; ++i) {
      if (hash[i]) {
        count += parseInt(hash[i])
      }
    }
    callback(err, count)
  })
}

