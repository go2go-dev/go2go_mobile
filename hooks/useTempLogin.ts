import { useMutation } from '@tanstack/react-query';

interface TempLoginRequest {
  nickname: string;
}

interface TempLoginResponse {
  accessToken: string;
  refreshToken: string;
}

const useTempLogin = () =>
  useMutation<TempLoginResponse, Error, TempLoginRequest>({
    mutationFn: async (loginData: TempLoginRequest) => {
      console.log('임시 로그인 API 호출', loginData);
      
      const res = await fetch('https://munchi.site/api/auth/temp/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('임시 로그인 API 실패', res.status, errorText);
        throw new Error(`임시 로그인 실패: ${res.status}`);
      }

      const data: TempLoginResponse = await res.json();
      console.log('임시 로그인 API 응답', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('임시 로그인 성공:', data);
    },
    onError: (error) => {
      console.error('임시 로그인 에러:', error);
    },
  });

export default useTempLogin;