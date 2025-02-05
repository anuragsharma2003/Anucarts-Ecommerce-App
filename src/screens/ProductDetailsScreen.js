import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { DEV_API_URL, PROD_API_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '@env';
import { LinearGradient } from 'react-native-linear-gradient';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product, seller } = route.params;
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
  const [cartQuantity, setCartQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const cartItems = response.data.items;
        const existingItem = cartItems.find(item => item.productId._id === product._id);
        setCartQuantity(existingItem ? existingItem.quantity : 0);  // Ensures default state
      } else {
        setCartQuantity(0);  // Ensures "Add to Cart" button is shown instead of error
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartQuantity(0);  // Set default state to avoid displaying an error
    }
  };

  const handleAddToCart = async () => {
    if (cartQuantity > 0) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/cart`,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          sellerId: seller._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setCartQuantity(1);
      } else {
        Alert.alert('Error', response.data.message || 'Could not add item to cart.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding the item to the cart.');
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = async (newQuantity) => {
    if (newQuantity === 0) {
      handleRemoveFromCart();
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.put(
        `${BASE_URL}/cart/${product._id}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCartQuantity(newQuantity);
      } else {
        Alert.alert('Error', response.data.message || 'Could not update cart.');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.delete(`${BASE_URL}/cart/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setCartQuantity(0);
      } else {
        Alert.alert('Error', response.data.message || 'Could not remove item.');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const orderTotalPrice = product.price * 1;
      const orderData = {
        userId: token,
        items: [{
          productId: product._id,
          quantity: 1,
          price: product.price,
          totalPrice: orderTotalPrice,
          productName: product.name,
          productImage: product.image,
          sellerId: seller._id,
        }]
      };

      const options = {
        description: 'Instant Purchase',
        image: product.image || '',
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
    } catch (error) {
      console.error('Error in Buy Now:', error);
      Alert.alert('Error', 'An error occurred during payment.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6C63FF', '#8B82FF']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Icon name="cart" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Image */}
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Product Info */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{product.price}</Text>

          {/* Seller Info */}
          <View style={styles.infoCard}>
            <Icon name="store" size={20} color="#6C63FF" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Sold by</Text>
              <Text style={styles.sellerName}>{seller.companyName}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.infoCard}>
            <Icon name="text" size={20} color="#6C63FF" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.footer}>
        {cartQuantity === 0 ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddToCart}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="cart-plus" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buyButton]}
              onPress={handleBuyNow}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="lightning-bolt" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Buy Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(cartQuantity - 1)}
              >
                <Icon name="minus" size={20} color="#6C63FF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{cartQuantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartQuantity(cartQuantity + 1)}
              >
                <Icon name="plus" size={20} color="#6C63FF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.buyButton]}
              onPress={handleBuyNow}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="lightning-bolt" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Buy Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    paddingBottom: 100,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginVertical: 16,
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    zIndex: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButton: {
    backgroundColor: '#6C63FF',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
    elevation: 2,
  },
  quantityButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginHorizontal: 12,
  },
});

export default ProductDetailsScreen;