import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatRoomsScreen from './ChatRoomsScreen';
import ChatRoomScreen from './ChatRoomScreen';

const Stack = createStackNavigator();

export default function RoomsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      <Stack.Screen 
        name="ChatRoomsList" 
        component={ChatRoomsScreen} 
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
      />
    </Stack.Navigator>
  );
}
