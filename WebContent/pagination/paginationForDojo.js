//Ajax Pagination Script
var pageclass={};
pageclass.loadingMessage='';//'Loading data...'; // HTML to show while requested page is being fetched:
pageclass.noDataMessage='No results found.';
pageclass.paginatepersist=false; //enable persistence of last viewed pagination link (so reloading page doesn't reset page to 1)?
pageclass.pagerange=10; // Limit page links displayed to a specific number
pageclass.pagesize=20; /* 默认显示 20 row */
pageclass.selectedpage=0; /* 默认显示第 1 页[ 0 = first page ] */
pageclass.ellipse='...'; // Ellipse text (no HTML allowed)
pageclass.prevlink='《 上一页';
pageclass.nextlink='下一页 》';
pageclass.nolink='';// just 1 page
pageclass.urlRegexp=new RegExp("^http:\/\/[^\/]+\/", "i");

/////////////// No need to edit beyond here /////////////////////////

pageclass.connect=function(pageurl, handler){
  //if bust caching of external page
  var time=new Date().getTime();
  var bustcacheparameter=(pageurl.indexOf('?')!=-1)? '&v='+time : '?v='+time;

  require([ 'dojo/request' ], function(request) {
    request.get(pageurl+bustcacheparameter, { handleAs : 'json' }).then(handler);
  });
};

pageclass.loadFirstPage=function(jsonObject){
  dojo.publish('Data-First-Load', [[jsonObject]]);
};

pageclass.loadPage=function(jsonObject){
  dojo.publish('Data-Load', [[jsonObject]]);
};

pageclass.getInitialPage=function(divId, pageinfo){
  var persistedpage=this.getCookie(pageinfo.persistlabel);
  var selectedpage=(pageclass.paginatepersist && persistedpage!=null)
                   ? parseInt(persistedpage)
                   : pageclass.selectedpage;
  //return (selectedpage>pageinfo.pages.length-1)? 0 : selectedpage; //check that selectedpage isn't out of range
  return selectedpage;
};

//初始化pages
pageclass.initialPageUrl=function(pageCount, url){
  var _url=pageclass.addParam(url);
  var pages=[];
  for (var i=0; i<pageCount; i++){
    pages[i]=_url+(i+1);
  }
  return pages;
};

pageclass.addParam=function(url){
  var param='page_size='+pageclass.pagesize+'&page_num=';
  var _url=(url.indexOf('?')!=-1)? (url+'&'+param) : (url+'?'+param);
  return _url;
};
/*
pageclass.cancelBusyButton=function(){
  var querybutton = dijit.byId('query-button');
  if(querybutton!=undefined) querybutton.cancel();
};
*/
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
  //store object containing URLs of pages to fetch, selected page number etc
  this.pageinfo=pageinfo;
  this.divId=divId;
  this.paginateIds=paginateIds; //array of ids corresponding to the pagination DIVs defined for this pageinstance

  //NOTE: this.paginateInfo stores references to various components of each pagination DIV defined for this pageinstance
  //NOTE: Eg: divs[0] = 1st paginate div, pagelinks[0][0] = 1st page link within 1st paginate DIV, prevlink[0] = previous link within paginate DIV etc
  this.paginateInfo={
    divs:[],
    pagelinks:[[]],
    prevlink:[],
    nextlink:[],
    previouspage:null,
    previousrange:[null,null],
    leftellipse:[],
    rightellipse:[]
  };
  this.dopagerange=false;
  this.pagerangestyle='';
  this.ellipse='<span style="display:none">'+pageclass.ellipse+'</span>'; //construct HTML for ellipse
  this.grid=null;

  //replace URL's root domain with dynamic root domain (with or without "www"), for ajax security sake:
  if (this.pageinfo.url==undefined){
    throw new Error('URL must not be init.');
  }

  // 只在第一次订阅Topic
  if(this.pageinfo.status=='init') {
    this.subscribeTopic();
  }

  this.pageinfo.selectedpage=pageclass.getInitialPage(this.divId, this.pageinfo);
  var _url=pageclass.addParam(this.pageinfo.url)+(this.pageinfo.selectedpage+1);
  //replace URL's root domain with dynamic root domain (with or without "www"), for ajax security sake:
  var ajaxfriendlyurl=_url.replace(pageclass.urlRegexp, 'http://'+window.location.hostname+'/');
  //fetch requested page and display it inside DIV
  pageclass.connect(ajaxfriendlyurl, pageclass.loadFirstPage);
};

pageclass.createPaginate.prototype={

  buildFirstPage:function(pagedata){
    var response=pagedata[0];
    if(response.items==undefined) response.items=[];
    this.pageinfo.totalpages=response.total_pages;
    dojo.byId('title').innerHTML = response.title;
    this.renderData(response.headerGroups, response.fields, response.items);
//    this.buildPagination(response.total_pages);
//    pageclass.cancelBusyButton();
  },

  buildPage:function(pagedata){
    var response=pagedata[0];
    if(response.items==undefined) response.items=[];
    this.renderData(response.fields, response.items);
    this.selectpage(this.pageinfo.selectpage);
  },

  renderData:function(headerGroups, fields, pageDataItems){
    var dataSource=null;
    /*对于 Gridx 来说，每一行都有一个唯一标识符（ID）*/
    if(pageDataItems) {
      for ( var int = 0, itemslength=pageDataItems.length; int < itemslength; int++) {
        var item = pageDataItems[int];
        item.id=int+1;
      }
      dataSource=pageDataItems;
    }
    else {
      dataSource=[];
    }

    var context=this;
    require(['dojo/query','dojo/dom-attr','dojo/dom-style','dojo/dom-class','dojo/store/Memory',
             'dojoz/widget/GridxFactory',
             'gridx/modules/ColumnResizer',
             'dojo/domReady!'],
      function(query, domAttr, domStyle, domClass, Memory, GridxFactory, ColumnResizer) {
      var gridxFactory=new GridxFactory();
      gridxFactory.create('list-gridx', fields, headerGroups, [ColumnResizer], context.divId);

      var store = new Memory({ data : dataSource });// data model
      var grid = window['list-gridx'];
      grid.setStore(store);// 填充数据
/*
      var title=dojo.byId('title').innerHTML;
      if(title==='业扩工单超时明细(低压)'){
        query('.gridxRow').forEach(function(rowItem){
          domClass.remove(rowItem, 'gridxRowOdd');
        });

        gridxFactory.decorateRow(function(row) {
        var celldata = grid.cell(row,11).data();
          if(celldata=='低压非居民') {
            var rows=query('.gridxRow').filter(function(rowItem){
                var rowid=domAttr.get(rowItem, 'rowid');
                return (rowid == row.id);
            });
            domStyle.set(rows[0], 'backgroundColor', '#f1f8ff');//浅蓝色
          } else {
            var rows=query('.gridxRow').filter(function(rowItem){
                var rowid=domAttr.get(rowItem, 'rowid');
                return (rowid == row.id);
            });
            domStyle.set(rows[0], 'backgroundColor', '#EEEEE0');//浅紫色 : #EEEEE0
          }
        });
      }*/
    });
  },

  /**
   * build pagination links based on length of this.pageinfo.pages[]
   */
  buildPagination:function(total_pages){
    this.pageinfo.pages=pageclass.initialPageUrl(total_pages, this.pageinfo.url);
    var selectedpage=this.pageinfo.selectedpage;
    this.dopagerange=(this.pageinfo.pages.length>pageclass.pagerange); //Bool: enable limitpagerange if pagerange value is less than total pages available
    this.pagerangestyle=this.dopagerange? 'style="display:none"' : ''; //if limitpagerange enabled, hide pagination links when building them
    this.paginateInfo.previousrange=null; //Set previousrange[start, finish] to null to start
    if (this.pageinfo.pages.length<=1){ //no 0 or just 1 page
      //document.getElementById(this.paginateIds[0]).innerHTML=(this.pageinfo.pages.length==1)? pageclass.nolink : '';
      require(['dojo/dom-class', 'dojo/domReady!'],
      function(domClass) {
        domClass.remove('paginate-top');
        domClass.remove('paginate-bottom');
      });

      return;
    }
    else{ //construct paginate interface
      var paginateHTML='<div class="pagination"><ul>\n';
      paginateHTML+='<li><a href="#previous" rel="'+(selectedpage-1)+'">'+pageclass.prevlink+'</a></li>\n'; //previous link HTML
      for (var i=0; i<this.pageinfo.pages.length; i++){
        var ellipses={left: (i==0? this.ellipse : ''), right: (i==this.pageinfo.pages.length-1? this.ellipse : '')}; //if this is 1st or last page link, add ellipse next to them, hidden by default
        paginateHTML+='<li>'+ellipses.right+'<a href="#page'+(i+1)+'" rel="'+i+'" '+this.pagerangestyle+'>'+(i+1)+'</a>'+ellipses.left+'</li>\n';
      }
      paginateHTML+='<li><a href="#next" rel="'+(selectedpage+1)+'">'+pageclass.nextlink+'</a></li>\n'; //next link HTML
      paginateHTML+='</ul></div>';
    }// end construction
    this.paginateInfo.previouspage=selectedpage; //remember last viewed page
    for (var i=0; i<this.paginateIds.length; i++){ //loop through # of pagination DIVs specified
      var paginatediv=document.getElementById(this.paginateIds[i]); //reference pagination DIV
      this.paginateInfo.divs[i]=paginatediv; //store ref to this paginate DIV
      paginatediv.innerHTML=paginateHTML;
      var paginatelinks=paginatediv.getElementsByTagName('a');
      var ellipsespans=paginatediv.getElementsByTagName('span');
      this.paginateInfo.prevlink[i]=paginatelinks[0];
      if (paginatelinks.length>0)
        this.paginateInfo.nextlink[i]=paginatelinks[paginatelinks.length-1];
      this.paginateInfo.leftellipse[i]=ellipsespans[0];
      this.paginateInfo.rightellipse[i]=ellipsespans[1];
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
            pageinstance.checkQueryItemChange();
            var selectpage=parseInt(targetobj.getAttribute('rel'));
            var ajaxfriendlyurl=pageinstance.pageinfo.pages[selectpage].replace(pageclass.urlRegexp, 'http://'+window.location.hostname+'/');
            //fetch requested page and display it inside DIV
            pageclass.connect(ajaxfriendlyurl, pageclass.loadPage);
            //pageinstance.selectpage(selectpage);
            pageinstance.pageinfo.selectpage=selectpage;
          }
        }
        return false;
      };
    }
    this.selectpage(selectedpage);
  },

  selectpage:function(selectedpage){
    //if this page only contains only 1 paginate link (or 0)
    if (this.pageinfo.pages.length<=1)
      return; //stop here
    var paginateInfo=this.paginateInfo;
    for (var i=0; i<paginateInfo.divs.length; i++){ //loop through # of pagination DIVs specified
      //var paginatediv=document.getElementById(this.paginateIds[i])
      paginateInfo.prevlink[i].className=(selectedpage==0)? 'prevnext disabled' : 'prevnext'; //if current page is 1st page, disable "prev" button
      paginateInfo.prevlink[i].setAttribute('rel', selectedpage-1); //update rel attr of "prev" button with page # to go to when clicked on
      paginateInfo.nextlink[i].className=(selectedpage==this.pageinfo.pages.length-1)? 'prevnext disabled' : 'prevnext';
      paginateInfo.nextlink[i].setAttribute('rel', selectedpage+1);
      paginateInfo.pagelinks[i][paginateInfo.previouspage].className=''; //deselect last clicked on pagination link (previous)
      paginateInfo.pagelinks[i][selectedpage].className='currentpage'; //select current pagination link
    }
    paginateInfo.previouspage=selectedpage; //Update last viewed page info
    pageclass.setCookie(this.pageinfo.persistlabel, selectedpage);
    this.limitpagerange(selectedpage); //limit range of page links displayed (if applicable)
  },

  limitpagerange:function(selectedpage){
    //reminder: selectedpage count starts at 0 (0=1st page)
    var currentrange=null;
    var paginateInfo=this.paginateInfo;
    if (this.dopagerange){
      var visiblelinks=pageclass.pagerange-1; //# of visible page links other than currently selected link
      var visibleleftlinks=Math.floor(visiblelinks/2); //calculate # of visible links to the left of the selected page
      var visiblerightlinks=visibleleftlinks+(visiblelinks%2==1? 1 : 0); //calculate # of visible links to the right of the selected page
      if (selectedpage<visibleleftlinks){ //if not enough room to the left to accomodate all visible left links
        var overage=visibleleftlinks-selectedpage;
        visibleleftlinks-=overage; //remove overage links from visible left links
        visiblerightlinks+=overage; //add overage links to the visible right links
      }
      else if ((this.pageinfo.pages.length-selectedpage-1)<visiblerightlinks){ //else if not enough room to the left to accomodate all visible right links
        var overage=visiblerightlinks-(this.pageinfo.pages.length-selectedpage-1);
        visiblerightlinks-=overage; //remove overage links from visible right links
        visibleleftlinks+=overage; //add overage links to the visible left links
      }
      currentrange=[selectedpage-visibleleftlinks, selectedpage+visiblerightlinks]; //calculate indices of visible pages to show: [startindex, endindex]
      var previousrange=paginateInfo.previousrange; //retrieve previous page range
      for (var i=0; i<paginateInfo.divs.length; i++){ //loop through paginate divs
        if (previousrange){ //if previous range is available (not null)
          for (var p=previousrange[0]; p<=previousrange[1]; p++){ //hide all page links
            paginateInfo.pagelinks[i][p].style.display='none';
          }
        }
        for (var p=currentrange[0]; p<=currentrange[1]; p++){ //reveal all active page links
          paginateInfo.pagelinks[i][p].style.display='inline';
        }
        paginateInfo.pagelinks[i][0].style.display='inline'; //always show 1st page link
        paginateInfo.pagelinks[i][this.pageinfo.pages.length-1].style.display='inline'; //always show last page link
        paginateInfo.leftellipse[i].style.display=(currentrange[0]>1)? 'inline' : 'none'; //if starting page is page3 or higher, show ellipse to page1
        paginateInfo.rightellipse[i].style.display=(currentrange[1]<this.pageinfo.pages.length-2)? 'inline' : 'none'; //if end page is 2 pages before last page or less, show ellipse to last page
      }
    }
    paginateInfo.previousrange=currentrange;
  },

  checkQueryItemChange : function() {
    var pageinfo=this.pageinfo;
    require(['dojox/storage'], function(){
      provider=dojox.storage.manager.getProvider();
      provider.initialize();
      var myObject = provider.get('Query-Item');
      if(myObject)
        pageinfo.pages=pageclass.initialPageUrl(pageinfo.totalpages, myObject.newQueryUrl);
    });
  },

  subscribeTopic : function() {
    dojo.subscribe('Data-First-Load', this, 'buildFirstPage');
    dojo.subscribe('Data-Load', this, 'buildPage');
  }

};
