import {useMutation} from '@tanstack/react-query';

const useAppleLogin = () =>
  useMutation({
    mutationFn: async (loginData: {
      state: string;
      code: string;
      id_token: string;
      user: {
        email: string;
        firstName: string;
        lastName: string;
      };
    }) => {
      console.log('Apple 로그인 API 호출 결과', loginData);
      const res = await fetch('https://munchi.site/api/auth/apple/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        throw new Error('Apple 로그인 API 실패');
      }

      const data = await res.json();
      return data; // { accessToken, refreshToken }
    },
  });

export default useAppleLogin;
