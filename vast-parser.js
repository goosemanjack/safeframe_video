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
	
	function reqListener(){
		var x = this;
		if(isFunc(this.cb_func)){
			this.cb_func(this.responseXML);
		}
	}
	
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
	function VastCreative(node){
		this.sequence = node.getAttribute('sequence');
		this.adId = node.getAttribute('adid');
		this.id = node.getAttribute('id');
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
		
		function parseInlineAd(ilnode){
			var i, m, n, key, kidNode, adSys, url, adname, vnum, sysname;
			var cr, crar, allcr;
			var kids = childElements(ilnode);
			me.isWrapper = false;
			
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
						adname = kidNode.textContent || kidNode.innerHTML;
						me.adName = adname;
						break;
						
					case 'IMPRESSION':
						url = kidNode.textContent || kidNode.innerHTML;
						me.impressions.push({id: kidNode.getAttribute('id'), url: url});
						break;
					
					case 'CREATIVES':
						allcr = childElements(kidNode);
						for(m=0; m < allcr.length; m++){
							me.creatives.push(new VastCreative(allcr[m]));
						}
				
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

