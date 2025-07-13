import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import useAppleLogin from '../hooks/useAppleLogin';

interface Props {
  onLoginSuccess: (tokens: { accessToken: string; refreshToken: string }) => void;
}

const AppleLoginButton: React.FC<Props> = ({ onLoginSuccess }) => {
  const mutation = useAppleLogin();

  const handleAppleLogin = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const payload = {
        state: 'some_state',
        code: appleAuthRequestResponse.authorizationCode ?? '',
        id_token: appleAuthRequestResponse.identityToken ?? '',
        user: {
          email: appleAuthRequestResponse.email ?? '',
          firstName: appleAuthRequestResponse.fullName?.givenName ?? '',
          lastName: appleAuthRequestResponse.fullName?.familyName ?? '',
        },
      };

      const tokens = await mutation.mutateAsync(payload);
      console.log('Apple 로그인 성공', tokens);
      onLoginSuccess(tokens);
    } catch (e) {
      console.error('Apple 로그인 실패', e);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleAppleLogin} activeOpacity={0.8}>
      {/* Apple 로고 (assets/apple_logo.png 등) */}
      <Image
        source={require('../assets/logo_Apple.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.text}>Apple로 로그인</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    height: 44,
    width: 260,
    justifyContent: 'center',
  },
  logo: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppleLoginButton;
