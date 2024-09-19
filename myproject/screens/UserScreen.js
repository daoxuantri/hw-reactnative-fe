// UserScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserScreen({ navigation }) {
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: '',
    contact: '',
    address: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserDetails(parsedData);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveUserDetails = async () => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userDetails));
      Alert.alert('Success', 'User details updated successfully');
      setIsEditingUser(false);
    } catch (error) {
      console.log('Error saving user data:', error);
      Alert.alert('Error', 'Failed to update user details');
    }
  };

  if (isEditingUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chỉnh Sửa Thông Tin Người Dùng</Text>

        <Text>Email (không thể chỉnh sửa):</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f0f0f0' }]}
          value={userDetails.email}
          editable={false}
        />

        <Text>Liên hệ:</Text>
        <TextInput
          style={styles.input}
          value={userDetails.contact}
          onChangeText={(text) => setUserDetails({ ...userDetails, contact: text })}
        />

        <Text>Địa chỉ:</Text>
        <TextInput
          style={styles.input}
          value={userDetails.address}
          onChangeText={(text) => setUserDetails({ ...userDetails, address: text })}
        />

        <Button title="Lưu Thay Đổi" onPress={handleSaveUserDetails} />
        <Button title="Quay lại" onPress={() => setIsEditingUser(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin người dùng</Text>
      <Text>Email: {userDetails.email}</Text>
      <Text>Liên hệ: {userDetails.contact}</Text>
      <Text>Địa chỉ: {userDetails.address}</Text>
      <Button title="Chỉnh sửa" onPress={() => setIsEditingUser(true)} />
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
});
