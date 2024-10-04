import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function TopSellingProductsScreen() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const response = await fetch('http://192.168.2.183:4000/products/getselling');
        const result = await response.json();
        if (result.success) {
          setTopSellingProducts(result.data);
        }
      } catch (error) {
        console.error('Error fetching top selling products:', error);
      }
    };

    fetchTopSellingProducts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Selling Products</Text>
      <FlatList
        data={topSellingProducts}
        horizontal
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Image source={{ uri: item.images }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productContainer: {
    marginRight: 15,
    width: width / 2, // Adjust the width of each product item
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  productName: {
    fontSize: 18,
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    color: 'green',
  },
});
