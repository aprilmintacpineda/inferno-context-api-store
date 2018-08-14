/** @format */

var babelCore = require('babel-core');
var readDir = require('readdir-plus');
var fs = require('fs');

const transforms = [
  content =>
    babelCore.transform(content, {
      babelrc: false,
      plugins: [
        'minify-dead-code-elimination',
        'transform-minify-booleans',
        'minify-constant-folding',
        'minify-flip-comparisons',
        'transform-class-properties',
        'transform-object-rest-spread',
        'babel-plugin-inferno',
        'syntax-jsx'
      ]
    }),
  content =>
    babelCore.transform(content, {
      babelrc: false,
      presets: ['env', 'flow']
    }),
  content =>
    babelCore.transform(content, {
      babelrc: false,
      presets: ['minify']
    })
];

new Promise((resolve, reject) =>
  readDir(__dirname + '/src/', { content: true }, (err, files) => {
    if (err) {
      reject(err);
    } else {
      resolve(files);
    }
  })
)
  .then(files => {
    for (
      let filesCopy = [].concat(files), file = filesCopy.shift();
      Boolean(file);
      file = filesCopy.shift()
    ) {
      if (file.extension !== '.js') continue;
      let content = fs.readFileSync(file.path, 'utf8').toString();

      for (
        let transformsCopy = [].concat(transforms), transform = transformsCopy.shift();
        Boolean(transform);
        transform = transformsCopy.shift()
      ) {
        const result = transform(content);
        content = result.code;
      }

      fs.writeFileSync(__dirname + '/lib/' + file.name, content, 'utf8');
    }
  })
  .catch(err => console.error(err));
