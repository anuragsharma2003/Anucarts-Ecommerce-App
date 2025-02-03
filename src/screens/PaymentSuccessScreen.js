import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { DEV_API_URL, PROD_API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentSuccessScreen = ({ route }) => {
  const { paymentId, orderData } = route.params;
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
  const navigation = useNavigation();

  useEffect(() => {
    const orderTotalPrice = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    saveOrder(paymentId, 'Paid', orderData, orderTotalPrice);
  }, [paymentId, orderData]);

  const saveOrder = async (paymentId, status, orderData, orderTotalPrice) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const order = {
        userId: orderData.userId,
        items: orderData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          itemTotalPrice: item.price * item.quantity,
          name: item.productName,
          image: item.productImage,
          sellerId: item.sellerId,
        })),
        orderTotalPrice,
        paymentId,
        status,
      };

      const response = await axios.post(`${BASE_URL}/orders`, order, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        console.log('Order saved successfully:', response.data);
      } else {
        console.error('Failed to save order:', response.data.message);
      }
    } catch (error) {
      console.error('Error saving order:', error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
          <View style={styles.iconBackground} />
        </View>

        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>Your order has been confirmed</Text>

        <View style={styles.orderSummary}>
          <Text style={styles.summaryText}>
            Total Paid: ₹{orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
          </Text>
          <Text style={styles.summaryText}>Payment ID: {paymentId}</Text>
        </View>

        <TouchableOpacity
          style={styles.ordersButton}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Icon name="text-box-check" size={24} color="white" />
          <Text style={styles.buttonText}>View My Orders</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Thank you for your purchase!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  iconBackground: {
    position: 'absolute',
    backgroundColor: '#E8F5E9',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -20,
    left: -20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 32,
  },
  orderSummary: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  summaryText: {
    fontSize: 16,
    color: '#424242',
    marginVertical: 4,
    textAlign: 'center',
  },
  ordersButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerText: {
    color: '#81C784',
    fontSize: 14,
    marginTop: 16,
  },
});

export default PaymentSuccessScreen;