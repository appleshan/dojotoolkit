/**
 * 以递归方式构建简单的 html 菜单结构
 */
define('dojoz/nav/Menu', [
'dojo/_base/declare', 'dojo/dom', 'dojo/html', 'dojo/on', 'dojo/store/Memory',
'dijit/MenuBar', 'dijit/PopupMenuBarItem',
'dojox/dtl/Context', 'dojox/storage'
], function(declare, dom, html, on, Memory, MenuBar, PopupMenuBarItem, Context, storage) {
    return declare('dojoz.nav.Menu', null, {
      RootMenuTemplate : '/dojotoolkit/templates/juicer/root-menus.html',
      SubMenuTemplate : '/dojotoolkit/templates/juicer/sub-menus.html',
      domContainer : null,
      rootId : null,
      menuStore : null,
      clickEvent : null,

      constructor : function(/* Object */ params){
        this.domContainer = params.domContainer;
        this.clickEvent = params.clickEvent;
        this.menuStore = new Memory({
          data : params.data
        });
        this.rootId = params.rootId;
        _self = this;
      },

      buildMenu : function() {
        var topMenuItems = this.menuStore.query({ pid: this.rootId });
        this.writeMenu(this.RootMenuTemplate, {items : topMenuItems}, this.domContainer );

        this.buildMenuItems(this.SubMenuTemplate, topMenuItems);
        dojo.parser.parse(dom.byId(this.domContainer));
        this.addMenuItemsEvent();
      },

      buildMenuItems: function(htmlTemplate, menuItems) {
        dojo.forEach(menuItems, function(item) {
          var itemId = item['id'];
          var domId = 'Menu-' + itemId;
          var subMenuItems = _self.menuStore.query({ pid: ''+itemId });

          if(subMenuItems != '') {
            _self.writeMenu(htmlTemplate, {items : subMenuItems}, domId );

            var hasSubMenuItems = _self.menuStore.query({ pid: ''+itemId, leaf : '0' });
            if(hasSubMenuItems != '') _self.buildMenuItems(htmlTemplate, hasSubMenuItems);
          }
        });
      },

      writeMenu : function(htmlTemplate, menuItems, domId) {
        var tpl = dojo['cache'](
            new dojo._Url(htmlTemplate),
            {sanitize: true}
          );
        if(tpl) {
          var menuHtml = juicer(tpl, menuItems);
          //html.set(domId, menuHtml, {parseContent: true});//TODO:[html.set()]为什么不行？
        //var template = new dojox.dtl.Template(tpl);
        //var context = new Context(menuItems);
        //var menuHtml = template.render(context);
        //console.debug(menuHtml);
          dojo.place(menuHtml, domId);
        }
      },

      /**
       * 为叶子节点添加事件
       */
      addMenuItemsEvent: function() {
        //查找需要添加事件的叶子节点
        var leafMenuItems = this.menuStore.query({ leaf : '1' });
        dojo.forEach(leafMenuItems, function(item) {
          var leafId = 'Leaf-' + item['id'];
          dojo.connect(dojo.byId(leafId), 'click', _self.clickEvent);
        });
      }
    });
});
