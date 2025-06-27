import React from 'react';
import { ActivityIndicator, View } from 'react-native';

interface LoadingIndicatorProps {
    size?: 'small' | 'large';
    color?: string;
}

export default function LoadingIndicator({
    color = '#26b8b5',
    size = 'large',
}: LoadingIndicatorProps) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
}
