import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

const MAPPING: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  // Navegación y Básicos
  'house.fill': 'engineering',
  'clock.fill': 'history',
  'play.fill': 'play-circle',
  'stop.fill': 'stop-circle',
  'doc.text.fill': 'assignment',
  'mappin.and.ellipse': 'location-searching',
  'archivebox.fill': 'inventory',
  'wifi': 'wifi',
  'wifi.off': 'wifi-off',
  'search': 'search',
  
  // Seguridad y Login
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  
  // Feedback y Estados
  'exclamationmark.triangle.fill': 'error',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'info.circle.fill': 'info',

  // UI General
  'calendar': 'today',
  'image': 'image',
    'chevron.left': 'chevron-left',
  'camera': 'photo-camera',
  'person.fill': 'person',
  'tag.fill': 'label',
  'chevron.right': 'chevron-right',
  'close': 'close',
  'location.fill': 'place',
  
  // Acciones (Sprint 3)
    'photo.stack': 'photo-library',
  'pencil': 'edit',
  'trash': 'delete',
  'save': 'save',
    'arrow.down.circle': 'cached',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  const iconName = MAPPING[name] || 'help';
  return <MaterialIcons name={iconName} size={size} color={color} style={style} />;
}