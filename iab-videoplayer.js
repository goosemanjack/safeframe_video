/*
* Copyright (c) 2014, Interactive Advertising Bureau
* All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

'use strict';



(function(win){
	var iab = win['$iab'] || {};
	var doc = document;
	var NULL = null;
	var noop = function(){};
		
	function isFunc(func){
		return (func != null && typeof(func) === 'function' && func.call != null);
	}
	
	function isDomElement(idOrEl){
		var t = typeof(idOrEl);
		if(t === 'string'){
			return false;
		}
		else if(t === 'object' && idOrEl.nodeType && idOrEl.nodeType == 1){
			return true;
		}
		
		return false;
	}
	
	/*
	* Initialize Polyfills
	*/
	(function (){
		var methods = [], i;
		if (!String.prototype.trim) {
		  String.prototype.trim = function () {
			return this.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
		  };
		}
		
		if(!win.console){
			win.console = {};
			methods = ['log', 'error', 'warn', 'clear', 'dir'];
			for(i=0; i < methods.length; i++){
				win.console[methods[i]] = noop;
			}
		}
	})();
	
	function makeEl(tag, contents, attributes){
		var key;
		var el = doc.createElement(tag);
		if(contents){
			el.innerHTML = contents;
		}
		if(attributes){
			for (key in attributes){
				if(attributes.hasOwnProperty(key)){
					el.setAttribute(key, attributes[key]);
				}
			}		
		}
		
		return el;
	}
	
	function addStyleRules(cssRules){
		var s = makeEl('style')
		var style;
		var key, k2, val, v2, propbuf;
		// safari bug
		doc.head.appendChild(s);
		s.appendChild(doc.createTextNode(''));
		
		style = s.sheet;
		for(key in cssRules){
			if(cssRules.hasOwnProperty){
				val = cssRules[key];
				if(typeof(val) === 'object'){
					propbuf = [];
					for(k2 in val){
						if(val.hasOwnProperty(k2)){
							propbuf.push(k2, ':', val[k2], ';');
						}
					}
					
					style.insertRule(key + '{' + propbuf.join('\n') + '}', style.cssRules.length);
				}
				else if(typeof(val) === 'string'){
					style.insertRule(key + '{' + propStr + '}', style.cssRules.length);
				}
				
			}
		}
	}
	
	
	/**
	* @class
	* Class definition for a VsuitePlayer
	*/
	var Player = function(id, options){
		var me = this;
		var idBase;
		var doc = document;
		var options = options || {}
		var timelinePos = 0;
		var playlistIndex = 0;
		var currentVast = {
			vastDoc: NULL,
			playedAds: []
		}
		
		/*
		* Info about the current video in the playlist and play time
		*/
		var videoInfo = {
			src: null,
			currentTime: 0
		};
		
		this.element = null; // Page element container the player is inserted into
		this.rootNode = null;
		this.videoElem = null;
		this.adSchedule = {};
		
		/**
		* Event handlers
		*/
		var handlers = {
			seekToTime: function (e){
				var vid = me.videoElem;
				vid.removeEventListener('loadedmetadata', handlers.seekToTime);
				vid.play();
				vid.currentTime = videoInfo.currentTime;
			},
			adEndedHandler: function (e){
				var vid = me.videoElem;
				var src;
				vid.addEventListener('loadedmetadata', handlers.seekToTime);
				vid.removeEventListener('ended', handlers.adEndedHandler);
				if(videoInfo.src == null){
					console.log('no video');
					return;
				}
				playContent(videoInfo);
			}
		}
		
		function vidAttr(key, value){
			var el = me.videoElem;
			if(el == null){ return; }
			el.setAttribute(key, value);		
		}
		
			
		function elemId(key){
			if(!key){
				return idBase + 'xxx';
			}
			return (idBase + '_' + key).replace(/\s/g, '');
		}

		
		function parseAds(ads){
			parseAdCompanions(ads.companions);
			parseAdSchedule(ads.schedule);
		}
		
		/**
		* Parse the ad schedule array
		*/
		function parseAdCompanions(comp){
			var i, r, ac;
			me.adCompanions = {
				regions: []
			};
			ac = me.adCompanions;
			
			if(!comp || !comp.regions || comp.regions.length == 0){
				return;
			}
			
			if(comp.restore){
				ac.restore = true;
			}
			
			for(i=0; i < comp.regions.length; i++){
				r = comp.regions[i];
				if(r != null){
					ac.regions.push(r);
				}
			}
		}
		
		function renderCompanionAds(ads){
			var i, tgtRegion, tgtElem, adElId,
				ad,
				compDefs = me.adCompanions,
				regions = compDefs.regions,
				adComps = ads.companions || [];
			
			var findRegion = function(c, reg){
				var n, r;
				for(n=0; n < reg.length; n++){
					r = reg[n];
					if(c.width == r.width && c.height == r.height){
						return r;
					}
				}
				
				if(reg.length > 0){
					return reg[0];
				}
			}
			
			for(i=0; i < adComps.length; i++){
				ad = adComps[i];
				tgtRegion = findRegion(ad, regions);
				if(!tgtRegion){ return; }
				if(!tgtRegion.eleRendered){
					adElId = elemId(tgtRegion.id);
					tgtElem = doc.getElementById(adElId);
					if(!tgtElem){
						tgtElem = makeEl('div', ad.getContent(), { 'style': 'display: inline-block' });
						me.rootNode.appendChild(tgtElem);
					}
				}
			}
			
		}
		
		/**
		* Parse the ad schedule array
		*/
		function parseAdSchedule(sched){
			var i, sc;
			if(!sched || sched.length == 0){
				me.adSchedule = {};
				return;
			}
			
			for(i=0; i < sched.length; i++){
				sc = sched[i];
				if(sc && sc.position != null){
					me.adSchedule[sc.position] = sc;
				}
			}
		}

		/**
		* Play the sequenced ad from the VAST file
		*/
		function playAdNumber(num){
			var i,
				compAds,
				vid = me.videoElem,
				ad = currentVast.vastDoc.ads[0];
				
			var adSrc;
			var cr = ad.creatives[num];
			if(cr == null){
				return;
			}
			
			vid.pause();
			currentVast.playedAds[num] = true;
			
			if(cr.adType != 'linear'){
				for(i=num+1; i < ad.creatives.length; i++){
					cr = ad.creatives[i];
					if(cr.adType == 'linear'){
						break;
					}
				}
			}
			
			if(cr && cr.linear){
				videoInfo.currentTime = vid.currentTime;
				adSrc = cr.linear.mediaFiles[0].url;
				vid.src = adSrc;
				vid.addEventListener('ended', handlers.adEndedHandler);
				compAds = cr.getCompanionAds();
				if(compAds){
					renderCompanionAds(compAds);
				}
				vid.play();
			}
		}
		
		/**
		* Play video content as defined in info
		*/
		function playContent(info){
			var info = info || videoInfo;
			var src = info && info.src;
			if(!src) {
				console.log('no video');
				return;
			}
			if(info.currentTime > 0){
				src += '#t=' + info.currentTime;
			}
			
			me.videoElem.src = src;
		}
		
		function showCompanionAd(ad){
		
		}
		
		function showVastAdCallback(vast){
			currentVast.vastDoc = vast;
			currentVast.playedAds = [];
			
			console.log(vast);
			
			playAdNumber(0);
		}		
		
		function showAd(ad){
			if(!ad || ad.played){
				return; // play video
			}
			if(ad.tag){
				me.loadVast(ad.tag, showVastAdCallback);
			}
		}
		
		this.loadVast = function(url, cb){
			var vastparser = $iab.vastparser;
			if(!vastparser){
				throw {message: 'Vast parser not loaded'};
			}
			
			vastparser.loadVast(url, cb);
		}

		this.start = function(delay, index){
			var adSched;
			var index = index || 0;
			var playlist = me.playlist || [],
				len = playlist.length;
			
			if(delay && delay > 0){
				setTimeout(function(){ me.start(0, index); }, delay);
				return;
			}

			if(len == 0){
				console.log('no videos defined');
				videoInfo = { src: '', currentTime: 0 };
				return;
			}
			
			if(index > playlist.length - 1){
				index = 0;
			}
			
			videoInfo.src = playlist[index]
			videoInfo.currentTime = 0;
			
			if(me.hasAds){
				adSched = me.adSchedule;
				if(index == 0 && adSched['pre-roll'] != null){
					showAd(adSched['pre-roll']);
					return;
				}
			}
			
		}
		
		function init(id){
			var el, wrap;
			var style = {},
				vsuiteRule;
			if(isDomElement(id)){
				me.element = id;
			}
			else{
				me.element = doc.getElementById(id);
			}
			
			vsuiteRule ={
				'background': 'black',
				'position': 'relative',
				'display': 'inline-block'
			}
			
			style['.vsuiteplayer video'] = vsuiteRule;
			addStyleRules(style);
			
			el = makeEl('video');
			me.videoElem = el;
			if(options){
				if(options.width){
					vidAttr('width', options.width);
				}
				if(options.height){
					vidAttr('height', options.height);
				}
				if(options.poster){
					vidAttr('poster', options.poster);
				}
				if(options.src){
					vidAttr('src', options.src);
				}
				me.autoplay = options.autoplay || false;
				if(options.playlist && options.playlist.length > 0){
					me.playlist = options.playlist;
				}
				if(options.ads){
					me.hasAds = true;
					me.ads = options.ads;
					parseAds(me.ads);
				}
				else{
					me.hasAds = false;
				}
			}
			
			if(me.element.id){
				idBase = 'vplayrfor_' + me.element.id
			}
			else{
				idBase = 'vplayrfor_anon'
			}
			
			vidAttr('controls', 'true');
			me.element.innerHTML = '';
			me.rootNode = makeEl('div', null, { 'class' : 'vsuiteplayer'});
			me.rootNode.appendChild(el);
			me.element.appendChild(me.rootNode);
		
		}
		
		init(id);
		
		// Return the player object for chaining purposes
		return this;
	};
	
	iab.VsuitePlayer = Player
	win['$iab'] = iab;

})(window)



