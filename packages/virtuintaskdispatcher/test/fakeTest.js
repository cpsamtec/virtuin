const program = require('commander');

program
  .version('0.0.0')
  .description('Perform fake timed test.')
  .option('-t, --time <milliseconds>', 'Time delay in ms', 1000)
  .option('-f, --filepath <path>', 'Path to test config', {});

// Process passed arguments
program.parse(process.argv);
setTimeout(() => {
  process.exit(0);
}, program.time);
