import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AdoptButtonProps {
  onPress: () => void;
  title?: string;
}

export default function AdoptButton({ onPress, title = 'Adotar' }: AdoptButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#26b8b5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
