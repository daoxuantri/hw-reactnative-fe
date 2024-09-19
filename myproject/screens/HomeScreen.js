import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation, route }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
  const fetchProducts = async (pageNumber) => {
    setLoadingMore(true);
    try {
      const response = await fetch(`http://192.168.2.183:4000/products/listallproduct?page=${pageNumber}`);
      const responseJson = await response.json();
      if (responseJson.success) {
        setProducts(prevProducts => [...prevProducts, ...responseJson.data]);
        setFilteredProducts(prevProducts => [...prevProducts, ...responseJson.data]);
        setHasMore(responseJson.data.length > 0); // Nếu không còn sản phẩm, setHasMore = false
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // Xử lý tìm kiếm
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = products.filter(product =>
      product.nameproduct.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Xử lý khi cuộn gần đến cuối danh sách
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  if (loading && page === 1) {
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
        keyExtractor={(item) => `${item._id}_${item.nameproduct}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productContainer}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
          >
            <Image source={{ uri: item.imgs }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.nameproduct}</Text>
              <Text style={styles.productPrice}>{item.price} VND</Text>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color="#0000ff" /> : null}
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
});