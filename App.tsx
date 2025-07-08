import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import AppleLoginButton from './components/AppleLoginButton';

const queryClient = new QueryClient();

function App() {
  const webviewRef = React.useRef<WebView>(null);

  const handleTokens = (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => {
    webviewRef.current?.postMessage(JSON.stringify(tokens));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <AppleLoginButton onLoginSuccess={handleTokens} />
        </View>
        <WebView
          ref={webviewRef}
          source={{uri: 'https://go2go-front.pages.dev/'}}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
          onMessage={event => {
            console.log('WebView 메시지 수신:', event.nativeEvent.data);
          }}
        />
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loginContainer: {
    padding: 12,
    backgroundColor: '#f0f0f0',
  },
  webview: {flex: 1},
});

export default App;
