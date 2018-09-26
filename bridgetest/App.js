/**
 Sample React Native App
 https://github.com/facebook/react-native
 *
 @format
 @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, View, Text, WebView, ToastAndroid, Linking, StatusBar, TouchableHighlight, Alert} from 'react-native';

export default class App extends Component <Props> {
  constructor(props){
    super(props);
      this.onMessage = this.onMessage.bind(this);
      this.source = require(`./www/index.html`);
      this.state = {
        webViewData: ''
      };
      this.data = 0;
      this.sendMessage = this.sendMessage.bind(this);
      this.handleMessage = this.handleMessage.bind(this);
      this.onWebViewMessage = this.onWebViewMessage.bind(this);
  }
  sendMessage() {
    this.myWebView.postMessage(++this.data);
  }
  handleMessage(e) {
    this.setState({ webViewData: JSON.parse(e.nativeEvent.data) });
    this.checkNativeEvnet(JSON.parse(e.nativeEvent.data))
  }
  checkNativeEvnet = (data) => {
    console.log('checkNativeEvnet',this)
    if(data.command === 'alert'){
      Alert.alert(JSON.stringify(data))
    }
  }
  handleDataReceived(msgData) {
    this.setState({
      text2: `Message from web view ${msgData.data}`
    });
    msgData.isSuccessfull = true;
    msgData.args = [msgData.data % 2 ? "green" : "red"];
    // this.myWebView.postMessage(JSON.stringify(msgData));
    return JSON.stringify(msgData)
  }
  handleLogin(msgData){
    this.setState({
      text2: `Message from web view, try login ${msgData.data}`
    });
    msgData.isSuccessfull = true;
    msgData.args = ['login finish, token is fjdisoajfiodsa']
    return JSON.stringify(msgData)
  }
  onWebViewMessage(event) {
    console.log("Message received from webview");
    let msgData;
    try {
      msgData = JSON.parse(event.nativeEvent.data);
    } catch (err) {
      console.warn(err);
      return;
    }
    let res;
    if(!this[msgData.targetFunc]){
      this.setState({
        text2: `Message from not exist`
      });
      console.log(' onWebViewMessage err');
      msgData.isSuccessfull = true;
      msgData.args = ['Message from not exist']
      res = JSON.stringify(msgData);
    }else{
      res = this[msgData.targetFunc].apply(this, [msgData]);
    }
    console.log('onWebViewMessage ', res);
    this.myWebView.postMessage(res)
  }

  // async onWebViewMessage(event) {
  //   // post back reply as soon as possible to enable sending the next message
  //   this.myWebView.postMessage(event.nativeEvent.data);
  //   let msgData;
  //   try {
  //       msgData = JSON.parse(event.nativeEvent.data);
  //   }
  //   catch(err) {
  //       console.warn(err);
  //       msgData.isSuccessfull = false;
  //       msgData.args = [err];
  //       this.myWebView.postMessage(JSON.stringify(msgData))
  //       return;
  //   }
  //   // invoke target function
  //   try{
  //     const response = this[msgData.targetFunc].apply(this, [msgData]);
  //     if (response instanceof Promise){
  //       // trigger success callback
  //       msgData.isSuccessfull = true;
  //       const response2 = await response.catch((err)=>{msgData.isSuccessfull = false;return err;})
  //       msgData.args = [response2];
  //       this.myWebView.postMessage(JSON.stringify(msgData))
  //     }else{
  //       // trigger success callback
  //       msgData.isSuccessfull = true;
  //       msgData.args = [response];
  //       this.myWebView.postMessage(JSON.stringify(msgData))
  //     }
  //   }catch(e){
  //     msgData.isSuccessfull = false;
  //     msgData.args = [e];
  //     this.myWebView.postMessage(JSON.stringify(msgData))
  //     console.warn(e);
  //   }
  // }
  onMessage(e){
    var event = e.nativeEvent;
    var data = JSON.parse(event.data);
    if(data.type ==='add'){
      let  args= data.data;
      let a = Number(args.A);
      let b = Number(args.B);
      this.refs.webviewRef.postMessage(JSON.stringify({
          result:a+b
       }))
    }
  }
  jumpTo = (data)=>{
    // this.source = {uri: data}
  }
  render() {

    return (
      <View style={styles.container}>

        <View style={styles.container}>
          <TouchableHighlight
            style={styles.button}
            onPress={this.sendMessage}
            >
            <Text>sand to WebView</Text>
          </TouchableHighlight>
        <View>
          <Text>Data from WebView: </Text>
          <Text>{ this.state.text2 }</Text>
        </View>
        </View>
        <WebView 
          style={styles.webview} 
          ref={webview => { this.myWebView = webview; }}
          onMessage={this.onWebViewMessage}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cccccc',
    paddingTop: 40
  },
  button: {
    width: 150,
    height: 40,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    width: 250,
    height: 250
  }
});
