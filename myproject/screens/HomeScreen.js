import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import messaging from '@react-native-firebase/messaging';

export default function HomeScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Lấy userData từ route.params nếu có, hoặc từ AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const dataFromRoute = route.params?.userData;
        if (dataFromRoute) {
          setUserData(dataFromRoute);
        } else {
          const storedUserData = await AsyncStorage.getItem('userData');
          if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
          } else {
            navigation.navigate('Login');
          }
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
        navigation.navigate('Login');
      }
    };

    fetchUserData();
  }, [route.params]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    navigation.replace('Login');
  };

  // const requestUserPermission = async () =>{
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  // if (enabled) {
  //   console.log('Authorization status:', authStatus);
  //   getFcmToken();
  // }
  // };

  // const getFcmToken = async () =>{
  //   const token = await messaging().getToken();
  //   console.log('Fcm Token:', token);
  // }
  // useEffect(() =>{
  //   requestUserPermission();
  //   const unsubscribe = messaging().onMessage(async remoteMessage =>{
  //     console.log('Notification received in foreground:', remoteMessage);
  //   });

  //   return unsubscribe;
  // }, [])


  useEffect(() => {
    fetchProducts();  
  }, []);

  // Fetch danh sách sản phẩm từ API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.2.183:4000/products/listallproduct');
      const responseJson = await response.json();
      if (responseJson.success) {
        setProducts(responseJson.data);
        setFilteredProducts(responseJson.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTopSellingProducts();
  }, []);
  const fetchTopSellingProducts = async () => {
    try {
      const response = await fetch('http://192.168.2.183:4000/products/getselling');
      const responseJson = await response.json();
      if (responseJson.success) {
        setTopSellingProducts(responseJson.data);
      } else {
        console.log('API returned an error:', responseJson); 
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error); 
    }
  };
  useEffect(() => {
    fetchProducts();  
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };
 
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (product) => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData.id;
      console.log('thongtin', userId);
        console.log('thongtinproduct', product._id);
      const response = await fetch('http://192.168.2.183:4000/carts/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        

        body: JSON.stringify({
          user: userId,
          product: product._id,
          quantity: 1,
        }),
      });
      const responseJson = await response.json();
      if (responseJson.success) {
        Toast.show({
          type: 'success',
          text1: responseJson.message,
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: responseJson.message,
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };
  

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {userData?.email}!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={30} color="#000" /> 
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChangeText={handleSearch}
      />

        <View style={styles.topSellingContainer}>
        <Text style={styles.topSellingTitle}>Top Selling Products</Text>
        <FlatList
          data={topSellingProducts}
          keyExtractor={(item) => `${item._id}_${item.name}`}
          renderItem={({ item }) => (
            
            <TouchableOpacity
              style={styles.topSellingProductContainer}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <Image source={{ uri: item.images }} style={styles.topSellingProductImage} />
              <View style={styles.topSellingProductDetails}>
                <Text style={styles.topSellingProductName}>{item.name}</Text>
                <Text style={styles.topSellingProductPrice}>{item.price} VND</Text>
                <Text style={styles.topSellingProductSold}>Sold: {item.sold}</Text>
                </View>
            </TouchableOpacity>
          )}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => `${item._id}_${item.name}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productContainer}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={{ uri: item.images }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={[styles.productName, styles.centerText]}>{item.name}</Text>
              <Text style={[styles.productPrice, styles.centerText]}>{item.price} VND</Text>
              <Text style={styles.topSellingProductSold}>Sold: {item.sold}</Text>
              <TouchableOpacity 
                style={styles.addToCartButton} 
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        numColumns={2}
      />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
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
    width: '45%',
    margin: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 10,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  productDetails: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#888',
  },
  topSellingContainer: {
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  topSellingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  topSellingProductContainer: {
    marginRight: 10,
    marginBottom: 20,
  },
  topSellingProductImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  topSellingProductDetails: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSellingProductName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topSellingProductPrice: {
    fontSize: 14,
    color: '#888',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
  },

  centerText: {
    textAlign: 'center',
  },
});
