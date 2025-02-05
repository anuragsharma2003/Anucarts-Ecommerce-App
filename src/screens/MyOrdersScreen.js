import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { DEV_API_URL, PROD_API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'react-native-linear-gradient';

const MyOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const response = await axios.get(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setOrders(response.data.length > 0 ? response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
      } else {
        console.warn('Unexpected response:', response.data);
        setOrders([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Backend returns 404 when no orders exist, so treat it normally
        console.warn('No orders found:', error.response.data);
        setOrders([]); // No error alert, just set empty orders
      } else {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'An error occurred while fetching orders');
      }
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.statusContainer}>
          <Icon
            name={getStatusIcon(item.status)}
            size={20}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <View style={styles.orderMeta}>
          <Text style={styles.orderDate}>
            <Icon name="calendar" size={12} color="#666" />{' '}
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
        </View>
      </View>

      {/* Order Items */}
      <FlatList
        data={item.items}
        keyExtractor={(subItem) => subItem._id.toString()}
        renderItem={({ item: subItem }) => (
          <View style={styles.productCard}>
            <Image
              source={{ uri: subItem.image }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{subItem.name}</Text>
              <View style={styles.productDetails}>
                <Text style={styles.productPrice}>₹{subItem.itemTotalPrice}</Text>
                <Text style={styles.productQuantity}>Qty: {subItem.quantity}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Order Footer */}
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: ₹{item.orderTotalPrice}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return '#4CAF50';
      case 'shipped': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'check-circle';
      case 'shipped': return 'truck-delivery';
      case 'processing': return 'progress-clock';
      case 'cancelled': return 'close-circle';
      default: return 'information';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6C63FF', '#8B82FF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="package-variant-closed" size={60} color="#6C63FF" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  productDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '700',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 12,
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default MyOrdersScreen;