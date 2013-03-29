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
  accuracy: 15          // accuracy is within span / accuracy = 1 min
})

throttle.increment(1, function(err, count) {
  if (err) throw err;
  var ip = throttle.key.split(':')[0]
  var url = throttle.key.split(':')[1]
  console.log('ip:', ip, 'has visited url:', url, count, 'times', 
    'in', throttle.span / 60 / 1000, 'mins')
})
```

