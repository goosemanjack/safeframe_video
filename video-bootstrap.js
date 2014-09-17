(function(){
var html = '<div class="relative" id="adWrapper"> \
<video id="video1" width="600" controls=""> \
    Your browser does not support HTML5 video. \
</video> \
<div id="adOverlay"></div> \
</div> \
  <br /> \
  <button type="button" id="playBtn">Play</button> \
  <button type="button" id="pauseBtn">Pause</button> \
  <select id="vastfile"></select> \
  <button type="button" id="loadBtn">Load Vast</button> \
  <scr' + 'ipt src="http://localhost:82/vast-parser.js"></scr' + 'ipt> \
  <sc' + 'ript src="http://localhost:82/video-test.js"></scr' + 'ipt> \
  ';

document.write(html);


})();