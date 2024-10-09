import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserScreen({ navigation }) {
  const [userDetails, setUserDetails] = useState({ email: '', contact: '', address: '' });
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    // Lấy thông tin người dùng từ AsyncStorage và gọi API để lấy lịch sử đơn hàng
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserDetails(parsedData);
          fetchOrderHistory(parsedData.id); // Gọi API lấy lịch sử đơn hàng bằng ID người dùng
          console.log('Id nguoi dung', parsedData.id);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    // Hàm gọi API để lấy lịch sử đơn hàng từ server
    const fetchOrderHistory = async (userId) => {
      try {
        const response = await fetch('http://192.168.2.183:4000/orders/getorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: userId }), // Truyền ID người dùng vào body của request
        });

        const result = await response.json();
        if (result.success) {
          const orders = Array.isArray(result.data) ? result.data : [result.data];
          setOrderHistory(orders); // Lưu dữ liệu lịch sử đơn hàng vào state
          console.log(orders);
        } else {
          Alert.alert('Error', result.message); // Thông báo lỗi nếu API trả về lỗi
        }
      } catch (error) {
        console.log('Error fetching order history:', error);
        Alert.alert('Error', 'Không thể lấy lịch sử đơn hàng');
      }
    };

    fetchUserData();
  }, []);

  // Hàm render một mục đơn hàng trong danh sách lịch sử đơn hàng
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.productItem[0].images }} style={styles.productImage} />
      <View style={styles.orderDetails}>
        <Text style={styles.productName}>{item.productItem[0].name}</Text>
        <Text>Số lượng: {item.productItem[0].quantity}</Text>
        <Text>Giá: {item.productItem[0].price} VND</Text>
        <Text>Địa chỉ giao hàng: {item.address}</Text>
        <Text>Số điện thoại: {item.phone}</Text>
        <Text>Tình trạng giao hàng: {item.delivery ? 'Đã giao' : 'Đang trong quá trình vận chuyển'}</Text>
        <Text>Tổng tiền: {item.total} VND</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hiển thị thông tin người dùng */}
      <View style={styles.userInfo}>
        <Text>Email: {userDetails.email}</Text>
        <Text>Liên hệ: {userDetails.contact}</Text>
        <Text>Địa chỉ: {userDetails.address}</Text>
      </View>

      {/* Phần Lịch sử đơn hàng */}
      <View style={styles.orderHistorySection}>
        <Text style={styles.sectionTitle}>Lịch sử đơn hàng</Text>
        {/* Sử dụng FlatList để hiển thị danh sách lịch sử đơn hàng */}
        <FlatList
          data={orderHistory}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          ListEmptyComponent={<Text>Không có đơn hàng nào</Text>} // Hiển thị khi không có lịch sử đơn hàng
        />
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
  userInfo: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  orderHistorySection: {
    marginTop: 20,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
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
});
