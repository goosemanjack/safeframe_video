(function(){
var html = '<div class="relative" id="videoWrapper"></div> \
  <scr' + 'ipt src="http://localhost:82/iab-videoplayer.js"></scr' + 'ipt> \
  <scr' + 'ipt src="http://localhost:82/vast-parser.js"></scr' + 'ipt> \
  <sc' + 'ript src="http://localhost:82/video-test.js"></scr' + 'ipt> \
  <sc' + 'ript type="text/javascript"> \
  var vplayer = new $iab.VsuitePlayer("videoWrapper"); \
  </scr' + 'ipt> \
  ';

document.write(html);


})();