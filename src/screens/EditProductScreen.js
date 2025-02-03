import React, { useState, useEffect } from 'react';
import { DEV_API_URL, PROD_API_URL } from '@env';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EditProductScreen = ({ route, navigation }) => {
  const { productId, token } = route.params;
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: null,
  });
  const [imageWarning, setImageWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/product/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedProduct = response.data;
        setProduct({
          name: fetchedProduct.name,
          description: fetchedProduct.description,
          price: fetchedProduct.price.toString(),
          quantity: fetchedProduct.quantity.toString(),
          image: { uri: fetchedProduct.image },
        });
      } catch (error) {
        console.error('Error fetching product details:', error);
        Alert.alert('Error', 'Failed to fetch product details.');
      }
    };
    fetchProductDetails();
  }, [productId, token]);

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          console.error('ImagePicker Error:', response.errorMessage);
          return;
        }

        const fileSize = response.assets[0].fileSize;
        if (fileSize > 500 * 1024) {
          setImageWarning('Image size should not exceed 500KB.');
          setProduct({ ...product, image: null });
        } else {
          setImageWarning('');
          setProduct({ ...product, image: { uri: response.assets[0].uri } });
        }
      }
    );
  };

  const handleEditProduct = async () => {
    setLoading(true);
    try {
      if (!product.name || !product.description || !product.price ||
          !product.quantity || !product.image) {
        Alert.alert('Error', 'All fields, including the image, are required.');
        return;
      }

      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('quantity', product.quantity);

      if (product.image?.uri) {
        formData.append('image', {
          uri: product.image.uri,
          type: 'image/jpeg',
          name: 'product.jpg',
        });
      }

      await axios.put(
        `${BASE_URL}/product/edit/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('Success', 'Product updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error editing product:', error);
      Alert.alert('Error', 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Product</Text>

      <TouchableOpacity
        style={styles.imagePicker}
        onPress={handleImagePick}
        activeOpacity={0.8}
      >
        {product.image ? (
          <Image source={{ uri: product.image.uri }} style={styles.image} />
        ) : (
          <View style={styles.uploadContent}>
            <MaterialIcons name="cloud-upload" size={32} color="#2196F3" />
            <Text style={styles.imagePickerText}>Update Product Image</Text>
            <Text style={styles.imageSubText}>Max 500KB • JPEG/PNG</Text>
          </View>
        )}
      </TouchableOpacity>

      {imageWarning && <Text style={styles.warningText}>{imageWarning}</Text>}

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="drive-file-rename-outline"
          size={20}
          color="#2196F3"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          placeholderTextColor="#90A4AE"
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="description"
          size={20}
          color="#2196F3"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Description"
          placeholderTextColor="#90A4AE"
          value={product.description}
          onChangeText={(text) => setProduct({ ...product, description: text })}
          multiline
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <MaterialIcons
            name="attach-money"
            size={20}
            color="#2196F3"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            placeholderTextColor="#90A4AE"
            keyboardType="numeric"
            value={product.price}
            onChangeText={(text) => setProduct({ ...product, price: text })}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <MaterialIcons
            name="format-list-numbered"
            size={20}
            color="#2196F3"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            placeholderTextColor="#90A4AE"
            keyboardType="numeric"
            value={product.quantity}
            onChangeText={(text) => setProduct({ ...product, quantity: text })}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleEditProduct}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <MaterialIcons name="save-alt" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 32,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E3F2FD',
    paddingBottom: 16,
  },
  imagePicker: {
    height: 180,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BBDEFB',
    borderStyle: 'dashed',
  },
  uploadContent: {
    alignItems: 'center',
    padding: 16,
  },
  imagePickerText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  imageSubText: {
    color: '#90A4AE',
    fontSize: 12,
    marginTop: 4,
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#424242',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    color: '#FF5252',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default EditProductScreen;