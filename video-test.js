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
	
	var vid;
	var adTimes = [ 5.0, 15.0 ];
	var playedAds = [false, false];
	
	var videoInfo = {
		url: null,
		currentTime: 0
	};
		
	var pauseTime, intervalId, allDone = false;
		
	var vastDoc;
	
	var vastFileList = [
	'test_vastAd.xml',
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
		vastDoc = vdoc;
		// console.log(vdoc);
		// var c = vdoc.ads[0].creatives[0].getCompanionAds();
	}
	
	function playHandler(e){
		console.log('play');
		if(vastDoc != null){
			console.log('check vastDoc');
		}
		
		intervalId = setInterval(timeUpdateHandler, 1000);
	}
	
	
	function seekToTime(e){
		vid.removeEventListener('loadedmetadata', seekToTime);
		vid.play();
		vid.currentTime = videoInfo.currentTime;
	}
	
	
	function adEndedHandler(e){
		vid.addEventListener('loadedmetadata', seekToTime);
		vid.src = videoInfo.src + '#t=' + videoInfo.currentTime;
		vid.removeEventListener('ended', adEndedHandler);
	}
	
	function playAdNumber(num){
		vid.pause();
		var i;
		var ad = vastDoc.ads[0];
		var adSrc;
		var cr = ad.creatives[num];
		
		playedAds[num] = true;
		
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
			vid.addEventListener('ended', adEndedHandler);
			vid.play();
		}
	}

	function timeUpdateHandler(e){
		var i;
		var time = vid.currentTime;
		
		if(vastDoc == null){
			return;
		}

		for(i=0; i < adTimes.length; i++){
			if(i == adTimes.length - 1 && playedAds[i] == true){
				cancelInterval(intervalId);
				allDone = true;
			}
			
			if(time >= adTimes[i] && playedAds[i] == false){
				playAdNumber(i);				
			}
		}
	}

	
	function init(){
		var btn = getEl('playBtn');
		var i, sel, buf = [];
		
		vid = getEl('video1');
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
		
		
		vid.addEventListener('play', playHandler);
		// vid.addEventListener('timeupdate', timeUpdateHandler);
	}
	
	
	var impl = {
		loaded: false,
		
		loadVideo: function(e){
			var vid = getEl('video1');
			
			if(vidtest.loaded){
				vid.play();
			}
			else{			
				// vid.src = 'mov_bbb.mp4';
				vid.src = videoList[0];
				
				videoInfo.src = vid.src;
				
				
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





