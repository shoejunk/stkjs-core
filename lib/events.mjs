'use strict';
import UTIL from './utilities.mjs';

// Private variables:
const m_aTags = Symbol('m_aTags');
const callback = Symbol('callback');
const m_oThisInCallback = Symbol('m_oThisInCallback');
const evaluator = Symbol('evaluator');

let oHandlers = {};

class EventHandler
{
	constructor(aTags, cb, oThis, e)
	{
		function defaultEvaluator(mTags)
		{
			if (UTIL.isString(mTags))
			{
				mTags = [mTags];
			}
			for(const sTag of aTags)
			{
				if(!mTags.includes(sTag))
				{
					return false;
				}
			}
			return true;
		}
		this[m_aTags] = aTags;
		this[callback] = cb;
		this[m_oThisInCallback] = oThis === undefined ? null : oThis;
		this[evaluator] = e === undefined ? defaultEvaluator : e;
	
		for(const sTag of aTags)
		{
			if(sTag in oHandlers)
			{
				oHandlers[sTag].push(this);
			}
			else
			{
				oHandlers[sTag] = [this];
			}
		}
	}

	trigger(aTags)
	{
		if(this[evaluator].call(this[m_oThisInCallback], aTags))
		{
			const ret = this[callback].call(this[m_oThisInCallback], aTags);
			return ret;
		}
		return null;
	}

	unbind()
	{
		for(const sTag of this[m_aTags])
		{
			if(sTag in oHandlers)
			{
				const aHandlers = oHandlers[sTag];
				for(const j = aHandlers.length - 1; --j >= 0;)
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
