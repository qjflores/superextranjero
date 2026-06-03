import React from 'react';
import { AuthProvider } from './state/AuthContext.js';
import { RootNavigator } from './navigation/RootNavigator.js';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
