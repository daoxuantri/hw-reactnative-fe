import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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

  // Xử lý tìm kiếm
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    // Logic thêm vào giỏ hàng tại đây, ví dụ:
    // dispatch(addToCart(product));
    Toast.show({
      type: 'success',
      text1: 'Sản phẩm đã được thêm vào giỏ hàng',
      position: 'bottom',
    });
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
              <TouchableOpacity 
                style={styles.addToCartButton} 
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
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
});
