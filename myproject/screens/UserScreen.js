import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserScreen({ route }) {
  const { userData } = route.params; // Get user data from route parameters

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Information</Text>
      <Text>Email: {userData.email}</Text>
      <Text>Contact: {userData.contact}</Text>
      <Text>Address: {userData.address}</Text>
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
