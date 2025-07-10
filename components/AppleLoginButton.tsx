import React from 'react';
import {Button} from 'react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import useAppleLogin from '../hooks/useAppleLogin';

interface Props {
  onLoginSuccess: (tokens: {accessToken: string; refreshToken: string}) => void;
}

const AppleLoginButton: React.FC<Props> = ({onLoginSuccess}) => {
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
      console.log('Apple 로그인 t성공', tokens);
      onLoginSuccess(tokens);
    } catch (e) {
      console.error('Apple 로그인 실패', e);
    }
  };

  return <Button title="Apple로 로그인" onPress={handleAppleLogin} />;
};

export default AppleLoginButton;
