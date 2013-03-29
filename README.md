node-throttle
=============

A Node.js module that helps with rate limiting.

## Install
Install via Node Package Manager (NPM):

    npm install finish

## Quick Example
```javascript
var Throttle = require('throttle')
Throttle.configure({
  port: 6300,
  host: 'localhost'
})

var key = ip_address + ':' + url
var throttle = new Throttle(key, {
  span: 15 * 60 * 1000, // 15 mins
  accuracy: 60 * 1000   // accuracy 1 min
})

throttle.increment(1, function(err, count) {
  if (err) throw err;
  var ip = throttle.key.split(':')[0]
  var url = throttle.key.split(':')[1]
  console.log('ip:', ip, 'has visited url:', url, count, 'times', 
    'in', throttle.span / 60 / 1000, 'mins')
})
```

## APIs
### new Throttle(key[, options])
```
default_options = {
    span: 15 * 60 * 1000, // value should be in milliseconds.
    accuracy: 60 * 1000   // value should be in milliseconds. span should be divisible by accuracy.
}
```

Create a new throttle instance. Throttle instances with the same key share the same internal status, e.g.
```javascript
var th1 = new Throttle('key')
var th2 = new Throttle('key')
th1.increment(1, function(err, count) { 
    assert.equal(count, 1)
    th2.increment(1, function(err, count) {
        assert.equal(count, 2)
    })
})
```

Different accuracies will result in different costs. The complexity of read/increment operation is O(n), where __n__ is __span__ / __accuracy__.

### read(callback)

Read value of a throttle instance, without increment it.
```javascript
throttle.read(function(err, count) {
    if (err) throw err
    console.log('current count:', count)
})
```

### increment(n, callback)

Increment value of a throttle instance by __n__. Returns the resulted value through callback function.
```javascript
throttle.increment(1, function(err, count) {
    if (err) throw err
    console.log('value after increment: count')
}
```
