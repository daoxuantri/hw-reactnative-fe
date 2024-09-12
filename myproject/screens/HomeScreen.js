import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Image, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ route, navigation }) {
  const { userData } = route.params;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: userData.email,
    contact: userData.contact,
    address: userData.address,
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
        }
      } catch (error) {
        console.error('Lỗi khi lấy ID người dùng:', error);
      }
    };

    getUserId();

    fetch('http://192.168.2.183:4000/products/listallproduct')
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success) {
          setProducts(responseJson.data);
          setFilteredProducts(responseJson.data);
        }
      })
      .catch((error) => console.error('Lỗi khi lấy sản phẩm:', error));
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const storedUserData = await AsyncStorage.getItem('userData');
          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            setUserDetails({
              email: parsedUserData.email,
              contact: parsedUserData.contact,
              address: parsedUserData.address,
            });
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng từ AsyncStorage:', error);
        }
      };

      fetchUserData();
    }, [])
  );

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = products.filter((product) =>
      product.nameproduct.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userId');
      navigation.navigate('Login');
      Alert.alert('Logout Successful', 'You have been logged out.');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Something went wrong during logout!');
    }
  };

  const handleSaveUserDetails = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        Alert.alert('Lỗi', 'Không tìm thấy dữ liệu người dùng.');
        return;
      }

      const storedUserData = JSON.parse(userDataString);
      const userId = storedUserData._id;

      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy ID người dùng.');
        return;
      }

      const updatedUserDetails = { ...userDetails, _id: userId };

      console.log('Sending updated user details:', updatedUserDetails);
      const response = await fetch('http://192.168.2.183:4000/users/update-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserDetails),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserDetails));
        Alert.alert('Cập nhật thành công', 'Thông tin người dùng đã được cập nhật.');
        setIsEditingUser(false);
        navigation.navigate('Home', { userData: updatedUserDetails }); // Cập nhật userData trong navigation
      } else {
        Alert.alert('Lỗi', result.message || 'Cập nhật thất bại.');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin người dùng.');
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
      <Text style={styles.title}>Thông Tin Người Dùng</Text>
      <Text>Email: {userDetails.email}</Text>
      <Text>Liên hệ: {userDetails.contact}</Text>
      <Text>Địa chỉ: {userDetails.address}</Text>

      <Button title="Chi tiết người dùng" onPress={() => setIsEditingUser(true)} />

      <TextInput
        style={styles.searchBar}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Image source={{ uri: item.imgs }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.nameproduct}</Text>
              <Text style={styles.productPrice}>{item.price} VND</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#ff0000" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  productDetails: {
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
  },
  logoutButton: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
});
