/**
 * 保存表单中的内容
 */
define('dojoz/form/Form',
        ['dojo/_base/declare', 'dojo/on', 'dojo/request', 'dijit/registry', 'dojoz/base/Common' ],
        function(declare, on, request, registry, Common) {
    return declare('dojoz.form.Form', null, {
        commonHelper : new Common(),

        initSaveAction : function(callback) {
            var saveform = registry.byId('save-form');
            var submitbutton = registry.byId('submit-button');

            var saveUrl = saveform.get('action');
//            console.log('saveUrl=', saveUrl);

            var showMessage = this.commonHelper.showMessage;
            on(submitbutton, 'click', function(e) {
                dojo.stopEvent(e);
                var result = saveform.validate();
                if (!result) {
                    showMessage('未填写内容', 'message_warn', 5000);
                    return false;
                }
                var params = saveform.get('value');
//                console.log('params=', params);
                request.post(saveUrl, {
                    data : params,
                    handleAs : 'json'
                }).then(function(/*Object*/ response) {
                    console.log('response : ' + dojo.toJson(response));
                    showMessage('保存成功', 'message_warn', 5000);
                    if(callback != undefined )
                        callback();
                });
            });
        }
    });
});
