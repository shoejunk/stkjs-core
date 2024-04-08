'use strict';
import $ from 'jquery';
import UTIL from './utilities.mjs';
import Checklist from './checklist.mjs';

const EState = {WAITING_FOR_PARENT: 0, PREPROCESSING: 1, WAITING_FOR_CHILDREN: 2, POSTPROCESSING: 3, DONE: 4};

// Private members:
const m_eState = Symbol('m_eState');
const m_oChecklist = Symbol('m_oChecklist');
const m_oOwner = Symbol('m_oOwner');
const m_oParent = Symbol('m_oParent');
const preprocess = Symbol('preprocess');
const m_sGetFuncName = Symbol('m_sGetFuncName');
const m_bHead = Symbol('m_bHead');
const m_bPause = Symbol('m_bPause');

class DependencyTreeNode
{
	constructor(oOwner, oParent, preprocessFunc, sGetFuncName, bHead, bPause)
	{
		this[m_oOwner] = oOwner;
		this[m_oParent] = oParent;
		this[preprocess] = preprocessFunc;
		this[m_sGetFuncName] = sGetFuncName;
		this[m_bHead] = bHead;
		this[m_bPause] = bPause;
		this[m_eState] = EState.WAITING_FOR_PARENT;
		this[m_oChecklist] = new Checklist(this.onChildrenDone, this);
		if(!bPause && bHead)
		{
			this.onParentDone();
		}
	}

	onParentDone()
	{
		UTIL.assert(this[m_eState] == EState.WAITING_FOR_PARENT);
		this[m_eState] = EState.PREPROCESSING;
		if(this[preprocess])
		{
			this[preprocess](this.preprocessDone.bind(this));
		}
		else
		{
			this.preprocessDone();
		}
	}

	preprocessDone()
	{
		$(() =>
		{
			UTIL.assert(this[m_eState] == EState.PREPROCESSING);
			this[m_eState] = EState.WAITING_FOR_CHILDREN;
			if(this[m_oOwner].children)
			{
				let iChildrenLoaded = 0;
				for(let i = 0; i < this[m_oOwner].children.length; ++i)
				{
					const child = this[m_oOwner].children[i];
					const getFuncName = child[this[m_sGetFuncName]];
					if(getFuncName)
					{
						const oChildTreeDep = getFuncName();
						if(oChildTreeDep && !oChildTreeDep.isHead())
						{
							this[m_oChecklist].addRequirement();
							oChildTreeDep.onParentDone();
						}
					}
				}
			}
			this[m_oChecklist].meetRequirement(0);
		});
	}

	onChildDone()
	{
		this[m_oChecklist].meetRequirement();
	}

	onChildrenDone()
	{
		UTIL.assert(this[m_eState] == EState.WAITING_FOR_CHILDREN);
		this[m_eState] = EState.POSTPROCESSING;
		if(this.postprocess)
		{
			this.postprocess(this.postprocessDone.bind(this));
		}
		else
		{
			this.postprocessDone();
		}
	}

	postprocessDone()
	{
		UTIL.assert(this[m_eState] == EState.POSTPROCESSING);
		this[m_eState] = EState.DONE;
		if(this[m_oOwner].parentNode && this[m_oOwner].parentNode[this[m_sGetFuncName]])
		{
			this[m_oOwner].parentNode[this[m_sGetFuncName]]().onChildDone();
		}
	}

	unpause()
	{
		if(this[m_eState] == EState.WAITING_FOR_PARENT && this[m_bHead])
		{
			this.onParentDone();
		}
	}

	isHead()
	{
		return this[m_bHead];
	}
}

export default DependencyTreeNode;
