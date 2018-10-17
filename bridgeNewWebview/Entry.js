import React, {Component} from 'react';
import {Platform, StyleSheet, View, Text,} from 'react-native';
import { WebView } from 'react-native-webview';
import { List,InputItem ,Modal,TextareaItem , Accordion,Toast,ImagePicker as AntImagePicker} from 'antd-mobile-rn';
import ImagePicker from 'react-native-image-picker';
import Mock from "mockjs";
//https://www.jianshu.com/p/727c9d4c080c  关于ImagePicker的API及使用说明

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
    const { action  , payload = {} ,sendId} = sendMesg;
    let result = '';
    switch(action){
      case 'PIC_AND_VEDIO' :
      ImagePicker.showImagePicker({
        ...payload
      }, async response => {
          let status = false;
          if (response.didCancel) {
              result = 'User cancelled image picker';
              console.log(result);
          } else if (response.error) {
              result = response.error;
              console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
              result = response.customButton;
              console.log('User tapped custom button: ', response.customButton)
          } else {
            status = true;
            result = response.data;
          }
          this.sendNativeResult({
            result,
            status ,
            sendId,
            action
          })
        })
      break;

      case 'LOGIN' : 
        //login类型的action 处理 : 显示native的登录框，在操作结果中获取对应信息并回发 webview
        this.setState({loginModalState:true,splitImage:sendId}) ; 
      break;

      default : 
        result = '当前ACTION尚未定义和实现';
        this.sendNativeResult({
          result,
          status :String(Math.random()).slice(-1)%2,
          sendId,
          action
        })
       break;
    }
  }
  //接收来自 webview发送的信息
  onWebViewMessage(event){
    let {times} = this.state;
    this.setState({
      reciveHTML : event.nativeEvent.data ,
      times:times+=1,
    });
      
    //解构收到的信息
    const  {action , payload, sendId } = JSON.parse(event.nativeEvent.data) || {};

    //先发送一个通知给webview 告知已收到。
    this.myWebView.postMessage(
      JSON.stringify({
        action,sendId,
        success:true ,
        type:'notice'
      })
    );
    
    //处理具体的task
    this.handle({payload,action,sendId});
  }

  //把native处理的具体结果 发送给webview
  sendNativeResult(handleData){
    let updateState = handleData.updateState || {};
    if(handleData.updateState){ delete handleData.updateState;}

    const returnData = {
      type:'handleResult',
      ...handleData
      // action,
      // sendId,
      // payload:{
      //   ...payload ,
      //   result : handleData.result
      // },
      // status:handleData.status
    };

    this.myWebView.postMessage(
      JSON.stringify(returnData)
    );
  
    this.setState({
      returnHTML : JSON.stringify(returnData),
      ...updateState
    });
  }

  //LOGIN提交函数
  loginResult(status){
    const {splitImage,nickName,pwd} = this.state;
    if(status && (!nickName || !pwd)){
      this.setState({
        tip:true,
        tipMesg:'请输入用户名和密码'
      });
      return ;
    }
    let result = {
      pwd,
      nickName,
      loginTime:+ new Date(),
      token:Mock.mock('@word(12, 15)'),
      userId:Mock.mock({ 'regexp': /\d{3,5}/ }).regexp 
    } ;
    if(!status){result = {mesg:'User cancel login.'}}
    this.sendNativeResult({
      result,
      status ,
      sendId:splitImage,
      action:'LOGIN',
      updateState:{
        loginModalState:false,
        pwd:'',
        nickName:'',
        tip:false
      }
    })
  }
  render() {
    const {reciveHTML,returnHTML ,times} = this.state;
    const {loginModalState ,nickName , pwd ,tip , tipMesg} = this.state;
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
          
        <Modal
          title="Login"
          transparent={true}
          maskClosablet={false}
          visible={loginModalState}
          closablet={true}
          footer={[
            { text: '登录失败', onPress: () => this.loginResult(false) },
            { text: '登录成功', onPress: () => this.loginResult(true) },
          ]}
        >
          <View style={{ paddingVertical: 20 }}>
            <List>
              <InputItem clear={true} placeholder={"请输入用户名"} value={nickName} onChange={val=>this.setState({nickName:val})}>用户名：</InputItem>
              <InputItem type="password" clear={true} placeholder={"请输入密码"} value={pwd}  onChange={val=>this.setState({pwd:val})}>密  码：</InputItem>
            </List>
            { tip && <Text style={styles.tipMesg}>{tipMesg}</Text> }
          </View>
        </Modal>

        {/* <AntImagePicker
          onChange={(file,operationType,index)=>{
            this.setState({
              returnHTML : JSON.stringify({
                file,operationType,index
              }),
            });
          }}
          onImageClick={
            (index,file)=>{
              this.setState({
                returnHTML : JSON.stringify({
                  file,index
                }),
              });
            }
          }
          multiple={true}
          onAddImageClick={(a)=>{window.alert(a)}}
          files={[{
            url: 'https://zos.alipayobjects.com/rmsportal/PZUUCKTRIHWiZSY.jpeg',
            id: '2121',
          }, {
            url: 'https://zos.alipayobjects.com/rmsportal/hqQWgTXdrlmVVYi.jpeg',
            id: '2122',
          }]}
        /> */}

        
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
    paddingTop:30
  },
  tipMesg:{
    color:'red',
    paddingLeft:18,
    paddingTop:5
  },
  webview: {
    height: 250,
    backgroundColor:'#FFB440'
  }
});
