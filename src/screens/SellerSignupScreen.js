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
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import emailjs from '@emailjs/browser';
import { EMAILJS_USER_ID, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'react-native-linear-gradient';

const SellerSignupScreen = ({ navigation }) => {
  // Original state management - unchanged
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  // Original OTP handling logic - unchanged
  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      const otpGenerated = Math.floor(100000 + Math.random() * 900000);
      const templateParams = {
        to_email: email,
        otp: otpGenerated,
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );

      if (response.status === 200) {
        setOtp(otpGenerated.toString());
        setIsOtpSent(true);
        Alert.alert('OTP sent to your email');
      } else {
        Alert.alert('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Original signup logic - unchanged
  const handleSignup = async () => {
    if (!name || !companyName || !email || !password || !confirmPassword) {
      Alert.alert('All fields are required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid email format');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (otp !== enteredOtp) {
      Alert.alert('Invalid OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/seller/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, companyName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(data.message || 'Seller account created successfully');
        navigation.goBack();
      } else {
        Alert.alert(data.message || 'Error creating seller account');
      }
    } catch (error) {
      Alert.alert('Error: ' + error.message);
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
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#2D2D2D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Business Registration</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Main Form Content */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Seller Account</Text>
            <Text style={styles.subtitle}>Register your business with ANUCARTS</Text>

            {/* Input Fields */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Icon name="account" size={20} color="#2196F3" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="office-building" size={20} color="#2196F3" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Company Name"
                  placeholderTextColor="#888"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="email" size={20} color="#2196F3" style={styles.icon} />
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
                <Icon name="lock" size={20} color="#2196F3" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock-check" size={20} color="#2196F3" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#888"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {isOtpSent && (
                <View style={styles.inputContainer}>
                  <Icon name="numeric" size={20} color="#2196F3" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor="#888"
                    value={enteredOtp}
                    onChangeText={setEnteredOtp}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            {/* Action Buttons */}
            {isOtpSent ? (
              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleSignup}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#999', '#999'] : ['#2196F3', '#1976D2']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Complete Registration</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#999', '#999'] : ['#2196F3', '#1976D2']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Verify Email</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginText}>
                Already registered?{' '}
                <Text style={styles.loginHighlight}>Sign In here</Text>
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
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
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
    shadowRadius: 8,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#2D2D2D',
    fontSize: 16,
  },
  mainButton: {
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
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginHighlight: {
    color: '#2196F3',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SellerSignupScreen;