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
	
	
	function getEl(id){
		return doc.getElementById(id);
	}
	
	function vastHere(vdoc){
		console.log(vdoc);
	}
	
	function init(){
		var btn = getEl('playBtn');
		
		btn.addEventListener('click', vidtest.loadVideo);
		
		getEl('pauseBtn').addEventListener('click', vidtest.pauseVideo);
		
		console.log('ini');
		var hasDom = window.DOMParser;
		console.log(hasDom);
		
		getEl('loadBtn').addEventListener('click', function(e){
			window.vastParser.loadVast('./ads/vast2VPAIDLinear.xml', vastHere);
		});
		
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





