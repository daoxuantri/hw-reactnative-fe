import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isForgetPassword, setIsForgetPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) Alert.alert('Login Success');
      else Alert.alert('Login Failed', data.message);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) Alert.alert('Registration Success');
      else Alert.alert('Registration Failed', data.message);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  const handleForgetPassword = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) Alert.alert('Password Updated');
      else Alert.alert('Failed', data.message);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegister ? 'Register' : isForgetPassword ? 'Forget Password' : 'Login'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={isRegister ? 'Register' : isForgetPassword ? 'Submit' : 'Login'}
        onPress={isRegister ? handleRegister : isForgetPassword ? handleForgetPassword : handleLogin}
      />
      <View style={styles.buttonSpacing}>
        <Button
          title={isRegister ? 'Switch to Login' : isForgetPassword ? 'Switch to Login' : 'Switch to Register'}
          onPress={() => {
            setIsRegister(!isRegister);
            setIsForgetPassword(false);
          }}
        />
      </View>
      {!isRegister && (
        <View style={styles.buttonSpacing}>
          <Button
            title="Forgot Password?"
            onPress={() => {
              setIsForgetPassword(true);
              setIsRegister(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  buttonSpacing: {
    marginTop: 10,  // Add spacing between buttons
  },
});
