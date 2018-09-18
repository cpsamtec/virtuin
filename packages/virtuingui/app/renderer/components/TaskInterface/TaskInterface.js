import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import styles from './TaskInterface.css';
const WebView = require('react-electron-web-view');
// eslint-disable-next-line no-unused-vars
import ResizeListener from './ResizeListener';

class TaskInterface extends Component {

  static propTypes = {
    viewURL: PropTypes.string.isRequired
  }

  state = {
    iFrameHeight: '101px',
    url: "http://wwww.google.com"
  };

  getHeight = () => {
    const wv = this.webView;
    // if (wv) {
    //   this.setState({
    //     "iFrameHeight": wv.c.offsetHeight+'px' || '100px'
    //   });
    // }
    // const obj = ReactDOM.findDOMNode(this);
    // const height = obj.scrollHeight + 'px';
    // console.log(`getHeight: ${height}`);
    // this.setState({
    //   "iFrameHeight": '100%'
    // });
    // this.webView.style.height = `${this.webView.contentDocument.body.offsetHeight}px`;
    // this.webView.contentDocument.body.style.overflow = 'hidden';
  }

  componentDidMount() {
    if (this.webview == null) return;
    this.webview.addEventListener('dom-ready', this.domReady);
    // this.webview.src = 'https://www.github.com';
    // this.myRef.src = 'https://www.github.com';
    // this.myRef.loadURL('https://www.github.com');
    // const webviewShell = this.myRef;
    // const trueWebView = ReactDOMServer.renderToStaticMarkup(<webview style={{ width: '100%', height: '100%' }} />);
    // webviewShell.innerHTML = trueWebView.toString();
    // this.webview = webviewShell.querySelector('webview');
    // this.webview.addEventListener('did-finish-load', this.didStopLoading);
    // this.webview.addEventListener('did-fail-load', this.didFailLoad);
    // this.webview.src = 'https://www.github.com';
    // this.loadURL('');
    // setTimeout(() => {
    //   this.loadURL(this.props.viewURL)
    // }, 5000);
    //
    // addResizeListener(this.webView.contentDocument.body, () => {
    //   this.webView.style.height = `${this.webView.contentDocument.body.offsetHeight}px`;
    // });
    // window.addEventListener("resize", this.getHeight);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.getHeight);
  }

  componentWillReceiveProps(props) {
    console.log('!!!!! componentWillReceiveProps');
  }

  domReady = () => {
    console.log('!!!!! domReady');
    this.webview.loadURL(this.props.viewURL);
    this.webview.removeEventListener('dom-ready', this.domReady);
  }

  didStopLoading = () => {
    console.log('!!!!! didStopLoading');
    if (this.webview.src === '') {
      this.loadURL('https://www.npmjs.org')
    }
  }

  didFailLoad = (err: {}) => {
    console.log('!!!!! didFailLoad');
  }

  loadURL = (url: string) => {
    if (this.webview.src !== '') {
      this.webview.stop();
      this.webview.clearHistory();
      this.webview.src = url;
      this.webview.loadURL(url);
    } else {
      this.webview.src = url;
    }
  }

  // Need to get data URL as prop
  render() {
    console.log('!!!!! render');
    return (
        <webview
          className={styles.webView}
          style={{ height: '100%' }}
          autosize="on"
          src={this.props.viewURL}
          ref={(node) => { this.webview = node; }}
        />
    );
    // return (
    //   <WebView
    //     className={styles.webView}
    //     ref={(webView) => { this.webView = webView; }}
    //     src={this.props.viewURL}
    //   />
    // );
    // return (
    //   <object
    //     ref={(webView) => { this.webView = webView; }}
    //     className={styles.webView}
    //     type="text/html"
    //     data={this.props.viewURL}
    //   >
    //     Nothing to display
    //   </object>
    // );
  }
}

//
//        onLoad={this.getHeight}
// onLoad={this.getHeight}

export default TaskInterface;
