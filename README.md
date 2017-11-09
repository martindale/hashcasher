# hashcasher
[![Build Status](https://img.shields.io/travis/martindale/hashcasher.svg?branch=master&style=flat-square)](https://travis-ci.org/martindale/hashcasher)
[![Coverage Status](https://img.shields.io/coveralls/martindale/hashcasher.svg?style=flat-square)](https://coveralls.io/r/martindale/hashcasher)

Protect online forms from spam by making them perform Proof of Work (PoW).

## Use (Browser)
Place `hashcasher.js`, `sha3.js`, and `worker.js` in the **highest-level
directory that you wish to be protected by hashash**.  This is important,
because the worker process (which handles the heavy load of crypto, away from
the UI thread) can only be used when it is at or above your current depth in the
tree.

Add to the page of the form which you'd like to protect:
```html
<script src="/hashcasher.js"></script>
```

Change your `<form>` element to have the `require` property set to `hashcash`:
```html
<form method="POST" action="/some-endpoint" require="hashcash">
  ...
</form>
```

The form's `submit` handler will be used to consume the form's data (its `<input>` values), pass them to `worker.js` to compute the proof of work, then submit the form with an attached `X-Hashcash` header.

## Use (Server)
Hashcasher comes with a Connect-style middleware, for use in applications built
with things like Express.  Using it is simple:

```js
// specify the difficulty as "2"
var hashcash = require('hashcasher')(2);

app.post('/some-endpoint', hashcash, ...);

```

## Testing
`npm install -g http-server` and `http-server .`, then visit
`localhost:8080/test.html`.
