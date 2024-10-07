import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

export default function CartScreen() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const updateQuantity = async (productId, quantityChange) => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData.id;

      const response = await fetch('http://192.168.2.183:4000/carts/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,
          _id: productId,
          quantity: quantityChange,
        }),
      });

      const responseJson = await response.json();
      if (responseJson.success) {
        setCartData((prevCartData) => {
          const updatedItems = prevCartData.productItem.map((item) => {
            if (item.id === productId) {
              return { ...item, quantity: item.quantity + quantityChange };
            }
            return item;
          });
          // Tính toán lại tổng giá trị
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

      const response = await fetch('http://192.168.2.183:4000/carts/removeproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userId,  
          _id: productId, 
        }),
      });

      const responseJson = await response.json();
      if (responseJson.success) {
        setCartData((prevCartData) => {
          const updatedItems = prevCartData.productItem.filter((item) => item.id !== productId);
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
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => confirmDelete(item._id)}
            style={styles.productContainer}
          >
            <Image source={{ uri: item.images }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price} VND</Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.productQuantity}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: {cartData.total} VND</Text>
        <TouchableOpacity style={styles.checkoutButton}>
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
});