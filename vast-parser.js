/*
* Copyright (c) 2014, Interactive Advertising Bureau
* All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

(function(win, key){
	var doc = document,
		ihook,
		key = key || '$vastParser';
		
	function isFunc(func){
		return (func != null && typeof(func) === 'function' && func.call != null);
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
	* Instance object of a VAST document
	*/
	function VastDoc(xdoc){
		this.xml = xdoc;
		this.ads = [];
	
	}
	

	/**
	* Actual VAST parsing code
	*/
	function parseVastSource(source){
		var xdoc, parser;
		
		parser = new DOMParser();
		xdoc = parser.parseFromString(source, 'text/xml');
		
		return xdoc;
	
	}
	
	var impl = {
		
		parseVast : function(source){		
			return new VastDoc(parseVastSource(source));
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

