var Throttle = require('./index')
  , finish = require('finish')
var redis = require('redis').createClient(6300)

function recursiveIncr(throttle, count, callback) {
  throttle.increment(1, function(err, reply) {
    if (err) return callback(err);
    if (--count === 0) return callback(null, reply);
    recursiveIncr(throttle, count, callback)
  })
}

redis.flushall(function(err) {
  if (err) throw err;

  Throttle.configure({
    port: 6300
  })

  var throttle = new Throttle('pressure', {
    span: 5000,
    accuracy: 10
  })

  var time = process.hrtime()
  recursiveIncr(throttle, 1000000, function(err, count) {
    if (err) throw err;
    var diff = process.hrtime(time)
    console.log('throttle:')
    console.log('span:', throttle.span, 'accuracy:', throttle.accuracy)
    console.log('1000000 ops took %d ms', diff[0] * 1e3 + diff[1] / 1e6)
    process.exit()
  })
})

