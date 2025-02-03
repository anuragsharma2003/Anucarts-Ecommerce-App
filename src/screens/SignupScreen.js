import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import emailjs from '@emailjs/browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEV_API_URL, PROD_API_URL, EMAILJS_USER_ID, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } from '@env';

const SignupScreen = ({ navigation }) => {
  // Keep all original state EXACTLY as is
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

  // Preserve original handleSendOtp logic
  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      const otpGenerated = Math.floor(100000 + Math.random() * 900000);
      const templateParams = { to_email: email, otp: otpGenerated };

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
      Alert.alert('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Preserve original handleSignup logic
  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
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
      const response = await fetch(`${BASE_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert(data.message || 'User created successfully');
        navigation.goBack();
      } else {
        Alert.alert(data.message || 'Error creating user');
      }
    } catch (error) {
      Alert.alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={22} color="#6C63FF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={22} color="#6C63FF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={22} color="#6C63FF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Icon name="lock-check-outline" size={22} color="#6C63FF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* OTP Input (conditional) */}
            {isOtpSent && (
              <View style={styles.inputContainer}>
                <Icon name="numeric" size={22} color="#6C63FF" style={styles.icon} />
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
          <View style={styles.buttonContainer}>
            {isOtpSent ? (
              <TouchableOpacity
                style={styles.mainButton}
                onPress={handleSignup}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#999', '#999'] : ['#6C63FF', '#8B82FF']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Complete Sign Up</Text>
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
                  colors={loading ? ['#999', '#999'] : ['#6C63FF', '#8B82FF']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginHighlight}>Login here</Text>
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
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 8,
    paddingHorizontal: 15,
    height: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 15,
  },
  mainButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
    color: '#6C63FF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;