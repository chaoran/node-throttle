var Throttle = require('../index')
  , assert = require('assert')

describe('Throttle', function() {
  var throttle;

  before(function(done) {
    var redis = require('redis').createClient(6300)
    redis.flushall(done)
  })

  describe('.configure()', function() {
    it('configure throttle with a redis client', function(done) {
      Throttle.configure({
        host: 'localhost',
        port: 6300
      })
      Throttle.rdb.info(function(err, reply) {
        assert.equal(err, null, err)
        assert(reply.length > 0, 'reply should not be empty')
        done()
      })
    })
  })

  describe('new Throttle()', function() {
    it('create a new throttle', function() {
      throttle = new Throttle('test', {
        span: 500,
        accuracy: 10
      })
      assert.equal(throttle.interval, 50)
      assert.equal(throttle.accuracy, 10)
      assert.equal(throttle.span, 500)
    })
  })

  describe('#read()', function() {
    it('initial count reads zero', function(done) {
      throttle.read(function(err, count) {
        assert.equal(err, null, err)
        assert.equal(count, 0, count)
        done()
      })
    })
    it('update expiration', function(done) {
      setTimeout(function() {
        throttle.read(function(err, count) {
          assert.equal(err, null, err)
          assert.equal(count, 0, count)
          done()
        })
      }, 600)
    })
  })

  describe('#increment()', function() {
    it('increment count', function(done) {
      throttle.increment(1, function(err, count) {
        assert.equal(err, null, err)
        assert.equal(count, 1, count)
        done()
      })
    })
    it('increment count again', function(done) {
      setTimeout(function() {
        throttle.increment(1, function(err, count) {
          assert.equal(err, null, err)
          assert.equal(count, 2, count)
          done()
        })
      }, 200)
    })
    it('increment count after first one expire', function(done) {
      setTimeout(function() {
        throttle.increment(1, function(err, count) {
          assert.equal(err, null, err)
          assert.equal(count, 2, count)
          done()
        })
      }, 400)
    })
    it('reads zero after expiration', function(done) {
      setTimeout(function() {
        throttle.read(function(err, count) {
          assert.equal(err, null, err)
          assert.equal(count, 0, count)
          done()
        })
      }, 1100)
    })
  })
})

