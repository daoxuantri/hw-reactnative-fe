import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function CheckoutScreen({ route }) {
  const { selectedProducts: initialProducts } = route.params; // Sản phẩm truyền từ CartScreen
  const [selectedProducts, setSelectedProducts] = useState(initialProducts); // Lưu trữ sản phẩm được chọn
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isExpressShipping, setIsExpressShipping] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0); // Tổng tiền
  const navigation = useNavigation();

  // Cập nhật lại tổng tiền khi danh sách sản phẩm hoặc trạng thái vận chuyển nhanh thay đổi
  useEffect(() => {
    const totalProductAmount = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(totalProductAmount + (isExpressShipping ? 25000 : 0)); // Thêm phí vận chuyển nếu có
  }, [selectedProducts, isExpressShipping]);

  // Hàm để bỏ chọn sản phẩm khỏi danh sách sản phẩm đã chọn
  const handleProductSelection = (product) => {
    const updatedProducts = selectedProducts.filter(item => item.product !== product.product); // Loại bỏ sản phẩm đã chọn
    setSelectedProducts(updatedProducts); // Cập nhật lại danh sách sản phẩm
  };

  // Xử lý đặt hàng
  const handleCheckout = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData'); // Lấy thông tin người dùng từ AsyncStorage
      const userData = JSON.parse(storedUserData);
      const userId = userData.id;

      const productItem = selectedProducts.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        images: item.images,
        price: item.price,
      }));

      const response = await fetch('http://192.168.2.183:4000/orders/createorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
          productItem,
          total: totalAmount,
          address,
          phone,
          delivery: isExpressShipping,
        }),
      });

      const responseJson = await response.json();

      if (responseJson.success) {
        Alert.alert('Đặt hàng thành công!');
        navigation.navigate('Home');
      } else {
        console.log('Lỗi khi đặt hàng:', responseJson);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      {/* Hiển thị danh sách sản phẩm đã chọn */}
      <FlatList
        data={selectedProducts}
        keyExtractor={(item) => item.product}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Image source={{ uri: item.images }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price} VND x {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => handleProductSelection(item)}>
              <Text>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Tùy chọn vận chuyển nhanh */}
      <View style={styles.shippingOption}>
        <TouchableOpacity onPress={() => setIsExpressShipping(!isExpressShipping)} style={styles.checkbox}>
          {isExpressShipping ? <Text style={styles.checkboxText}>✓</Text> : <Text style={styles.checkboxText}></Text>}
        </TouchableOpacity>
        <Text style={styles.shippingText}>Vận chuyển nhanh (+ 25,000 VND)</Text>
      </View>

      {/* Hiển thị phí vận chuyển nếu chọn */}
      {isExpressShipping && (
        <View style={styles.feeContainer}>
          <Text style={styles.feeText}>Phí vận chuyển: 25,000 VND</Text>
        </View>
      )}

      {/* Hiển thị tổng cộng */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Tổng cộng: {totalAmount} VND</Text>
      </View>

      {/* Nhập địa chỉ và số điện thoại */}
      <TextInput
        placeholder="Nhập địa chỉ"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <TextInput
        placeholder="Nhập số điện thoại"
        value={phone}
        onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}
      />

      {/* Nút đặt hàng */}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#888',
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 18,
    color: '#333',
  },
  shippingText: {
    fontSize: 16,
  },
  feeContainer: {
    marginBottom: 15,
  },
  feeText: {
    fontSize: 16,
    color: '#333',
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    marginVertical: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
