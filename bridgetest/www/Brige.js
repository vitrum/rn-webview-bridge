(function(object){
    var checkPrams = {
        isString:function(parm){
            return Object.prototype.toString.call(parm) === "[object String]";
        },
        isObject:function(parm){
            return Object.prototype.toString.call(parm) === "[object Object]";
        },
        isFunction:function(parm){
            return Object.prototype.toString.call(parm) === "[object Function]";
        }
    };
    var _WebviewBrige = {
        _createSendId:function() {
            return Math.floor((1 + Math.random()) * 0x20000).toString(16);
        },
        _sendList:{}, 
        send:function(action,data ,succCallback , errCallback){
            if(arguments.length < 4){
                console.warn('This function must input 4 parameters : action(String) , data(Object) , succCallback(Function) , errCallback(Function).');
                return false;
            }
            if(!checkPrams.isString(action)){
                console.warn('The [action] parameter of the [send] function must be [String]');
                return false;
            }
            if(!checkPrams.isObject(data)){
                console.warn('The [data] parameter of the [send] function must be [Object]');
                return false;
            }
            if(!checkPrams.isFunction(succCallback)){
                console.warn('The [succCallback] parameter of the [send] function must be [Function]');
                return false;
            }
            if(!checkPrams.isFunction(errCallback)){
                console.warn('The [errCallback] parameter of the [send] function must be [Function]');
                return false;
            }
            var _thisSendID = this._createSendId();

            var sendMesg  = {
                action : action.toLocaleUpperCase(),
                payload   : data,
                sendId : _thisSendID
            };
            window.postMessage(JSON.stringify(sendMesg));
            sendMesg.resolve  =  succCallback;
            sendMesg.reject = errCallback;
            this._sendList[_thisSendID] = sendMesg;
        }
    };
    var debug  = debug || console;

    window.document.addEventListener('message',function(oEvent){
        var oReturnData = JSON.parse(oEvent.data);
        if(oReturnData.type === 'notice'){
            debug.log(oReturnData.action+'已发送成功并被接收。');
            return ;
        }
         var sendInfo = _WebviewBrige._sendList[oReturnData.sendId] ;
        if(!sendInfo){
            debug.error(oReturnData.action+'包括信息丢失') ;
        }else{
            debug.log(oReturnData.action+'已处理完毕并收到回执');
            if(oReturnData.status){
                sendInfo.resolve(oReturnData);
            }else{
                sendInfo.reject(oReturnData);
            }
            delete _WebviewBrige._sendList[oEvent.sendId];
        }
    })
    object.WebviewBrige = _WebviewBrige ;
})(window);