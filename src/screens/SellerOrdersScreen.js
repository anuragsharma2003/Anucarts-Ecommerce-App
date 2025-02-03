import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { DEV_API_URL, PROD_API_URL } from '@env';

const SellerOrdersScreen = ({ route }) => {
  const { token } = route.params;
  const [orders, setOrders] = useState([]);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/orders/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders.');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${BASE_URL}/orders/${orderId}/status`,
        { orderStatus: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTotal}>₹{item.orderTotalPrice}</Text>

      {item.items.map((product, index) => (
        <View key={index} style={styles.productContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.productMeta}>
              <Text style={styles.productPrice}>₹{product.itemTotalPrice}</Text>
              <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.statusContainer}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => updateOrderStatus(item._id, value)}
            placeholder={{}} // no placeholder to start with the selected value
            value={item.status}
            items={[
              { label: 'Paid', value: 'Paid' },
              { label: 'Delivered', value: 'Delivered' },
              { label: 'Undelivered', value: 'Undelivered' },
              { label: 'Shipped', value: 'Shipped' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
            useNativeAndroidPickerStyle={false} // allows custom styling on Android
            style={pickerSelectStyles}
            Icon={() => (
              <View style={pickerSelectStyles.iconContainer}>
                <View style={pickerSelectStyles.icon} />
              </View>
            )}
          />
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Order Management</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found</Text>
        }
      />
    </View>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 48,
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 8,
    color: '#2196F3',
    backgroundColor: 'white',
    paddingRight: 30, // to ensure text is not overlapped by the icon
  },
  inputAndroid: {
    height: 48,
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 8,
    color: '#2196F3',
    backgroundColor: 'white',
    paddingRight: 30, // to ensure text is not overlapped by the icon
  },
  iconContainer: {
    top: 15,
    right: 10,
  },
  icon: {
    borderTopWidth: 10,
    borderTopColor: '#2196F3',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    width: 0,
    height: 0,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  appBar: {
    backgroundColor: '#2196F3',
    paddingVertical: 24,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  appBarTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 12,
  },
  productContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
  },
  productQuantity: {
    fontSize: 12,
    color: '#757575',
  },
  statusContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '65%',
  },
  orderDate: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginTop: 32,
  },
});

export default SellerOrdersScreen;