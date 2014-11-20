
`zepto-browserify`
------

This is a fork based on [components/zepto](https://github.com/components/zepto).

Version of Zepto in this repo is `1.1.3`, while I use `1.1.3-x` in module.

Goto Zepto's home page for docs: http://zeptojs.com/

Read more about it in official repo: https://github.com/madrobby/zepto

### Usage

```
npm install --save zepto-browserify
```

```js
$ = require('zepto-browserify').$
Zepto = require('zepto-browserify').Zepto
$ === Zepto // => true
```

### Differece from Zepto

How I modified this based on code of `1.1.3`:

```js
window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)
```

```js
exports.$ = exports.Zepto = Zepto;
```