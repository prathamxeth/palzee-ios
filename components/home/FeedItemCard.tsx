import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, getSmileyColorForUser } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { SubmissionDbItem } from '../../types';

interface FeedItemCardProps {
  item: SubmissionDbItem;
}

export const FeedItemCard: React.FC<FeedItemCardProps> = ({ item }) => {
  const parts = item.userDisplayName.split('|||');
  const name = parts[0]?.split(' ')[0] || 'Pal';
  const avatarUrl = parts[1] || null;
  const avatarBg = getSmileyColorForUser(item.userId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{name}</Text>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.media} resizeMode="cover" />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 24,
    backgroundColor: '#111',
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF5232',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  name: {
    fontFamily: Fonts.Ownglyph,
    color: '#FFF',
    fontSize: 18,
  },
  media: {
    width: '100%',
    height: '100%',
  },
});
