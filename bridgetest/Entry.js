import React, {Component} from 'react';
import {Platform, StyleSheet, View, Text, WebView, ToastAndroid, Linking, StatusBar, TouchableHighlight, Alert} from 'react-native';
import { Button ,TextareaItem , Accordion} from 'antd-mobile-rn';
import Mock from "mockjs";


export default class Entry extends Component <Props> {
  constructor(props){
    super(props);
      this.source = require(`./www/test.html`);
      this.state = {
        reciveHTML:'',
        returnHTML :'',
        times:0
      };
  }
  //实际处理客户端请求的函数
  handle(sendMesg){
    const { action  , payload } = sendMesg;
    let result = '';
    switch(action){
      case 'UPPERCASE' : result = String(payload.str).toLocaleUpperCase() ; break;
      case 'LOGIN' : result = {
        userId:Mock.mock({ 'regexp': /\d{3,5}/ }).regexp ,
        nickName:Mock.Random.csentence(8),
        loginTime:+ new Date(),
        token:Mock.mock('@word(12, 15)')
      } ;break;
      default : result = '当前ACTION尚未定义和实现'; break;
    }
    return {
      status:String(Math.random()).slice(-1)%2,
      result
    };
  }
  onWebViewMessage(event){
    let {times} = this.state;
    this.setState({
      reciveHTML : event.nativeEvent.data ,
      times:times+=1
    });
      
    //解构收到的信息
    const  {action , payload, sendId } = JSON.parse(event.nativeEvent.data) || {};
    //先回执一个收到的通知。
    this.myWebView.postMessage(
      JSON.stringify({
        action,sendId,
        success:true ,
        type:'notice'
      })
    );
    
    const handleData = this.handle({payload,action});
    const returnData = {
      action,
      sendId,
      type:'handleResult',
      payload:{
        ...payload ,
        result : handleData.result
      },
      status:handleData.status
    };

    this.myWebView.postMessage(
      JSON.stringify(returnData)
    );
    
    this.setState({
      returnHTML : JSON.stringify(returnData)
    });
  }
  render() {
    const {reciveHTML,returnHTML ,times} = this.state;
    return (
      <View style={styles.container}>
          <Text>This is the RN area。 接收{times}次消息。</Text>

         <Accordion>
          <Accordion.Panel header="HTML发送的信息"  >
            {
              reciveHTML?
              <TextareaItem rows={4}  autoHeight style={{ paddingVertical: 5 }} defaultValue={reciveHTML} editable={false} />
              :<Text>暂无信息</Text>
            }
          </Accordion.Panel>
          <Accordion.Panel header="处理action后回执(回发HTML)" >
            {
              returnHTML?
              <TextareaItem rows={4}  autoHeight style={{ paddingVertical: 5 }}  defaultValue={returnHTML} editable={false} />
              :<Text>暂无信息</Text>
            }
          </Accordion.Panel>
          </Accordion>

        
        <WebView 
          style={styles.webview} 
          ref={webview => { this.myWebView = webview; }}
          onMessage={this.onWebViewMessage.bind(this)}
          automaticallyAdjustContentInsets={false} 
          javaScriptEnabled={true} 
          source={this.source} 
          /> 
      </View>
    );

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#009999',
    padding:10,
    paddingTop:30,
  },
  webview: {
    height: 250,
    backgroundColor:'#FFB440'
  }
});
