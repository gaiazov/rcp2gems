const convert = require('./convert');

const argv = require('minimist')(process.argv.slice(2));

if (argv._.length != 2) {
	console.error("Please specify input and output file");
	return;
}

convert(argv._[0], argv._[1])
  .catch(error => console.error(error));