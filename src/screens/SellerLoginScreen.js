import React, { useState } from 'react';
import { DEV_API_URL, PROD_API_URL } from '@env';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SellerLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  const handleSellerLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/seller/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigation.navigate('SellerHomepage', {
          sellerId: data.sellerId,
          token: data.token
        });
      } else {
        alert(data.message || 'Invalid email or password');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FF']} style={styles.fullContainer}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#2D2D2D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Seller Portal</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Main Content */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Manage your business account</Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color="#2196F3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Business Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#2196F3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSellerLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#999', '#999'] : ['#2196F3', '#1976D2']}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Signup Link */}
            <TouchableOpacity
              style={styles.signupContainer}
              onPress={() => navigation.navigate('SellerSignup')}
            >
              <Text style={styles.signupText}>
                New seller? {' '}
                <Text style={styles.signupLink}>Create business account</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
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
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#2D2D2D',
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 25,
  },
  gradientButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
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
    color: '#2196F3',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SellerLoginScreen;