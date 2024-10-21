import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserScreen({ navigation }) {
  const [userDetails, setUserDetails] = useState({ email: '', contact: '', address: '' });
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserDetails(parsedData);
          fetchOrderHistory(parsedData.id);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    const fetchOrderHistory = async (userId) => {
      try {
        const response = await fetch('http://192.168.2.183:4000/orders/getorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: userId }),
        });

        const result = await response.json();
        if (result.success) {
          const orders = Array.isArray(result.data) ? result.data : [result.data];
          setOrderHistory(orders);
        } else {
          Alert.alert('Error', result.message);
        }
      } catch (error) {
        console.log('Error fetching order history:', error);
        Alert.alert('Error', 'Không thể lấy lịch sử đơn hàng');
      }
    };

    fetchUserData();
  }, []);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      {item.productItem.map((product, index) => (
        <TouchableOpacity
          key={product._id}
          onPress={() => navigation.navigate('ProductDetailer', { product })}
        >
          <View style={styles.productContainer}>
            <Image source={{ uri: product.images }} style={styles.productImage} />
            <View style={styles.orderDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text>Số lượng: {product.quantity}</Text>
              <Text>Giá: {product.price} VND</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      <View style={styles.orderSummary}>
        <Text>Địa chỉ giao hàng: {item.address}</Text>
        <Text>Số điện thoại: {item.phone}</Text>
        <Text>Tình trạng giao hàng: {item.delivery ? 'Đã giao' : 'Đang trong quá trình vận chuyển'}</Text>
        <Text>Tổng tiền: {item.total} VND</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.userInfo}>
      <Text>Email: {userDetails.email}</Text>
      <Text>Liên hệ: {userDetails.contact}</Text>
      <Text>Địa chỉ: {userDetails.address}</Text>
    </View>
  );

  return (
    <FlatList
      data={orderHistory}
      keyExtractor={(item) => item._id}
      renderItem={renderOrderItem}
      ListEmptyComponent={<Text>Không có đơn hàng nào</Text>}
      ListHeaderComponent={renderHeader} // User info as the header of the FlatList
      contentContainerStyle={styles.flatListContainer}
    />
  );
}

const styles = StyleSheet.create({
  flatListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
    marginTop: 20,
  },
  orderItem: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  orderDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderSummary: {
    marginTop: 10,
  },
});
