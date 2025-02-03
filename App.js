import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importing screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SellerLoginScreen from './src/screens/SellerLoginScreen';
import SellerSignupScreen from './src/screens/SellerSignupScreen';
import SellerHomepage from './src/screens/SellerHomepage';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import UserHomepage from './src/screens/UserHomepage';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import SellerOrdersScreen from './src/screens/SellerOrdersScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SellerLogin"
          component={SellerLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SellerSignup"
          component={SellerSignupScreen}
          options={{ headerShown: false }}
        />

        {/* Seller Screens */}
        <Stack.Screen
          name="SellerHomepage"
          component={SellerHomepage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={{ title: 'Add Product' }}
        />
        <Stack.Screen
          name="EditProduct"
          component={EditProductScreen}
          options={{ title: 'Edit Product' }}
        />

        {/* User Screens */}
        <Stack.Screen
          name="UserHomepage"
          component={UserHomepage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccessScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyOrders"
          component={MyOrdersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SellerOrdersScreen"
          component={SellerOrdersScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}