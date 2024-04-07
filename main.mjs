import UTIL from './lib/utilities.mjs';
import EVENTS from './lib/events.mjs';
import Checklist from './lib/checklist.mjs';

export { UTIL, EVENTS, Checklist };

// EVENTS
UTIL.log('stkjs-core loaded');
new EVENTS.EventHandler(['boop'], () => UTIL.log('boop happened'));
EVENTS.fire('boop');

// Checklist
const checklist = new Checklist(() => UTIL.log('check'));
checklist.addEventRequirement('bedoop');
checklist.addEventRequirement('borp');
EVENTS.fire('bedoop');
EVENTS.fire('borp');

