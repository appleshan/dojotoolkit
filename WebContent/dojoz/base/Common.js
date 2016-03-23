/**
 * 小工具方法
 */
define('dojoz/base/Common', [
'dojo/_base/declare', 'dojo/dom', 'dojo/dom-class', 'dojo/html','dojo/query',
'dijit/registry',
'dojox/storage', 'dojox/timing'
], function(declare, dom, domClass, html, query, registry, storage, timing) {

    return declare('dojoz.base.Common', null, {

        showLoader : function(clazz, loaderIndex) {
            setTimeout(function(){
              //var loader = dom.byId(loaderDom);
              var a=query(clazz);
//              console.log( 'a.length = '+a.length );
              var loader = a[loaderIndex];
              if(loader)
                  dojo.fadeOut({
                      node: loader,
                      duration: 2000,
                      onEnd: function(){ loader.style.display = 'none'; }}).play();
            }, 100);
        },

        showMessage : function(message, backgroundColor, time) {
            var messagepane = dom.byId('message-pane');
            var messageContainer = dom.byId('message');
            var t = new timing.Timer(time);
            t.onTick = function(){
                html.set(messageContainer, '', {parseContent: false});
                domClass.remove(messagepane, backgroundColor);
            };
            t.onStart = function(){
                html.set(messageContainer, message, {parseContent: false});
                domClass.add(messagepane, backgroundColor);
            };
            t.start();
        },

        getStorageProvider : function() {
          storageProvider=dojox.storage.manager.getProvider();
          storageProvider.initialize();
          return storageProvider;
        },

        setTitle : function(paneDom, siteName) {
          var /*Widget*/ w = registry.byId(paneDom);
          if (w) {
            dojo.subscribe(w.id + '-selectChild', w,
                function(arr) {
                  document.title = this.selectedChildWidget.title + ' - ' + siteName;
                });
          }
        },

        setJuicerTag : function() {
            /** 重置js模板的tag */
            juicer.set({
              'tag::operationOpen': '{@',
              'tag::operationClose': '}',
              'tag::interpolateOpen': '{#',
              'tag::interpolateClose': '}',
              'tag::noneencodeOpen': '{##',
              'tag::noneencodeClose': '}',
              'tag::commentOpen': '{%',
              'tag::commentClose': '}'
            });
        }
    });
});
