define('dojoz/tree/RichTreeFactory', [
'dojo/_base/declare',
'dojo/store/Memory',
'dijit/tree/ObjectStoreModel',
'dijit/Tree'
], function(declare, Memory, ObjectStoreModel, Tree){

  return declare('dojoz.tree.RichTreeFactory', null, {

    setting: {
        root: null,
        getChildren: null,
        container: null,
        decorator: null,
        onOpen: null
    },

    create: function(name, datas, options){
        this.setting=dojo.safeMixin(this.setting, options);
        
        this._destroy(name);
        
        var setting=this.setting;

        // Create store, adding the getChildren() method required by ObjectStoreModel
        var myStore = new Memory({
            data: datas,
            getChildren: setting.getChildren
        });

        // Create the model
        var myModel = new ObjectStoreModel({
            store: myStore,
            labelAttr: 'name',
            labelType: 'html',
            query: {id: setting.root},/* 查询根节点，必须是 {id: XXXX} */
            mayHaveChildren: function(item){
                return this.store.getChildren(item).length>0;
            }
        });
 
        // Create the Tree.
        var tree = new Tree({
            model: myModel,
            autoExpand: true,
            showRoot: false,
            openOnClick: true,/* 单击展开节点 */
            getLabel: function(item) {//decorator
                if(setting.decorator!=undefined && setting.decorator!=null)
                    return setting.decorator(item);
            },
            onClick: function(item) {//onOpen
              if(setting.onOpen!=undefined && setting.onOpen!=null)
                setting.onOpen(item);
            }
        });

        tree.placeAt(setting.container);
        tree.startup();
        
        window[name] = tree;
    },

    _destroy: function(name){
        var tree = window[name];
        if(tree){
            tree.destroy();
            tree = undefined;
        }
    }

  });
});
