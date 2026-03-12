const keep = require('c:/Users/user/.antigravity/KDSAIDEV HUB/src/services/googlekeep.js');
require('dotenv').config();

async function run() {
  try {
    console.log('--- START GOOGLE KEEP DUMP ---');
    const dump = await keep.dumpAllNotes();
    console.log(dump);
    console.log('--- END GOOGLE KEEP DUMP ---');
  } catch (err) {
    console.error('Error dumping notes:', err.message);
  }
}

run();
