import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  // Lấy userData từ route.params nếu có, hoặc từ AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const dataFromRoute = route.params?.userData;
        if (dataFromRoute) {
          setUserData(dataFromRoute);
        } else {
          const storedUserData = await AsyncStorage.getItem('userData');
          // console.log('storedUserData:', storedUserData); 
          if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
          } else {
            navigation.navigate('Login'); // Quay lại màn hình login nếu không có userData
          }
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
        navigation.navigate('Login');
      }
    };

    fetchUserData();
  }, [route.params]);

  // Fetch danh sách sản phẩm từ API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.2.183:4000/products/listallproduct'); // URL không phân trang
      const responseJson = await response.json();
      if (responseJson.success) {
        setProducts(responseJson.data);
        setFilteredProducts(responseJson.data);  // Cập nhật danh sách sản phẩm đầy đủ
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
        // console.log('Top Selling Products:', responseJson.data); // Kiểm tra dữ liệu trả về từ API
      } else {
        console.log('API returned an error:', responseJson);  // Kiểm tra lỗi từ API
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error);  // In lỗi nếu có
    }
  };

  useEffect(() => {
    fetchProducts();  // Gọi một lần khi component mount
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {userData.email}!</Text>
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
                <Text style={styles.topSellingProductPrice}>{item.price}</Text>
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
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price} VND</Text>
            </View>
          </TouchableOpacity>
        )}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  productDetails: {
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
});