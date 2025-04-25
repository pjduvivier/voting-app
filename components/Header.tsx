import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Colors from '@/constants/Colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export default function Header({ title, subtitle, rightElement }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftPlaceholder} />
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://bmodel.ch/wp-content/uploads/2024/01/logo-bmodel-black.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.rightElement}>
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftPlaceholder: {
    width: 40, // Same width as logout button
  },
  logoContainer: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: '100%',
  },
  rightElement: {
    width: 40,
    alignItems: 'flex-end',
  },
});