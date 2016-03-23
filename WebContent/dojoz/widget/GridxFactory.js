define('dojoz/widget/GridxFactory', [
'dojo/_base/declare',
'dojo/store/Memory',
'dijit/registry',
'gridx/core/model/cache/Async',
'gridx/Grid'
], function(declare, Memory, registry, Cache, Grid) {
  return declare('dojoz.widget.GridxFactory', null, {

    setting: {
        id: '',
        container: '',
        data: [],
        fields: [],
        modules: [],
        autoHeight: true,
        autoWidth: true,
        headerHidden: false,
        style: ''
    },

    /*
     * 创建 gridx widget.
     *     name : 用来在 window 对象的关联数组中存储 grid 对象.
     *     dataSource : 数据源.
     *     gridModules : gridx模块.
     *     gridContainer : 放置gridx的div容器.
     */
    create : function(options){
        this.setting=dojo.safeMixin(this.setting, options);
        var setting=this.setting;
        this._destroy();

        var myGrid = registry.byId(setting.id);
        if(myGrid){
            myGrid.setStore(new Memory({ data : [] }));
            myGrid.destroy();
        }

        var myStore = new Memory({ data : setting.data });

        myGrid = new Grid({
            id: setting.id,
            cacheClass: Cache,
            store: myStore,
            structure: setting.fields,
            modules: setting.modules,
            autoHeight: setting.autoHeight,
            autoWidth: setting.autoWidth,
            headerHidden: setting.headerHidden,
            style: setting.style
        });
        myGrid.placeAt(setting.container);
        myGrid.startup();

        window.container[setting.id]=myGrid;
    },

    _destroy: function(){
        var myGrid = window.container[this.setting.id];
        if(myGrid){
            myGrid.destroy();
            myGrid = null;
        }
    }

  });
});
