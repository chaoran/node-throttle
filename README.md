node-throttle
=============

A Node.js module that helps with rate limiting.

The idea behind this module is originally by Chris O'Hara (http://chris6f.com/rate-limiting-with-redis). 
However, the algorithm he presented can cause false-positive throttling in certain cases.

I adjusted O'Hara's algorithm in this module. This module do not yield false-positive throttling.

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
    accuracy: 60 * 1000   // value should be in milliseconds. ***NOTE: span should be divisible by accuracy***.
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

## LICENSE - MIT License

Copyright (c) 2013 Chaoran Yang, charoany (AT) me (dot) com

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
