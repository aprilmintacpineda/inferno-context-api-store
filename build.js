/** @format */

var babelCore = require('babel-core');
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
    })
];

let content = fs.readFileSync('src/index.js', 'utf8').toString();

for (
  let transformsCopy = [].concat(transforms), transform = transformsCopy.shift();
  Boolean(transform);
  transform = transformsCopy.shift()
) {
  const result = transform(content);
  content = result.code;
}

fs.writeFileSync(__dirname + '/lib/index.js', content, 'utf8');
fs.writeFileSync(
  __dirname + '/lib/index.min.js',
  babelCore.transform(content, {
    babelrc: false,
    presets: ['minify']
  }).code,
  'utf8'
);
