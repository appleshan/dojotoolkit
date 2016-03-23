/**
 * 在页面上呈现分页链接
 */
var pageclass={};
pageclass.paginatepersist=false; //enable persistence of last viewed pagination link (so reloading page doesn't reset page to 1)?
pageclass.pagerange=10; // Limit page links displayed to a specific number
pageclass.ellipse='...'; // Ellipse text (no HTML allowed)
pageclass.totallabel='共 [] 页';
pageclass.firstlink='首页';
pageclass.lastlink='尾页';
pageclass.prevlink='《 上一页';
pageclass.nextlink='下一页 》';
pageclass.nolink='';// just 1 page
//pageclass.selectedpage=0; /* 默认显示第 1 页[ 0 = first page ] */

pageclass.getInitialPage=function(pageinfo){
  var persistedpage=this.getCookie(pageinfo.persistlabel);
  var selectedpage=(pageclass.paginatepersist && persistedpage!=null)
                   ? parseInt(persistedpage)
                   : pageinfo.selectedpage;
  return (selectedpage>pageinfo.pages-1)? 0 : selectedpage; //check that selectedpage isn't out of range
};

pageclass.getCookie=function(Name){
  var re=new RegExp(Name+'=[^;]+', 'i'); //construct RE to search for target name/value pair
  if (document.cookie.match(re)) //if cookie found
    return document.cookie.match(re)[0].split('=')[1]; //return its value
  return null;
};

pageclass.setCookie=function(name, value){
  var expires_time=new Date();
  expires_time.setTime(expires_time.getTime()+(1000*60*60*24*30));
  document.cookie = name+'='+value+';path=/'+';expires='+ expires_time.toUTCString();
};

/**
 * MAIN CONSTRUCTOR FUNCTION
 */
pageclass.createPaginate=function(pageinfo, divId, paginateIds){
  this.pageinfo=pageinfo;
  this.divId=divId;
  this.paginateIds=paginateIds; //array of ids corresponding to the pagination DIVs defined for this pageinstance
  //console.log('pageinfo: ',dojo.toJson(pageinfo));
  //NOTE: this.paginateInfo stores references to various components of each pagination DIV defined for this pageinstance
  //NOTE: Eg: divs[0] = 1st paginate div, pagelinks[0][0] = 1st page link within 1st paginate DIV, prevlink[0] = previous link within paginate DIV etc
  this.paginateInfo={
    divs:[],
    pagelinks:[[]],
    firstlink:[],
    lastlink:[],
    prevlink:[],
    nextlink:[],
//    previouspage:null,
    previousrange:[null,null],
    leftellipse:[],
    rightellipse:[]
  };

  this.dopagerange=false;
  this.pagerangestyle='';
  this.pagerange=this.pageinfo.pagerange || pageclass.pagerange;
  //this.ellipse='<span style="display:none">'+pageclass.ellipse+'</span>'; //construct HTML for ellipse
  this.ellipse='<span>'+pageclass.ellipse+'</span>'; //construct HTML for ellipse

  this.pageinfo.pages = this.pageinfo.pages || 0;
  this.pageinfo.selectedpage=pageclass.getInitialPage(this.pageinfo);
//  console.log(' | this.pageinfo.selectedpage=',this.pageinfo.selectedpage);
  this.buildPagination();
};
pageclass.createPaginate.prototype={
  /**
   * build pagination links based on this.pageinfo.pages
   */
  buildPagination:function(){
    var selectedpage=this.pageinfo.selectedpage;

    //Bool: enable limitpagerange if pagerange value is less than total pages available
    this.dopagerange=(this.pageinfo.pages>this.pagerange);

    //if limitpagerange enabled, hide pagination links when building them
    //this.pagerangestyle=this.dopagerange? 'style="display:none"' : '';

    if (this.pageinfo.pages<=1){
      var link=(this.pageinfo.pages==1)? pageclass.nolink : '';
      for (var i=0; i<this.paginateIds.length; i++){
        document.getElementById(this.paginateIds[i]).innerHTML=link;
      }
      return;
    }
    else{ //construct paginate interface
      var totallabel=pageclass.totallabel.replace('[]', this.pageinfo.pages);
      var paginateHTML='<div class="pagination"><ul><span>'+totallabel+'</span>\n';
      paginateHTML+='<li><a href="#first" rel="0">'+pageclass.firstlink+'</a></li>\n'; //first link HTML
      paginateHTML+='<li><a href="#previous" rel="'+(selectedpage-1)+'">'+pageclass.prevlink+'</a></li>\n'; //previous link HTML
//      console.log('pages= ',this.pageinfo.pages);
      for(var i=0; i<this.pageinfo.pages; i++){
        var islimit=this.limitpagerange(selectedpage, i);
//        console.log('i= ',i,' | islimit=',islimit);
        if( !islimit ) {
            //if this is 1st or last page link, add ellipse next to them, hidden by default
            //var ellipses={left: (i==0? this.ellipse : ''), right: (i==this.pageinfo.pages-1? this.ellipse : '')};
            //paginateHTML+='<li>'+ellipses.right+'<a href="#page'+(i+1)+'" rel="'+i+'" '+this.pagerangestyle+'>'+(i+1)+'</a>'+ellipses.left+'</li>\n';
            paginateHTML+='<li><a href="#page'+(i+1)+'" rel="'+i+'" style="display:inline">'+(i+1)+'</a></li>\n';
        }
        else {
            var ellipses={left: (i==0? this.ellipse : ''), right: (i==this.pageinfo.pages-1? this.ellipse : '')};
            //console.log(' | ellipses=',dojo.toJson(ellipses));
            if(ellipses.right != '' && ellipses.left != '') {
                paginateHTML+='<li>'+ellipses.right+ellipses.left+'</li>\n';
            }
        }
      }
      paginateHTML+='<li><a href="#next" rel="'+(selectedpage+1)+'">'+pageclass.nextlink+'</a></li>\n'; //next link HTML
      paginateHTML+='<li><a href="#last" rel="'+(this.pageinfo.pages-1)+'">'+pageclass.lastlink+'</a></li>\n'; //first link HTML
      paginateHTML+='</ul></div>';
    }// end construction
//    this.paginateInfo.previouspage=selectedpage; //remember last viewed page
    //console.log(paginateHTML);
    for (var i=0; i<this.paginateIds.length; i++){ //loop through # of pagination DIVs specified
      var paginatediv=document.getElementById(this.paginateIds[i]); //reference pagination DIV
      this.paginateInfo.divs[i]=paginatediv; //store ref to this paginate DIV
      paginatediv.innerHTML=paginateHTML;

//    var ellipsespans=paginatediv.getElementsByTagName('span');
//    this.paginateInfo.leftellipse[i]=ellipsespans[0];
//    this.paginateInfo.rightellipse[i]=ellipsespans[1];

      var paginatelinks=paginatediv.getElementsByTagName('a');
      this.paginateInfo.firstlink[i]=paginatelinks[0];
      this.paginateInfo.prevlink[i]=paginatelinks[1];
      if (paginatelinks.length>0){
        this.paginateInfo.lastlink[i]=paginatelinks[paginatelinks.length-1];
        this.paginateInfo.nextlink[i]=paginatelinks[paginatelinks.length-2];
      }
      this.paginateInfo.pagelinks[i]=[]; //array to store the page links of pagination DIV
      for (var p=1; p<paginatelinks.length-1; p++){
        this.paginateInfo.pagelinks[i][p-1]=paginatelinks[p];
      }
      var pageinstance=this;
      paginatediv.onclick=function(e){
        var targetobj=window.event? window.event.srcElement : e.target;
        if (targetobj.tagName=='A' && targetobj.getAttribute('rel')!=''){
          //if this pagination link isn't disabled (CSS classname "disabled" and "currentpage")
          if (!/disabled|currentpage/i.test(targetobj.className)){
            var selectpage=parseInt(targetobj.getAttribute('rel'));
            pageinstance.pageinfo.onClick(selectpage);
          }
        }
        return false;
      };
    }
    this.selectpage(selectedpage);
  },

  selectpage:function(selectedpage){
    //if this page only contains only 1 paginate link (or 0)
    if (this.pageinfo.pages<=1)
      return; //stop here
    var paginateInfo=this.paginateInfo;
//    console.log('147: selectedpage: ', selectedpage);
    for (var i=0; i<paginateInfo.divs.length; i++){ //loop through # of pagination DIVs specified
      //var paginatediv=document.getElementById(this.paginateIds[i])
      paginateInfo.firstlink[i].className=(selectedpage==0)? 'firstlast disabled' : 'firstlast';
      //if current page is 1st page, disable "prev" button
      paginateInfo.prevlink[i].className=(selectedpage==0)? 'prevnext disabled' : 'prevnext';
      //update rel attr of "prev" button with page # to go to when clicked on
      paginateInfo.prevlink[i].setAttribute('rel', selectedpage-1);
      paginateInfo.nextlink[i].className=(selectedpage==this.pageinfo.pages-1)? 'prevnext disabled' : 'prevnext';
      paginateInfo.nextlink[i].setAttribute('rel', selectedpage+1);
      paginateInfo.lastlink[i].className=(selectedpage==this.pageinfo.pages-1)? 'firstlast disabled' : 'firstlast';
      //paginateInfo.pagelinks[i][paginateInfo.previouspage].className=''; //deselect last clicked on pagination link (previous)
      //paginateInfo.pagelinks[i][selectedpage].className='currentpage'; //select current pagination link
      var pagelinks=paginateInfo.pagelinks[i];
      var links_length=pagelinks.length;
      for (var j=0; j<links_length; j++){
          var link_rel=pagelinks[j].getAttribute('rel');
//          if(link_rel==paginateInfo.previouspage){
//              pagelinks[j].className='';
//          }
          if(link_rel==selectedpage){
              pagelinks[j].className='currentpage';
          }
      }
    }
//    paginateInfo.previouspage=selectedpage; //Update last viewed page info
    pageclass.setCookie(this.pageinfo.persistlabel, selectedpage);
  },

  limitpagerange:function(selectedpage, page){
    //reminder: selectedpage count starts at 0 (0=1st page)
    var currentrange=null;
    if (this.dopagerange){
      var visiblelinks=this.pagerange-1; //# of visible page links other than currently selected link
      var visibleleftlinks=Math.floor(visiblelinks/2); //calculate # of visible links to the left of the selected page
      var visiblerightlinks=visibleleftlinks+(visiblelinks%2==1? 1 : 0); //calculate # of visible links to the right of the selected page
      if (selectedpage<visibleleftlinks){ //if not enough room to the left to accomodate all visible left links
        var overage=visibleleftlinks-selectedpage;
        visibleleftlinks-=overage; //remove overage links from visible left links
        visiblerightlinks+=overage; //add overage links to the visible right links
      }
      else if ((this.pageinfo.pages-selectedpage-1)<visiblerightlinks){ //else if not enough room to the left to accomodate all visible right links
        var overage=visiblerightlinks-(this.pageinfo.pages-selectedpage-1);
        visiblerightlinks-=overage; //remove overage links from visible right links
        visibleleftlinks+=overage; //add overage links to the visible left links
      }
      currentrange=[selectedpage-visibleleftlinks, selectedpage+visiblerightlinks]; //calculate indices of visible pages to show: [startindex, endindex]
      return !(currentrange[0] <= page && page <= currentrange[1]);
    }
    return false;
  }
};
