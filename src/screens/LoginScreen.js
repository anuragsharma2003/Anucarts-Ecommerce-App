import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEV_API_URL, PROD_API_URL } from '@env';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const { token, user } = data;
        if (token) {
          await AsyncStorage.setItem('userToken', token);
          navigation.navigate('UserHomepage', { name: user.name });
        }
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Original seller login navigation - unchanged
  const handleSellerLogin = () => {
    navigation.navigate('SellerLogin');
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={styles.fullContainer}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Icon name="cart" size={40} color="#6C63FF" />
            <Text style={styles.title}>ANUCARTS</Text>
            <Text style={styles.subtitle}>Welcome back! Please sign in</Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#999', '#999'] : ['#6C63FF', '#8B82FF']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Signup Link */}
          <TouchableOpacity
            style={styles.signupContainer}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>
              Don't have an account?{' '}
              <Text style={styles.signupLink}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          {/* Seller Login */}
          <TouchableOpacity
            style={styles.sellerButton}
            onPress={handleSellerLogin}
          >
            <Text style={styles.sellerText}>
              Seller account? <Text style={styles.sellerLink}>Login here</Text>
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#6C63FF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  sellerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  sellerText: {
    color: '#666',
    fontSize: 14,
  },
  sellerLink: {
    color: '#6C63FF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;