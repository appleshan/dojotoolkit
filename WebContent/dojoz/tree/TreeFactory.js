define('dojoz/tree/TreeFactory', [
'dojo/_base/declare',
'dojo/store/Memory',
'dijit/tree/ObjectStoreModel',
'dijit/Tree'
], function(declare, Memory, ObjectStoreModel, Tree){

  return declare('dojoz.tree.TreeFactory', null, {

    setting: {
        name: '',
        data: null,
        container: null,
        root: null,
        showRoot: true,
        getChildren: null,
        onOpen: null
    },

    create: function(options){
        this.setting=dojo.safeMixin(this.setting, options);
        var setting=this.setting;
        this._destroy();

        // Create store, adding the getChildren() method required by ObjectStoreModel
        var myStore = new Memory({
            data: setting.data,
            getChildren: setting.getChildren
        });

        // Create the model
        var myModel = new ObjectStoreModel({
            store: myStore,
            labelAttr: 'name',
            labelType: 'text',
            query: {id: setting.root},/* 查询根节点，必须是 {id: XXXX} */
            mayHaveChildren: function(item){//TODO: mayHaveChildren应该参数化
                return this.store.getChildren(item).length>0;
            }
        });

        // Create the Tree.
        var tree = new Tree({
            model: myModel,
            autoExpand: true,
            showRoot: setting.showRoot,
            onClick: function(item, node, evt) {//TODO:test 'openHandler'
                if(setting.onOpen!=undefined && setting.onOpen!=null)
                    setting.onOpen(item, node, evt);
            }
        });
        tree.placeAt(setting.container);
        tree.startup();

        window.container[setting.name] = tree;
    },

    _destroy: function(){
        var tree = window.container[this.setting.name];
        if(tree){
            tree.destroy();
            tree = undefined;
        }
    }

  });
});
