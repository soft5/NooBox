var NooBox={};
function get(key,callback){
  chrome.storage.sync.get(key,function(result){
    if(callback)
      callback(result[key]);
  });
}
function isOn(key,callbackTrue,callbackFalse,param){
  get(key,function(value){
    if(value=='1'){
      if(callbackTrue){
        callbackTrue(param);
      }
    }
    else{
      if(callbackFalse){
        callbackFalse(param);
      }
    }
  });
}

var imgSet;
var notImgSet=new Set();
var isImgSet=new Set();
var focus=null;

function getImages(){
  var notification=false;
  var val=$('#NooBox-extractImages-selector-range').val();
  var gallery=$('#NooBox-extractImages-gallery')[0];
  $(gallery).empty();
  var imgSet=new Set();
  var tempFocus2=focus;
  for(var i=1;i<val;i++){
    tempFocus2=$(tempFocus2).parent()[0];
  }
  getAllImgs=function(elem){
    $(elem).find('*').each(function(){
      if(this.tagName=="IMG"){
        imgSet.add(this.src);
      }
      else{
        var bg=$(this).css('background-image');
        if(bg){
          var url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
          if(url!="none"&&(!url.match(/^gradient/))&&(!url.match(/^linear-gradient/))){
            imgSet.add(url);
          }
        }
      }
      if(this.tagName=='A'){
        if(isImgSet.has(this.href)){
          imgSet.add(this.href);
        }
        else{
          if(!notImgSet.has(this.href)){
            getValidImage(this.href);
          }
        }
      }
      if(this.tagName=='IFRAME'){
        if(!notification){
          notification=true;
        }
        //getAllImgs(this.contentDocument);
      }
    });
  }
  getAllImgs(tempFocus2);
  imgSet.forEach(function(elem){
    $(gallery).append('<img src="'+elem+'" style="margin:0px;border:0px;padding:0px;max-width:100%;max-height:300px" />');
  });
  //location.href = "#NooBox-extractImages-selector-range"; 
}

function getValidImage(url) {
  if(url&&url.length>0&&(!notImgSet.has(url))){
    var img=$('<img src="'+url+'">');
    $(img).on('error',function(){
      notImgSet.add(url);
    });
    $(img).on('load',function(){
      if(!imgSet.has(url)){
        var gallery=$('#NooBox-extractImages-gallery')[0];
        imgSet.add(url);
        isImgSet.add(url);
        $(gallery).append('<img src="'+url+'" style="margin:0px;border:0px;padding:0px;max-width:100%;max-height:300px" />');
      }
    });
  }
}

window.oncontextmenu = function (e){
  focus=e.target;
}
var init=function(){
  isOn("extractImages",function(){
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.job){
          if(request.job=="extractImages"){
            if(!focus||focus.tagName=='HTML'){
              focus=document.body;
            }
            sendResponse({success:true});
            chrome.runtime.sendMessage({job:'analytics',category:'extractImage',action:'run'}, function(response) {});
            console.log('aaaa');
            var images=[];
            var height=window.innerHeight-66;
            var div = $('<div id="NooBox-extractImages">').css({"z-index":"999999999999999999999","height":height*0.9+"px","overflow":"auto","background-color":"rgba(0,0,0,0.7)","padding":"33px","position": "fixed","margin-left":"20%","width":"60%","top":height*0.05+"px"});
            var max=1;
            var tempFocus=focus;
            while(tempFocus.tagName!='BODY'){
              tempFocus=$(tempFocus).parent()[0];
              max++;
            }
            div.append('<span id="NooBox-extractImages-selector-left" style="margin:0px;border:0px;padding:0px;z-index:999999999999999999999;margin-top:0px;display:block;float:left;color:white;font-size:60px"><</span><input type="range" id="NooBox-extractImages-selector-range" style="margin:0px;border:0px;padding:0px;display:block;float:left;height:20px" value="1" min="1" max="'+max+'" step="1"><span id="NooBox-extractImages-selector-right" style="margin:0px;border:0px;padding:0px;margin-top:0px;display:block;float:left;color:white;font-size:60px">></span>');
            div.append('<div id="NooBox-extractImages-switch" style="margin:0px;border:0px;padding:0px;color:black;font-size:99px;position:absolute;left:80%;top:50%;width:100px;height:100px;background-color:rgba(255,255,255,0.8);text-align:center;line-height:100px;verticle-align:middle">X</>');
            div.append('<div style="margin:0px;border:0px;padding:0px;clear:both"></div>');
            if(focus.tagName!='BODY'&&focus.tagName!='HTML')
              focus=$(focus).parent()[0];
            var div2 = $('<div id="NooBox-extractImages-gallery" style="margin:0px;border:0px;padding:0px;width:80%;height:90%;overflow:scroll;margin-top:32px"></div>');
            div.append(div2);
            $(document.body).append(div);
            getImages();
            $('#NooBox-extractImages-selector-left').on('click',function(e){
              var val=parseInt($('.NooBox-extractImages-selector-range').val());
              val--;
              $('#NooBox-extractImages-selector-range').val(val);
              getImages();
            });
            $('#NooBox-extractImages-selector-right').on('click',function(e){
              var val=parseInt($('#NooBox-extractImages-selector-range').val());
              val++;
              $('#NooBox-extractImages-selector-range').val(val);
              getImages();
            });
            $('#NooBox-extractImages-selector-range').on('change',function(e){
              getImages();
            });

            $('#NooBox-extractImages-switch').on('click',function(e){
              $(e.target).parent().remove();
            });
          }
        }
      }
    );
  });
}
init();
