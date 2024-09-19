import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TopSellingProductsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Selling Products</Text>
      <Text>Danh sách sản phẩm bán chạy sẽ hiển thị tại đây.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
});
