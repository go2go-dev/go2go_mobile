import React from 'react';
import {Button, NativeModules, SafeAreaView, StyleSheet} from 'react-native';
const {LiveActivity} = NativeModules;

function App(): React.JSX.Element {
  const onStartActivity = () => {
    if (LiveActivity && typeof LiveActivity.startActivity === 'function') {
      LiveActivity.startActivity();
      console.log('Activity started');
    } else {
      console.log('LiveActivity not found');
    }
  };

  const onEndActivity = () => {
    if (LiveActivity && typeof LiveActivity.endActivity === 'function') {
      LiveActivity.endActivity();
    } else {
      console.log('LiveActivity not found');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Start Activity" onPress={onStartActivity} />
      <Button title="Stop Activity" onPress={onEndActivity} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
