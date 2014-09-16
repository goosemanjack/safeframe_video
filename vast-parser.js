/*
* Copyright (c) 2014, Interactive Advertising Bureau
* All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

'use strict';

(function(win, key){
	var doc = document,
		ihook,
		key = key || '$vastParser';
		
	var NULL = null;
		
	function isFunc(func){
		return (func != null && typeof(func) === 'function' && func.call != null);
	}
	
	/*
	* Initialize Polyfills
	*/
	(function (){
		if (!String.prototype.trim) {
		  String.prototype.trim = function () {
			return this.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
		  };
		}
	})();
	
	/**
	* Obtain the node text
	*/
	function nodeText(node){
		var str = node.textContent || node.innerHTML || node.innerText || '';
		
		return str.trim();
	}
	
	/**
	* @function
	* Retrieve all child element nodes from a given node.
	* Accounts for cross-browser oddities.
	*/
	function childElements(node){
		var kids, cn, i, ELTYPE = node.ELEMENT_NODE || 1;
		
		if(node.children !== undefined){
			return node.children;
		}
		else{
			kids = [];
			cn = node.childNodes;
			for(i=0; i < cn.length; i++){
				if(cn[i].nodeType == ELTYPE){
					kids.push(cn[i]);
				}
			}
			
			return kids;
		}
	}
	
	/**
	* Create an object based on the list of attributes from a DOM node
	*/
	function objFromAttributes(node, attrList){
		var i, a, obj = {};
		
		for(i=0; i < attrList.length; i++){
			a = attrList[i];
			obj[a] = node.getAttribute(a);
		}
		
		return obj;
	}
	
	/**
	* Callback listener for XMLHttpRequest
	*/
	function reqListener(){
		var x = this;
		if(isFunc(this.cb_func)){
			this.cb_func(this.responseXML);
		}
	}
	
	/**
	* @function
	* Fetches a remote XML file
	*/
	function getFile(url, cb){
		var req = new XMLHttpRequest();
		req.cb_func = cb;
		req.onload = reqListener;
		req.open('get', url, true);
		req.send();
	}
	
	/**
	* Object representing a creative within the ad
	*/
	function VastCreative(node, parent){
		var me = this;
		var par = parent;
		
		this.sequence = node.getAttribute('sequence');
		this.adId = node.getAttribute('adid');
		this.id = node.getAttribute('id');
		this.apiFramework = node.getAttribute('apiFramework');
		
		/**
		* @function
		* Retrieve companion ads associated with this ad or null
		*/
		this.getCompanionAds = function(){
			var i, comp = null, c,
				seq = me.sequence;
			
			if(!parent || (me.adType != 'linear' && me.adType != 'nonlinear')){
				return null;
			}
			
			for(i=0; i < par.creatives.length; i++){
				c = par.creatives[i];
				if(c.adType == 'companionads'){
					if(c.sequence == null){
						comp = c;
					}
					else if(c.sequence == seq){
						return c;
					}
				}
			}
			
			return comp;
		}
		
		function parseTrackingEvents(detObj, trackingNode){
			var i, tn, evt,
				tracks = childElements(trackingNode),
				tevts = detObj.trackingEvents || {};
			
			for(i=0; i < tracks.length; i++){
				tn = tracks[i];
				if(tn.tagName.toUpperCase() != 'TRACKING'){
					continue;
				}
				
				evt = tn.getAttribute('event');
				tevts[evt] = {
					event: evt,
					url: nodeText(tn)
				};
			}
			
			// insure reassignment
			detObj.trackingEvents = tevts;
		}
		
		function parseCreative(node){
			var i, n, kids, tname;
			
			kids = childElements(node);
			if(kids.length == 0){
				return;
			}
			else{
				tname = kids[0].tagName.toLowerCase();
				me.adType = tname;
				if(tname == 'linear'){
					parseLinear(kids[0]);
				}
				else if(tname == 'companionads'){
					parseCompanionAds(kids[0]);
				}
				else if(tname == 'nonlinear'){
					parseNonLinear(kids[0]);
				}
			}
		}
		
		/**
		* @function
		* Parse a linear ad node
		*/
		function parseLinear(lnode){
			var l, tn, k, mfiles, mf,
				mfAttribs, mObj,
				i, m, kids = childElements(lnode);
			
			mfAttribs = ['delivery', 'type', 'width', 'height',
				'codec', 'id', 
				'bitrate', 'minBitrate', 'maxBitrate',
				'scalable', 'maintainAspectRatio', 'apiFramework' ];
			
			me.linear = {
				duration : null,
				mediaFiles: []
			};
			
			l = me.linear;
			
			for(i=0; i < kids.length; i++){
				k = kids[i];
				tn = k.tagName.toUpperCase();
				switch(tn){
					case 'DURATION':
						l.duration = nodeText(k);
						break;
					case 'MEDIAFILES':
						mfiles = childElements(k);
						for(m=0; m < mfiles.length; m++){
							mf = mfiles[m];
							mObj = objFromAttributes(mf, mfAttribs);
							mObj.url = nodeText(mf);
							l.mediaFiles.push(mObj); 
						}
					case 'TRACKINGEVENTS':
						parseTrackingEvents(l, k);
						break;
						
					case 'ADPARAMETERS':
					case 'VIDEOCLICKS':
					case 'ICONS':
						break;
				
				}
			}			
		}
		function parseCompanionAds(cnode){
		
		}
		function parseNonLinear(nlnode){
		
		}
		
		
		// Begin parsing
		parseCreative(node);
	}
	
	/**
	* Object representing an AD element in a VAST template
	*/
	function VastAd(node){
		var me = this;
		// required elements - section 2.2.4.1
		this.id = node.getAttribute('id');
		this.sequence = node.getAttribute('sequence');
		this.impressions = [];
		this.creatives = [];
		
		// optional elements -  - section 2.2.4.2
		this.description = NULL;
		this.advertiser = NULL;
		this.error = NULL;
		this.pricing = NULL;
		this.extensions = NULL;
		
		
		function parseAd(node){
			var kid = childElements(node)[0],
				tagName = kid.tagName.toUpperCase();
			
			if(tagName == 'WRAPPER'){
				me.isWrapper = true;
				me.wrapperUrl = 'http://example/org';
				return;
			}
			else if(tagName == 'INLINE'){
				parseInlineAd(kid);				
			}		
		}
		
		/**
		* @function
		* Parsing routine for the INLINE tag element and children
		*/
		function parseInlineAd(ilnode){
			var i, m, n, key, kidNode, adSys, url, adname, vnum, sysname;
			var cr, crar, allcr;
			var kids = childElements(ilnode);
			me.isWrapper = false;
			me.isInline = true;
			
			for(i=0; i < kids.length; i++){
				kidNode = kids[i];
				switch(kidNode.tagName.toUpperCase()){
					case 'ADSYSTEM':
						vnum = kidNode.getAttribute('version');
						sysname = kidNode.innerHTML;
						
						if(vnum == null){
							vnum = parseFloat(sysname);
							if(isNaN(vnum)){
								vnum = null;
							}
							else{
								sysname = null;
							}
						}
						
						adSys = {
							version: vnum,
							name: sysname
						}
						
						me.adSystem = new function(){
							this.version = adSys.version;
							this.name = adSys.sysname;
							this.toString = function(){
								var s = (this.name || 'Unknown') + ', version ' + (this.version || '0');
								return s;
							}
						}
						break;
						
					case 'ADTITLE':
						adname = nodeText(kidNode);
						me.adName = adname;
						break;
						
					case 'IMPRESSION':
						url = nodeText(kidNode);
						me.impressions.push({id: kidNode.getAttribute('id'), url: url});
						break;
					
					case 'CREATIVES':
						allcr = childElements(kidNode);
						for(m=0; m < allcr.length; m++){
							me.creatives.push(new VastCreative(allcr[m], me));
						}
						break;
					
					// Optional Inline Elements - 2.2.4.2
					case 'DESCRIPTION':
						me.description = nodeText(kidNode);
						break;
						
					case 'ADVERTISER':
						me.advertiser = nodeText(kidNode);
						break;
					
					case 'SURVEY':
						if(me.survey === undefined){
							me.survey = [];
						}
						// open for interpretation
						me.survey.push({
							attributes: {},
							content: kidNode.innerHTML
						});
						for(m=0; m < kidNode.attributes; m++){
							me.survey.attributes[kidNode.attributes.name] = kidNode.attributes.value;
						}
						break;
						
					case 'PRICING':
						me.pricing = {
							model : kidNode.getAttribute('model'),
							currency: kidNode.getAttribute('currency'),
							value: nodeText(kidNode)
						};
						break;
						
					case 'EXTENSIONS':
						me.extensions = kidNode.innerHTML;
						break;
				
				}
				
				// TODO - SORT CREATIVES BY Sequence
			}			
		}
		
		parseAd(node);
	}
	
	/**
	* Instance object of a VAST document
	*/
	function VastDoc(xdoc){
		var me = this;
		this.xml = xdoc;
		this.ads = [];
		this.isAdPod = false;
		
		function parseStructure(xml){
			var ads, i;
			var root = xml.documentElement;
			if(root.tagName.toUpperCase() !== 'VAST'){
				throw {message: 'Invalid VAST document'};
			}
			me.vast_version = root.getAttribute('version');
			
			ads = childElements(root);
			for(i=0; i < ads.length; i++){
				if(ads[i].tagName.toUpperCase() === 'AD'){
					me.ads.push(new VastAd(ads[i]));
				}
			}
			
			if(me.ads.length > 1){
				me.isAdPod = true;
			}
		}
		
		parseStructure(xdoc);
	}
	

	/**
	* Actual VAST parsing code
	*/
	function parseVastSource(source){
		var xdoc, parser;
		
		parser = new DOMParser();
		xdoc = parser.parseFromString(source, 'text/xml');
		
		return new VastDoc(xdoc);
	
	}
	
	var impl = {
		
		parseVast : function(source){		
			return parseVastSource(source);
		},
		
		loadVast: function(url, cb){
			getFile(url, function(data){
				if(isFunc(cb)){
					cb.call(null, new VastDoc(data));
				}
			});
		},
		
		createVastDocument: function(xdoc){
			return new VastDoc(xdoc);
		}
	}
	
	ihook = impl;
	win[key] = impl;


})(window, 'vastParser');

