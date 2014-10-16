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
		instHook,
		key = key || '$sf-vpaid-bridge'
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
	
	instHook = impl;
	win[key] = impl;


})(window, ''$sf-vpaid-bridge'');

