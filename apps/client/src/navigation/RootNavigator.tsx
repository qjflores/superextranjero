import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../state/AuthContext.js';
import { HomeScreen } from '../screens/HomeScreen.js';
import { LoginScreen } from '../screens/LoginScreen.js';
import { SeedingScreen } from '../screens/SeedingScreen.js';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { auth } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerTitle: 'Survival Spanish',
        }}
      >
        {!auth.isAuthenticated ? (
          // Unauthenticated Stack
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Sign In',
                headerLeft: () => null,
              }}
            />
          </Stack.Group>
        ) : !auth.email ? (
          // Loading state
          <Stack.Group>
            <Stack.Screen
              name="Loading"
              component={() => null}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        ) : (
          // Authenticated Stack
          <Stack.Group>
            <Stack.Screen
              name="Seeding"
              component={SeedingScreen}
              options={{
                title: 'Learn Verbs',
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Home' }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
