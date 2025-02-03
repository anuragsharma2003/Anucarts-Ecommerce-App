import React, { useState, useEffect } from 'react';
import { DEV_API_URL, PROD_API_URL } from '@env';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import axios from 'axios';

const SellerHomepage = ({ route, navigation }) => {
  const { token } = route.params;
  const [sellerName, setSellerName] = useState('');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const sellerResponse = await axios.get(`${BASE_URL}/seller/home`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSellerName(sellerResponse.data.name);

        const productsResponse = await axios.get(`${BASE_URL}/product/seller`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedProducts = productsResponse.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data.');
      }
    };

    fetchSellerData();
  }, [token]);

  const handleDelete = async (productId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/product/delete/${productId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(products.filter((product) => product._id !== productId));
            Alert.alert('Success', 'Product deleted successfully');
          } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Failed to delete product.');
          }
        },
      },
    ]);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.cardContent}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProduct', { productId: item._id, token })}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.sellerName}>{sellerName || 'Loading...'}</Text>
        <TouchableOpacity
          style={styles.ordersButton}
          onPress={() => navigation.navigate('SellerOrdersScreen', { token })}
        >
          <Text style={styles.ordersButtonText}>Your Orders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#90A4AE"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found. Add your first product!</Text>
        }
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddProduct', { token })}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  appBar: {
    backgroundColor: '#2196F3',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sellerName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  ordersButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  ordersButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#424242',
  },
  productList: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 28,
    lineHeight: 28,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginTop: 32,
  },
});

export default SellerHomepage;