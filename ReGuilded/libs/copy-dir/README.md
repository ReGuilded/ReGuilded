# copy-dir

  Easy used 'copy-dir' lib, even use a filter, copy a file or directory to another path, when target path or parent target path not exists, it will create the directory automatically.

# install

```js
npm install copy-dir
```

# grammar

Sync Mode:

```js
copydir.sync(from, to[, options]);
```

Async Mode:

```js
copydir(from, to, [options, ]callback);
```

[options]:

```js
  utimes: false,  // Boolean | Object, keep addTime or modifyTime if true
  mode: false,    // Boolean | Number, keep file mode if true
  cover: true,    // Boolean, cover if file exists
  filter: true,   // Boolean | Function, file filter
```

filter is a function that you want to filter the path, then return true or false.

It can use three arguments named state, filepath, filename

* state: String, 'file' / 'directory' / 'symbolicLink', marked as the file or path type
* filepath: String, the file path
* filename: String, the file name

# usage

Sync Mode:

```js
var copydir = require('copy-dir');

copydir.sync('/my/from/path', '/my/target/path', {
  utimes: true,  // keep add time and modify time
  mode: true,    // keep file mode
  cover: true    // cover file when exists, default is true
});
```

Async Mode:

```js
var copydir = require('copy-dir');

copydir('/my/from/path', '/my/target/path', {
  utimes: true,  // keep add time and modify time
  mode: true,    // keep file mode
  cover: true    // cover file when exists, default is true
}, function(err){
  if(err) throw err;
  console.log('done');
});
```

# add a filter

When you want to copy a directory, but some file or sub directory is not you want, you can do like this:

Sync Mode:

```js
var path = require('path');
var copydir = require('copy-dir');

copydir.sync('/my/from/path', '/my/target/path', {
  filter: function(stat, filepath, filename){
    // do not want copy .html files
    if(stat === 'file' && path.extname(filepath) === '.html') {
      return false;
    }
    // do not want copy .svn directories
    if (stat === 'directory' && filename === '.svn') {
      return false;
    }
    // do not want copy symbolicLink directories
    if (stat === 'symbolicLink') {
      return false;
    }
    return true;  // remind to return a true value when file check passed.
  }
});
console.log('done');
```

Async Mode:

```js
var path = require('path');
var copydir = require('copy-dir');

copydir('/a/b/c', '/a/b/e', {
  filter: function(stat, filepath, filename) {
    //...
    return true;
  }
}, function(err) {
  //...
});
```

## Questions?

If you have any questions, please feel free to ask through [New Issue](https://github.com/pillys/copy-dir/issues/new).

### License

copy-dir is available under the terms of the [MIT](LICENSE) License.
