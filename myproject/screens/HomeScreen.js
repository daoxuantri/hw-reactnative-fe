import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Sử dụng hook để điều hướng

export default function HomeScreen({ route }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation(); // Sử dụng hook useNavigation để điều hướng

  // Lấy userData từ route.params nếu có, hoặc từ AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        } else {
          navigation.navigate('Login'); // Quay lại màn hình login nếu không có userData
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
        navigation.navigate('Login');
      }
    };

    fetchUserData();
  }, []);

  // Thêm nút logout vào góc phải của header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleLogout} // Gọi hàm logout khi người dùng bấm
          title="Logout"
          color="tomato"
        />
      ),
    });
  }, [navigation]);

  // Hàm xử lý logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData'); // Xóa dữ liệu user khỏi AsyncStorage
      navigation.navigate('Login'); // Chuyển về màn hình Login
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
});
