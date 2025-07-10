import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import WebView from 'react-native-webview';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AppleLoginButton from './components/AppleLoginButton';

const queryClient = new QueryClient();

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

function App() {
  const webviewRef = useRef<WebView>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [webViewReady, setWebViewReady] = useState(false);

  const handleTokens = (receivedTokens: any) => {
    const flattenedTokens = {
      accessToken: receivedTokens.result?.accessToken,
      refreshToken: receivedTokens.result?.refreshToken,
    };

    console.log('🎯 로그인 성공, 토큰 수신:', flattenedTokens);
    setTokens(flattenedTokens);
    setIsLoggedIn(true);
  };

  const sendTokensToWebView = (tokensToSend: Tokens) => {
    if (!tokensToSend?.accessToken || !tokensToSend?.refreshToken) {
      console.log('❌ 유효하지 않은 토큰:', tokensToSend);
      return;
    }

    console.log('📤 웹뷰로 토큰 전송 시작:', {
      accessToken: `${tokensToSend.accessToken.substring(0, 30)}...`,
      refreshToken: `${tokensToSend.refreshToken.substring(0, 30)}...`,
    });

    // 방법 1: postMessage 사용
    webviewRef.current?.postMessage(JSON.stringify(tokensToSend));

    // 방법 2: 더 안전한 JavaScript 주입
    const jsCode = `
      (function() {
        try {
          console.log('[RN→Web] 토큰 전송 시작');
          
          // React 렌더링을 방해하지 않도록 안전하게 실행
          const executeTokenSave = () => {
            try {
              const tokens = ${JSON.stringify(tokensToSend)};
              
              // localStorage에 직접 저장
              localStorage.setItem('accessToken', tokens.accessToken);
              localStorage.setItem('refreshToken', tokens.refreshToken);
              console.log('[RN→Web] localStorage 저장 완료');
              
              // 전역 함수가 있다면 호출
              if (window.receiveTokensFromRN && typeof window.receiveTokensFromRN === 'function') {
                window.receiveTokensFromRN(JSON.stringify(tokens));
                console.log('[RN→Web] 전역 함수 호출 완료');
              }
              
              // 커스텀 이벤트 발생 (React 렌더링 사이클과 충돌 방지)
              setTimeout(() => {
                try {
                  window.dispatchEvent(new CustomEvent('tokensReceived', {
                    detail: { method: 'injectJavaScript' }
                  }));
                  console.log('[RN→Web] 이벤트 발생 완료');
                } catch (eventError) {
                  console.error('[RN→Web] 이벤트 발생 실패:', eventError);
                }
              }, 100);
              
              // 성공 표시
              if (document.body) {
                document.body.style.border = '3px solid green';
                setTimeout(() => {
                  if (document.body) {
                    document.body.style.border = '';
                  }
                }, 2000);
              }
              
              return 'SUCCESS';
            } catch (error) {
              console.error('[RN→Web] 토큰 저장 실패:', error);
              
              // 실패 표시
              if (document.body) {
                document.body.style.border = '3px solid red';
                setTimeout(() => {
                  if (document.body) {
                    document.body.style.border = '';
                  }
                }, 2000);
              }
              
              return 'ERROR: ' + error.message;
            }
          };
          
          // DOM이 준비되면 실행
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', executeTokenSave);
          } else {
            // 약간의 지연을 두고 실행 (React 렌더링과 충돌 방지)
            setTimeout(executeTokenSave, 300);
          }
          
        } catch (error) {
          console.error('[RN→Web] 전체 실행 실패:', error);
          return 'CRITICAL_ERROR: ' + error.message;
        }
      })();
    `;

    webviewRef.current?.injectJavaScript(jsCode);
    console.log('💉 JavaScript 주입 완료');
  };

  const resendTokens = () => {
    if (tokens) {
      console.log('🔁 토큰 재전송');
      sendTokensToWebView(tokens);
    } else {
      console.log('❌ 재전송할 토큰이 없음');
    }
  };

  const handleLogout = () => {
    console.log('👋 로그아웃');
    setIsLoggedIn(false);
    setTokens(null);
    setWebViewReady(false); // 웹뷰 준비 상태도 리셋
  };

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loginScreen}>
            <Text style={styles.title}>로그인이 필요합니다</Text>
            <AppleLoginButton onLoginSuccess={handleTokens} />
          </View>
        </SafeAreaView>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.webviewContainer}>
          <View style={styles.debugContainer}>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                웹뷰: {webViewReady ? '✅ 준비됨' : '⏳ 로딩중'}
              </Text>
              <Text style={styles.statusText}>
                토큰: {tokens ? '✅ 있음' : '❌ 없음'}
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.debugButton} onPress={resendTokens}>
                <Text style={styles.debugText}>토큰 재전송</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Text style={styles.logoutText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>

          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{uri: 'https://go2go-front.pages.dev/'}}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="compatibility"
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            style={styles.webview}
            onMessage={event => {
              const message = event.nativeEvent.data;
              console.log('📨 WebView 메시지 수신:', message);
              
              // 웹뷰에서 준비 완료 신호 수신
              if (message === 'WEBVIEW_READY') {
                console.log('✅ 웹뷰 준비 완료 신호 수신');
                setWebViewReady(true);
              }
            }}
            onLoadStart={() => {
              console.log('🔄 WebView 로드 시작');
            }}
            onLoadEnd={() => {
              console.log('✅ WebView 로드 완료, 준비 상태 확인 시작');
              
              // 웹뷰에 준비 상태 확인 요청 (빠른 체크)
              const checkReadyCode = `
                (function() {
                  try {
                    // React 앱이 로드되었는지 확인
                    const checkReactReady = () => {
                      // DOM이 준비되고 React 루트가 있는지 확인
                      if (document.readyState === 'complete' && 
                          (document.querySelector('#root') || document.querySelector('[data-reactroot]'))) {
                        console.log('[WebView] React 앱 준비 완료');
                        if (window.ReactNativeWebView) {
                          window.ReactNativeWebView.postMessage('WEBVIEW_READY');
                        }
                        return true;
                      }
                      return false;
                    };
                    
                    // 즉시 체크
                    if (checkReactReady()) {
                      return 'READY_IMMEDIATELY';
                    }
                    
                    // 0.5초 후 재체크 (백업)
                    setTimeout(() => {
                      if (checkReactReady()) {
                        return 'READY_AFTER_DELAY';
                      }
                    }, 500);
                    
                    return 'CHECKING';
                  } catch (error) {
                    console.error('[WebView] 준비 상태 확인 실패:', error);
                    return 'ERROR';
                  }
                })();
              `;
              
              webviewRef.current?.injectJavaScript(checkReadyCode);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('❌ WebView 에러:', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('🌐 WebView HTTP 에러:', nativeEvent);
            }}
          />
        </View>
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loginScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  webviewContainer: {flex: 1},
  debugContainer: {
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  debugButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
  },
  webview: {
    flex: 1,
  },
});

export default App;