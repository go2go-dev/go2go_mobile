import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AppleLoginButton from './components/AppleLoginButton';

const queryClient = new QueryClient();

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// AsyncStorage 키 상수
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  IS_LOGGED_IN: 'is_logged_in',
} as const;

function App() {
  const webviewRef = useRef<WebView>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [webViewReady, setWebViewReady] = useState(false);
  const [pendingTokens, setPendingTokens] = useState<Tokens | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // 초기화 로딩 상태
  const [tokensSent, setTokensSent] = useState(false); // 토큰 전송 완료 플래그

  // AsyncStorage에서 토큰 불러오기
  const loadStoredTokens = async (): Promise<Tokens | null> => {
    try {
      const [accessToken, refreshToken, isLoggedInStored] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
      ]);

      console.log('💾 저장된 토큰 로드:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isLoggedIn: isLoggedInStored === 'true',
      });

      if (accessToken && refreshToken && isLoggedInStored === 'true') {
        return {accessToken, refreshToken};
      }

      return null;
    } catch (error) {
      console.error('❌ 토큰 로드 실패:', error);
      return null;
    }
  };

  // AsyncStorage에 토큰 저장
  const saveTokensToStorage = async (
    tokensToSave: Tokens,
  ): Promise<boolean> => {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          tokensToSave.accessToken,
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN,
          tokensToSave.refreshToken,
        ),
        AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true'),
      ]);

      console.log('💾 토큰 저장 완료');
      return true;
    } catch (error) {
      console.error('❌ 토큰 저장 실패:', error);
      return false;
    }
  };

  // AsyncStorage에서 토큰 삭제
  const clearStoredTokens = async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
      ]);

      console.log('🗑️ 저장된 토큰 삭제 완료');
    } catch (error) {
      console.error('❌ 토큰 삭제 실패:', error);
    }
  };

  // 앱 시작시 저장된 토큰 확인
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 앱 초기화 시작');

      const storedTokens = await loadStoredTokens();

      if (storedTokens) {
        console.log('✅ 저장된 토큰 발견, 자동 로그인');
        setTokens(storedTokens);
        setIsLoggedIn(true);

        // 웹뷰가 준비되지 않았으면 대기
        if (webViewReady) {
          sendTokensToWebView(storedTokens);
        } else {
          setPendingTokens(storedTokens);
        }
      } else {
        console.log('❌ 저장된 토큰 없음, 로그인 필요');
        setIsLoggedIn(false);
      }

      setIsInitializing(false);
    };

    initializeApp();
  }, [webViewReady]);

  const handleTokens = async (receivedTokens: any) => {
    const flattenedTokens = {
      accessToken: receivedTokens.result?.accessToken,
      refreshToken: receivedTokens.result?.refreshToken,
    };

    console.log('🎯 로그인 성공, 토큰 수신:', {
      accessToken: `${flattenedTokens.accessToken?.substring(0, 30)}...`,
      refreshToken: `${flattenedTokens.refreshToken?.substring(0, 30)}...`,
    });

    // AsyncStorage에 저장
    const saveSuccess = await saveTokensToStorage(flattenedTokens);
    if (!saveSuccess) {
      console.error('❌ 토큰 저장 실패');
      return;
    }

    setTokens(flattenedTokens);
    setIsLoggedIn(true);

    // 웹뷰가 준비되었으면 바로 전송, 아니면 대기
    if (webViewReady) {
      sendTokensToWebView(flattenedTokens);
    } else {
      console.log('⏳ 웹뷰 준비 대기중, 토큰 임시 저장');
      setPendingTokens(flattenedTokens);
    }
  };

  const sendTokensToWebView = (tokensToSend: Tokens) => {
    if (!tokensToSend?.accessToken || !tokensToSend?.refreshToken) {
      console.log('❌ 유효하지 않은 토큰:', tokensToSend);
      return;
    }

    if (!webViewReady) {
      console.log('❌ 웹뷰가 준비되지 않음');
      return;
    }

    console.log('📤 웹뷰로 토큰 전송 시작:', {
      accessToken: `${tokensToSend.accessToken.substring(0, 30)}...`,
      refreshToken: `${tokensToSend.refreshToken.substring(0, 30)}...`,
    });

    // 방법 1: postMessage 사용
    webviewRef.current?.postMessage(JSON.stringify(tokensToSend));

    // 방법 2: JavaScript 주입
    const jsCode = `
      (function() {
        try {
          console.log('[RN→Web] 토큰 전송 시작');
          
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
              
              // 커스텀 이벤트 발생
              window.dispatchEvent(new CustomEvent('tokensReceived', {
                detail: { method: 'autoLogin' }
              }));
              console.log('[RN→Web] 이벤트 발생 완료');
              
              // 성공 표시
              if (document.body) {
                document.body.style.border = '3px solid green';
                setTimeout(() => {
                  if (document.body) {
                    document.body.style.border = '';
                  }
                }, 2000);
              }
              
              // React Native에 성공 신호 전송
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('TOKEN_SAVED_SUCCESS');
              }
              
              return 'SUCCESS';
            } catch (error) {
              console.error('[RN→Web] 토큰 저장 실패:', error);
              
              // React Native에 실패 신호 전송
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('TOKEN_SAVED_ERROR');
              }
              
              return 'ERROR: ' + error.message;
            }
          };
          
          // 즉시 실행
          executeTokenSave();
          
        } catch (error) {
          console.error('[RN→Web] 전체 실행 실패:', error);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('TOKEN_SAVED_CRITICAL_ERROR');
          }
          return 'CRITICAL_ERROR: ' + error.message;
        }
      })();
    `;

    webviewRef.current?.injectJavaScript(jsCode);
    console.log('💉 JavaScript 주입 완료');

    // 대기중인 토큰 클리어
    setPendingTokens(null);
  };

  const resendTokens = () => {
    if (tokens) {
      console.log('🔁 토큰 재전송');
      setTokensSent(false); // 재전송을 위해 플래그 리셋
      sendTokensToWebView(tokens);
    } else {
      console.log('❌ 재전송할 토큰이 없음');
    }
  };

  const handleLogout = async () => {
    console.log('👋 로그아웃');

    // AsyncStorage에서 토큰 삭제
    await clearStoredTokens();

    setIsLoggedIn(false);
    setTokens(null);
    setWebViewReady(false);
    setPendingTokens(null);
    setTokensSent(false); // 토큰 전송 플래그 리셋
  };

  // 웹뷰 준비 완료 처리
  const handleWebViewReady = () => {
    console.log('✅ 웹뷰 준비 완료');
    setWebViewReady(true);

    // 대기중인 토큰이 있으면 전송
    if (pendingTokens) {
      console.log('📤 대기중인 토큰 전송');
      sendTokensToWebView(pendingTokens);
    }
  };

  // 초기화 중일 때 로딩 화면
  if (isInitializing) {
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingScreen}>
            <Text style={styles.loadingText}>앱을 시작하는 중...</Text>
          </View>
        </SafeAreaView>
      </QueryClientProvider>
    );
  }

  // 로그인되지 않은 상태
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

  // 로그인된 상태 - 웹뷰 표시
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
              <Text style={styles.statusText}>
                전송:{' '}
                {tokensSent ? '✅ 완료' : pendingTokens ? '⏳ 대기' : '❌ 없음'}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={resendTokens}>
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
            // 새로고침 방지 설정
            pullToRefreshEnabled={false}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={styles.webview}
            onMessage={event => {
              const message = event.nativeEvent.data;
              console.log('📨 WebView 메시지 수신:', message);

              switch (message) {
                case 'WEBVIEW_READY':
                  handleWebViewReady();
                  break;
                case 'TOKEN_SAVED_SUCCESS':
                  console.log('✅ 토큰 저장 성공 확인');
                  setTokensSent(true);
                  break;
                case 'TOKEN_ALREADY_EXISTS':
                  console.log('ℹ️ 토큰이 이미 존재함');
                  setTokensSent(true);
                  break;
                case 'TOKEN_SAVED_ERROR':
                  console.log('❌ 토큰 저장 실패');
                  break;
                case 'TOKEN_SAVED_CRITICAL_ERROR':
                  console.log('💥 토큰 저장 심각한 오류');
                  break;
                case 'TOKENS_CLEARED':
                  console.log('🗑️ 웹에서 토큰 삭제됨');
                  setTokensSent(false);
                  break;
                default:
                  // JSON 메시지 파싱 시도
                  try {
                    const parsed = JSON.parse(message);
                    if (parsed.type === 'ROUTER_ERROR') {
                      console.log(
                        '🚨 웹뷰 라우터 에러:',
                        parsed.error,
                        'Path:',
                        parsed.path,
                      );
                      // 라우터 에러 발생시 토큰 재전송 시도 (한 번만)
                      if (tokens && !tokensSent) {
                        console.log('🔄 라우터 에러로 인한 토큰 재전송');
                        setTimeout(() => {
                          sendTokensToWebView(tokens);
                        }, 1000);
                      }
                    }
                  } catch {
                    console.log('📨 기타 메시지:', message);
                  }
              }
            }}
            onLoadStart={() => {
              console.log('🔄 WebView 로드 시작');
              setWebViewReady(false); // 로드 시작시 준비 상태 리셋
              setTokensSent(false); // 토큰 전송 플래그 리셋
            }}
            onLoadEnd={() => {
              console.log('✅ WebView 로드 완료, 준비 상태 확인 시작');

              // 웹뷰에 준비 상태 확인 요청
              const checkReadyCode = `
                (function() {
                  try {
                    const checkReactReady = () => {
                      // React 앱과 이벤트 리스너가 모두 준비되었는지 확인
                      if (document.readyState === 'complete' && 
                          (document.querySelector('#root') || document.querySelector('[data-reactroot]')) &&
                          window.receiveTokensFromRN) {
                        console.log('[WebView] React 앱과 이벤트 리스너 준비 완료');
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
                    
                    // 여러 번 재시도
                    let attempts = 0;
                    const maxAttempts = 10;
                    const interval = setInterval(() => {
                      attempts++;
                      if (checkReactReady() || attempts >= maxAttempts) {
                        clearInterval(interval);
                      }
                    }, 500);
                    
                    return 'CHECKING_WITH_RETRY';
                  } catch (error) {
                    console.error('[WebView] 준비 상태 확인 실패:', error);
                    return 'ERROR';
                  }
                })();
              `;

              webviewRef.current?.injectJavaScript(checkReadyCode);
            }}
            onError={syntheticEvent => {
              const {nativeEvent} = syntheticEvent;
              console.log('❌ WebView 에러:', nativeEvent);
              setWebViewReady(false);
            }}
            onHttpError={syntheticEvent => {
              const {nativeEvent} = syntheticEvent;
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
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
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
