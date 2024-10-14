import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, Alert, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PurchaseSummaryScreen = () => {
  const [deliveredData, setDeliveredData] = useState({
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [{ data: Array(12).fill(0) }],
  });

  const [pendingData, setPendingData] = useState({
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [{ data: Array(12).fill(0) }],
  });

  const fetchOrderHistory = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData?.id;

      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      const response = await fetch('http://192.168.2.183:4000/orders/getorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userId }),
      });

      const result = await response.json();
      if (result.success) {
        const orders = Array.isArray(result.data) ? result.data : [result.data];

        const deliveredSpending = Array(12).fill(0);
        const pendingSpending = Array(12).fill(0);

        orders.forEach((order) => {
          const orderDate = new Date(order.createdAt);
          const month = orderDate.getMonth();
          if (order.delivery) {
            deliveredSpending[month] += order.total;
          } else {
            pendingSpending[month] += order.total;
          }
        });

        setDeliveredData({
          labels: deliveredData.labels,
          datasets: [{ data: deliveredSpending }],
        });

        setPendingData({
          labels: pendingData.labels,
          datasets: [{ data: pendingSpending }],
        });
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      Alert.alert('Error', 'Cannot fetch order history');
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const chartConfig = {
    backgroundColor: '#1cc910',
    backgroundGradientFrom: '#eff3ff',
    backgroundGradientTo: '#efefef',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    paddingRight: 30,
    barPercentage: 0.8,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivered Orders (By Month)</Text>
      <ScrollView horizontal>
        <BarChart
          data={deliveredData}
          width={Dimensions.get('window').width * 1.5}
          height={250}
          chartConfig={chartConfig}
          verticalLabelRotation={15}
          fromZero={true}
          showBarTops={true}
          xLabelsOffset={15}
          horizontalLabelRotation={-30}
        />
      </ScrollView>
      <Text style={styles.title}>Pending Orders (By Month)</Text>
      <ScrollView horizontal>
        <BarChart
          data={pendingData}
          width={Dimensions.get('window').width * 1.5}
          height={250}
          chartConfig={chartConfig}
          verticalLabelRotation={15}
          fromZero={true}
          showBarTops={true}
          xLabelsOffset={15}
          horizontalLabelRotation={-30}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default PurchaseSummaryScreen;