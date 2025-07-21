import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import useTempLogin from '../hooks/useTempLogin';

interface Props {
  onLoginSuccess: (tokens: { accessToken: string; refreshToken: string }) => void;
}

const TempLoginButton: React.FC<Props> = ({ onLoginSuccess }) => {
  const [nickname, setNickname] = useState('');
  const mutation = useTempLogin();

  const handleTempLogin = async () => {
    // 닉네임 validation
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    if (nickname.trim().length < 2) {
      Alert.alert('알림', '닉네임은 2글자 이상 입력해주세요.');
      return;
    }

    try {
      const tokens = await mutation.mutateAsync({ nickname: nickname.trim() });
      console.log('임시 로그인 성공', tokens);
      onLoginSuccess(tokens);
    } catch (error) {
      console.error('임시 로그인 실패', error);
      Alert.alert('로그인 실패', '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <Text style={styles.label}>닉네임을 설정해주세요</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChangeText={setNickname}
          maxLength={10}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleTempLogin}
        />
      </View>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          (!nickname.trim() || mutation.isPending) && styles.buttonDisabled
        ]} 
        onPress={handleTempLogin} 
        activeOpacity={0.8}
        disabled={!nickname.trim() || mutation.isPending}
      >
        <Text style={styles.buttonText}>
          {mutation.isPending ? '로그인 중...' : '시작하기'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#F8EF89',
    borderRadius: 8,
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
 
    
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#f3f0c8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TempLoginButton;