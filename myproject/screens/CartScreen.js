import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]); 

  useEffect(() => {
    fetchCartData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCartData();  
    }, [])
  );

  const fetchCartData = async () => {
    setLoading(true);
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData.id;
      const response = await fetch('http://192.168.2.183:4000/carts/getcartbyuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
        }),
      });
      const responseJson = await response.json();
      if (responseJson.success) {
        setCartData(responseJson.data);
      } else {
        console.log('Lỗi khi lấy dữ liệu giỏ hàng');
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chọn hoặc bỏ chọn sản phẩm
  const toggleSelectProduct = (product) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.find((p) => p._id === product._id)) {  // Thay đổi id thành _id
        return prevSelected.filter((p) => p._id !== product._id);
      } else {
        return [...prevSelected, product];
      }
    });
  };
  

  const proceedToCheckout = () => {
    console.log("Selected Products: ", selectedProducts); 
    navigation.navigate('Checkout', { selectedProducts }); // Chuyển sản phẩm đã chọn sang trang Checkout
  };

  const updateQuantity = async (productId, quantityChange) => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData.id;
  
      // Kiểm tra số lượng hiện tại của sản phẩm trước khi giảm
      const product = cartData.productItem.find(item => item.product === productId);
      if (product.quantity === 1 && quantityChange === -1) {
        // Nếu số lượng là 1 và yêu cầu giảm thì không cho phép giảm
        Toast.show({
          type: 'error',
          text1: 'Số lượng sản phẩm không thể nhỏ hơn 1',
          position: 'bottom',
          visibilityTime: 2000,
        });
        return; // Dừng lại nếu giảm số lượng về 0
      }
  
      const response = await fetch('http://192.168.2.183:4000/carts/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
          product: productId,
          quantity: quantityChange,  // +1 hoặc -1
        }),
      });
  
      const responseJson = await response.json();
      if (responseJson.success) {
        setCartData((prevCartData) => {
          const updatedItems = prevCartData.productItem.map((item) => {
            if (item.product === productId) {
              return { ...item, quantity: item.quantity + quantityChange };
            }
            return item;
          });
          const newTotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          return { ...prevCartData, productItem: updatedItems, total: newTotal };
        });
      } else {
        console.log('Lỗi khi thay đổi số lượng sản phẩm: ', responseJson.message);
      }
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
  };
  
  const removeProductFromCart = async (productId) => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData.id; 
      console.log(productId);
  
      const response = await fetch('http://192.168.2.183:4000/carts/removeproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,  
          product: productId,   
        }),
      });
  
      const responseJson = await response.json();
      if (responseJson.success) {
        setCartData((prevCartData) => {
          const updatedItems = prevCartData.productItem.filter((item) => item.product !== productId);  // Dùng _id
          return { ...prevCartData, productItem: updatedItems };
        });
        Toast.show({
          type: 'success', 
          text1: responseJson.message, 
          position: 'bottom',  
          visibilityTime: 2000, 
        });
      } else {
        console.log('Lỗi khi xóa sản phẩm: ', responseJson.message);
      }
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };
  

  const confirmDelete = (productId) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', onPress: () => removeProductFromCart(productId) }
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!cartData) {
    return (
      <View style={styles.container}>
        <Text>Không có sản phẩm trong giỏ hàng</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Cart</Text>
      <FlatList
  data={cartData.productItem}
  keyExtractor={(item) => item.product}   
  renderItem={({ item }) => (
    <TouchableOpacity
      onLongPress={() => confirmDelete(item.product)}   
      style={styles.productContainer}
    >
      {/* Ô tick ở bên trái */}
      <TouchableOpacity onPress={() => toggleSelectProduct(item)} style={styles.checkbox}>
        {selectedProducts.find((p) => p.product === item.product) ? (  
          <Text style={styles.checkboxText}>✓</Text> // Hiển thị dấu tick nếu được chọn
        ) : (
          <Text style={styles.checkboxText}></Text> // Hiển thị ô trống nếu chưa chọn
        )}
      </TouchableOpacity>
      
      <Image source={{ uri: item.images }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} VND</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => updateQuantity(item.product, -1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.productQuantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateQuantity(item.product, 1)} style={styles.quantityButton}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )}
/>


      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: {cartData.total} VND</Text>
        <TouchableOpacity 
          style={styles.checkoutButton} 
          onPress={proceedToCheckout} // Chuyển sản phẩm đã chọn sang trang Checkout
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productQuantity: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 50,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 18,
    color: '#333',
  },
});
