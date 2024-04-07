'use strict';
import EVENTS from './events.mjs';
import UTIL from './utilities.mjs';

// Private variables:
const m_bTriggered = Symbol('m_bTriggered');
const m_iRequirementsLeft = Symbol('m_iRequirementsLeft');
const callback = Symbol('callback');
const m_oThisInCallback = Symbol('m_oThisInCallback');

class Checklist
{
	constructor(cb, oThisInCallback)
	{
		this[m_bTriggered] = false;
		this[m_iRequirementsLeft] = 0;
		this[callback] = cb;
		this[m_oThisInCallback] = oThisInCallback;
	}

	addEventRequirement(sEventName)
	{
		let that = this;
		this.addRequirement();
		new EVENTS.EventHandler([sEventName], function requirementMet()
		{
			that.meetRequirement();
		});
	};
	
	addRequirement(iNumRequirements)
	{
		if(typeof iNumRequirements !== 'undefined')
		{
			this[m_iRequirementsLeft] += iNumRequirements;
		}
		else
		{
			++this[m_iRequirementsLeft];
		}
		UTIL.log(`adding requirement: ${this[m_iRequirementsLeft]} requirements remain`, 'Checklist');
	};

	meetRequirement(iNumRequirements)
	{
		if(typeof iNumRequirements !== 'undefined')
		{
			this[m_iRequirementsLeft] -= iNumRequirements;
		}
		else
		{
			--this[m_iRequirementsLeft];
		}
		UTIL.log(`requirement met: ${this[m_iRequirementsLeft]} requirements remain`, 'Checklist');
		if(!this[m_bTriggered] && this[m_iRequirementsLeft] <= 0)
		{
			UTIL.log('triggering checklist callback', 'Checklist');
			this[m_bTriggered] = true;
			if(this[m_oThisInCallback])
			{
				this[callback].call(this[m_oThisInCallback]);
			}
			else
			{
				this[callback]();
			}
		}
	};

	getRemainingRequirements()
	{
		return this[m_iRequirementsLeft];
	};
}

export default Checklist;
