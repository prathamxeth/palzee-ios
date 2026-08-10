import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { PalItem } from '../../types';

interface PalGroupGridScreenProps {
  groups: PalItem[];
  onSelectGroup: (group: PalItem) => void;
  onOpenCreateModal: () => void;
  onBackToFeed: () => void;
}

export default function PalGroupGridScreen({
  groups,
  onSelectGroup,
  onOpenCreateModal,
  onBackToFeed,
}: PalGroupGridScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToFeed}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Pal Groups</Text>
        <TouchableOpacity onPress={onOpenCreateModal}>
          <Text style={styles.addBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.code}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelectGroup(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.groupName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isCreator && (
                <View style={styles.creatorBadge}>
                  <Text style={styles.creatorBadgeText}>Admin</Text>
                </View>
              )}
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.codeText}>Code: {item.code}</Text>
              <View style={styles.sizeBadge}>
                <Text style={styles.sizeText}>{item.size} Members</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.Bricolage,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  addBtn: {
    color: Colors.PalFireRed,
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    flex: 1,
    height: 140,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontFamily: Fonts.Bricolage,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  creatorBadge: {
    backgroundColor: 'rgba(255,82,50,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  creatorBadgeText: {
    color: Colors.PalFireRed,
    fontSize: 10,
    fontWeight: '700',
  },
  cardFooter: {
    gap: 4,
  },
  codeText: {
    color: '#888',
    fontSize: 12,
    fontFamily: Fonts.RobotoMediumNumbers,
  },
  sizeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sizeText: {
    color: '#DDD',
    fontSize: 11,
  },
});
