import UTIL from './lib/utilities.mjs';
import EVENTS from './lib/events.mjs';

export { UTIL as UTIL };

UTIL.log('stkjs-core loaded');
new EVENTS.EventHandler(['boop'], function requirementMet()
{
    UTIL.log('boop happened');
});
EVENTS.fire('boop');
