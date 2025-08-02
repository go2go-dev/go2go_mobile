import {NativeModules, Platform} from 'react-native';

const {SharedDefaults} = NativeModules;

export const updateWidgetTodos = async (todos: string[]) => {
  if (Platform.OS !== 'ios') return;

  try {
    await SharedDefaults.saveTodos(todos);
    console.log('✅ 위젯에 할 일 저장 완료:', todos);
  } catch (e) {
    console.error('❌ 위젯 저장 실패:', e);
  }
};
