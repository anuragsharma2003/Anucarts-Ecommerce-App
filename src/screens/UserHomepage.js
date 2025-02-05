import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEV_API_URL, PROD_API_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserHomepage = ({ route, navigation }) => {
  // Keep all original state and logic unchanged
  const [name, setName] = useState(route.params?.name || 'User');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        alert('Please log in first.');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${BASE_URL}/product`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const sortedProducts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
      } else {
        alert(data.message || 'Failed to fetch products.');
      }
    } catch (error) {
      alert('Error fetching products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetails', {
        product: item,
        seller: item.seller,
      })}
      style={styles.productCard}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <View style={styles.sellerContainer}>
          <Icon name="store" size={14} color="#6C63FF" />
          <Text style={styles.sellerName}>{item.seller?.companyName || 'Unknown Seller'}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={14} color="#666" />
          <Text style={styles.productDate}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.userName}>{name}</Text>
        <TouchableOpacity
          style={styles.ordersButton}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.ordersButtonText}>
            <Icon name="package-variant" size={16} color="#FFF" /> My Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="emoticon-sad-outline" size={40} color="#666" />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#6C63FF',
    elevation: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  ordersButton: {
    backgroundColor: '#584EB7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  ordersButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
    marginTop: 4,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sellerName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  productDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});

export default UserHomepage;