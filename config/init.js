var assetSmasher = require('asset-smasher');
var Smasher = assetSmasher.Smasher;

var sm = new Smasher({
  paths: [__dirname + '/../public/js'],
  only: ['application.js.mf'],
  compress: false,
  hash: true,
  hashVersion: '1.0',
  gzip: false,
  outputTo: __dirname + '/../public/assets',
  verbose: true,
  noclean: false
});

sm.compileAssets(function(err) {
  if(err) {
    console.log('An error occurred', err);
  } else {
    console.log('Compilation done!');
  }
});

// Add uncaught-exception handler in prod-like environments
if (geddy.config.environment != 'development') {
  process.addListener('uncaughtException', function (err) {
    var msg = err.message;
    if (err.stack) {
      msg += '\n' + err.stack;
    }
    if (!msg) {
      msg = JSON.stringify(err);
    }
    geddy.log.error(msg);
  });
}

