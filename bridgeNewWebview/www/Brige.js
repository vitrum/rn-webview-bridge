(function(object){
    //参数类型检测
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
    var debug  = window.debug || console;
    //桥接对象
    var _WebviewBrige = {
        //为 webview发送到native的每个消息 创建唯一ID
        _createSendId:function() {
            return Math.floor((1 + Math.random()) * 0x20000).toString(16);
        },
        //保存所有从webview发送出去的消息队列信息
        _sendList:{}, 
        //真正发送消息给native的函数
        send:function(action,data ,succCallback , errCallback){
            //参数信息检测

            if(arguments.length < 2){
                console.warn('This function must input at  least 2  parameters : action(String) , data(Object) . others  parameters : succCallback(Function)(Optional) , errCallback(Function)(Optional).');
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
            if( succCallback && !checkPrams.isFunction(succCallback)){
                console.warn('The [succCallback] parameter of the [send] function must be [Function]');
                return false;
            }
            if(errCallback && !checkPrams.isFunction(errCallback)){
                console.warn('The [errCallback] parameter of the [send] function must be [Function]');
                return false;
            }
            var _thisSendID = this._createSendId();
            //组建消息包裹
            var sendMesg  = {
                action : action.toLocaleUpperCase(),
                payload: data,
                sendId : _thisSendID
            };
            //从webview发送消息到native
            window.postMessage(JSON.stringify(sendMesg));

            //保存消息结果回调类型处理函数(如果有的话)
            if(succCallback){ sendMesg.resolve  =  succCallback;}
            if(errCallback){  sendMesg.reject = errCallback;}

            //保存当前消息到队列中
            this._sendList[_thisSendID] = sendMesg;

            var _sendList = this._sendList;
            return new Promise(function(resolve ,reject){
                _sendList[_thisSendID].promiseResolve = resolve;
                _sendList[_thisSendID].promiseReject = reject;
            });
        }
    };
    

    window.document.addEventListener('message',function(oEvent){
        var oReturnData = JSON.parse(oEvent.data);
        //通知类型的消息
        if(oReturnData.type === 'notice'){
            debug.log(oReturnData.action+'已发送成功并被接收。');
            return ;
        }
         var sendInfo = _WebviewBrige._sendList[oReturnData.sendId] ;
        if(!sendInfo){
            debug.error(oReturnData.action+'包裹信息丢失') ;
        }else{
            debug.log(oReturnData.action+'已处理完毕并收到回执');
            //根据native处理的状态，把结果传递给消息对应的处理函数中
            if(oReturnData.status){
                sendInfo.resolve && sendInfo.resolve(oReturnData);
                sendInfo.promiseResolve && sendInfo.promiseResolve(oReturnData);
            }else{
                sendInfo.reject && sendInfo.reject(oReturnData);
                sendInfo.promiseReject && sendInfo.promiseReject(oReturnData);
            }
            delete _WebviewBrige._sendList[oEvent.sendId];
        }
    });
    object.WebviewBrige = _WebviewBrige ;
})(window);