'use strict'
import UTIL from './utilities.mjs';

var oHandlers = {};

function EventHandler(aTags, callback, oThis, evaluator)
{
	function defaultEvaluator(oTags)
	{
		for(var i = 0; i < aTags; ++i)
		{
			if(!(aTags[i] in oTags))
			{
				return false;
			}
		}
		return true;
	}

	if(evaluator === undefined)
	{
		evaluator = defaultEvaluator;
	}

	for(var i = 0; i < aTags.length; ++i)
	{
		var sTag = aTags[i];
		if(sTag in oHandlers)
		{
			//console.log( 'adding to handlers for tag ' + sTag + ' handlers: ' + JSON.stringify( oHandlers ) );
			oHandlers[sTag].push(this);
		}
		else
		{
			//console.log( 'first event handler for tag ' + sTag + ' handlers: ' + JSON.stringify( oHandlers ) );
			oHandlers[sTag] = [this];
		}
		//console.log( 'handler set: ' + JSON.stringify( oHandlers ) );
	}

	this.trigger = function(oTags)
	{
		//console.log( 'triggering event' );
		if( evaluator.call(oThis, oTags))
		{
			//console.log( 'made it passed the evaluator calling: ' + callback.name );
			var ret = callback.call(oThis, oTags);
			//console.log( 'done calling. result: ' + JSON.stringify( ret ) );
			return ret;
		}
		return null;
	}

	this.unbind = function()
	{
		for(var i = 0; i < aTags.length; ++i)
		{
			var sTag = aTags[i];
			if(sTag in oHandlers)
			{
				var aHandlers = oHandlers[sTag];
				for(var j = aHandlers.length; --j >= 0;)
				{
					if(aHandlers[j] === this)
					{
						aHandlers.splice(j, 1);
					}
				}
			}
		}
	}
}

function fire(mTags)
{
	// Find all handlers that are associated with any of the tags:
	var aMatches = [];

	// Handle the cases where mTags is an array or a string:
	if(UTIL.isString(mTags))
	{
		mTags = [mTags];
	}
	if(UTIL.isArray(mTags))
	{
		for(const sTagName of mTags)
		{
			if(sTagName in oHandlers)
			{
				var aHandlers = oHandlers[sTagName];
				for(var i = 0; i < aHandlers.length; ++i)
				{
					var oHandler = aHandlers[i];
					if(aMatches.indexOf(oHandler) === -1)
					{
						aMatches.push(oHandler);
					}
				}
			}
			}
	}

	// Trigger all the associated handlers:
	var responses = [];
	for(var i = 0; i < aMatches.length; ++i)
	{
		var response = aMatches[i].trigger(mTags);
		if(response != null)
		{
			responses.push(response);
		}
	}
	return responses;
}

const EVENTS =
{
	EventHandler	: EventHandler,
	fire			: fire
};

export default EVENTS;
