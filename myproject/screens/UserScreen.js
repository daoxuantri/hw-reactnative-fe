import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
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
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}></View>
          <Text style={styles.username}>min261102</Text>
        </View>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Text>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text>Email: {userDetails.email}</Text>
        <Text>Liên hệ: {userDetails.contact}</Text>
        <Text>Địa chỉ: {userDetails.address}</Text>
        <Button title="Chỉnh sửa" onPress={() => setIsEditingUser(true)} />
      </View>

      {/* Phần Đơn mua */}
      <View style={styles.orderSection}>
        <Text style={styles.orderTitle}>Đơn mua</Text>
        <View style={styles.orderStatusContainer}>
          <TouchableOpacity style={styles.orderStatusButton}>
            <Text>Chờ xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderStatusButton}>
            <Text>Chờ lấy hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderStatusButton}>
            <Text>Chờ giao hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderStatusButton}>
            <Text>Đánh giá</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
    padding: 5,
  },
  userInfo: {
    marginTop: 20,
  },
  orderSection: {
    marginTop: 30,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  orderStatusButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});
