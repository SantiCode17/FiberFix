import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

const MAPPING: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  'house.fill': 'engineering',
  'clock.fill': 'history',
  'play.fill': 'play-circle',
  'stop.fill': 'stop-circle',
  'doc.text.fill': 'assignment',
  'mappin.and.ellipse': 'location-searching',
  'archivebox.fill': 'inventory',
  'wifi': 'wifi',
  'wifi.off': 'wifi-off',
};

export function IconSymbol({ name, size = 24, color, style }: { name: string; size?: number; color: string; style?: StyleProp<TextStyle>; }) {
  const iconName = MAPPING[name] || 'help';
  return <MaterialIcons name={iconName} size={size} color={color} style={style} />;
}