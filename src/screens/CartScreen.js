import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { DEV_API_URL, PROD_API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '@env';
import { LinearGradient } from 'react-native-linear-gradient';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const response = await axios.get(`${BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.items) {
        setCartItems(response.data.items);
        calculateTotal(response.data.items);
      } else {
        Alert.alert('Error', 'Failed to fetch cart items');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'An error occurred while fetching the cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      await axios.delete(`${BASE_URL}/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Error', 'Failed to remove the item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.put(
        `${BASE_URL}/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update the quantity');
    }
  };

  const calculateTotal = (items) => {
    let total = 0;
    items.forEach((item) => {
      total += item.price * item.quantity;
    });
    setTotalPrice(total);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleBuyNow = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const orderTotalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      userId: token,
      items: cartItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        productName: item.productId.name,
        productImage: item.productId.image,
        sellerId: item.sellerId,
      })),
    };

    const options = {
      description: 'Cart Purchase',
      image: cartItems[0]?.productId.image || '',
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: orderTotalPrice * 100,
      name: 'Anucarts',
      prefill: {
        email: 'user@example.com',
        contact: '9876543210',
        name: 'User Name',
      },
      theme: { color: '#528FF0' },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        navigation.navigate('PaymentSuccess', {
          paymentId: data.razorpay_payment_id,
          orderData,
        });
      })
      .catch((error) => {
        Alert.alert('Payment Failed!', error.description);
      });
  };

  const renderCartItem = ({ item }) => {
    const imageUrl = item.productId.image.includes('cloudinary')
      ? item.productId.image
      : `${BASE_URL}/uploads/${item.productId.image}`;

    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productId.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.productId._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Icon name="minus" size={20} color="#6C63FF" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.productId._id, item.quantity + 1)}
            >
              <Icon name="plus" size={20} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemTotal}>
            ₹{(item.price * item.quantity).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeFromCart(item.productId._id)}
        >
          <Icon name="trash-can-outline" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with proper text handling */}
      <LinearGradient colors={['#6C63FF', '#8B82FF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productId._id.toString()}
        contentContainerStyle={[styles.listContent, cartItems.length === 0 && styles.emptyList]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cart-remove" size={60} color="#6C63FF" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        }
      />

      {/* Checkout Section */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>₹{totalPrice.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleBuyNow}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Icon name="arrow-right" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}
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
  emptyList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  productPrice: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    color: '#2D2D2D',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C63FF',
  },
  checkoutButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
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

export default CartScreen;