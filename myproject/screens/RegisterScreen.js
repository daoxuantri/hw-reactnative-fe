import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [contactError, setContactError] = useState('');

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  };

  const validateContact = (contact) => {
    const regex = /^[0-9]+$/;
    return regex.test(contact);
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      setEmailError('Email phải có đuôi là @gmail.com');
      return;
    }

    if (!validateContact(contact)) {
      setContactError('Số điện thoại phải là số');
      return;
    }

    try {
      const response = await fetch(`http://192.168.2.183:4000/users/email_verification/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOtpSent(true);
        Alert.alert('OTP Sent', 'Please check your email for the OTP.');
      } else {
        Alert.alert('OTP Failed', data.message);
      }
    } catch (error) {
      console.log("Error:", error);
      Alert.alert('Error', 'Something went wrong while sending OTP!');
    }
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      setEmailError('Email phải có đuôi là @gmail.com');
      return;
    }

    if (!validateContact(contact)) {
      setContactError('Số điện thoại phải là số');
      return;
    }

    if (!isOtpSent) {
      Alert.alert('Error', 'Please send OTP first.');
      return;
    }

    try {
      const response = await fetch('http://192.168.2.183:4000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, contact, address, otp }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Registration Success', 'Your account has been created.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration Failed', data.message);
      }
    } catch (error) {
      console.log("Error:", error);
      Alert.alert('Error', 'Something went wrong while registering!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={{ color: 'red' }}>{emailError}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (!validateEmail(text)) {
            setEmailError('Email phải có đuôi là @gmail.com');
          } else {
            setEmailError('');
          }
        }}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={{ color: 'red' }}>{contactError}</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact"
        value={contact}
        onChangeText={(text) => {
          setContact(text);
          if (!validateContact(text)) {
            setContactError('Số điện thoại phải là số');
          } else {
            setContactError('');
          }
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      {isOtpSent && (
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
        />
      )}
      {!isOtpSent ? (
        <Button title="Send OTP" onPress={handleSendOtp} />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
      <View style={styles.buttonSpacing}>
        <Button title="Switch to Login" onPress={() => navigation.navigate('Login')} />
      </View>
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
    marginTop: 10,
  },
});