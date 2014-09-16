'use strict';
// https://www.youtube.com/watch?v=HOfdboHvshg  Sintel
// http://developer.longtailvideo.com/ova  OpenVideoAds.org


(function(win){

	var doc = document,
		readyList = [],
		readyFired = false,
		readyEventAttached = false;
		
	var videoList = [
	'http://media.w3.org/2010/05/sintel/trailer.mp4',
	'http://media.w3.org/2010/05/bunny/movie.mp4'
	];
	
	var vastFileList = [
	'ad3.liverail_com.xml',
	'vast2VPAIDLinear.xml',
	'doubleClick_xml.xml',
	'myVastTag.xml',
	'vast_inline_linear.xml'
	];
 
	
	function getEl(id){
		return doc.getElementById(id);
	}
	
	function vastHere(vdoc){
		console.log(vdoc);
		
		var c = vdoc.ads[0].creatives[0].getCompanionAds();
	}
	
	function init(){
		var btn = getEl('playBtn');
		var i, sel, buf = [];
		
		btn.addEventListener('click', vidtest.loadVideo);
		
		getEl('pauseBtn').addEventListener('click', vidtest.pauseVideo);
		
		console.log('ini');
		var hasDom = window.DOMParser;
		console.log(hasDom);
		
		getEl('loadBtn').addEventListener('click', function(e){
			var sel = getEl('vastfile');
			var file = sel.value;

			window.vastParser.loadVast('./ads/' + file, vastHere);
		});
		
		sel = getEl('vastfile');
		for(i=0; i < vastFileList.length; i++){
			buf.push('<option value="', vastFileList[i], '" ');
			if(i == 0){
				buf.push(' selected="selected" ');
			}
			buf.push(' >', vastFileList[i], '</option>');
		}
		
		sel.innerHTML = buf.join('');
	}
	
	
	var impl = {
		loaded: false,
		
		loadVideo: function(e){
			var vid = getEl('video1');
			
			if(vidtest.loaded){
				vid.play();
			}
			else{			
				vid.src = 'mov_bbb.mp4';
				setTimeout(function(){
					vidtest.loaded = true;
					vid.play();
				}, 10);
			}
		},
		
		pauseVideo: function(e){
			var vid = getEl('video1');
			vid.pause();
		},

		playVideo: function(e){
			var vid = getEl('video1');
			vid.play();
		}
		
	
	};
	
	function readyFunc(){
		var i, fn;
		readyFired = true;
		for(i=0; i < readyList.length; i++){
			try{
				fn = readyList[i];
				if(typeof fn == 'function'){
					if(fn && fn.call){
						fn.call(null);
					}
				}
			}
			catch(ex){
			
			}
		}
	}
	
	win['vidtest'] = impl
	
	function attachReadyEvent(func){
		readyList.push(func);
		
		if(!readyEventAttached){
			doc.addEventListener('DOMContentLoaded', readyFunc);
		}
	}
	
	attachReadyEvent(init);
	
})(window);





