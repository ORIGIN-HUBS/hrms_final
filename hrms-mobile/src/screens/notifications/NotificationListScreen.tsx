import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const NotificationListScreen: React.FC<any> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getAllNotifications();
      const notificationsArray = Array.isArray(data) ? data : [];
      setNotifications(notificationsArray);
      setFilteredNotifications(notificationsArray);

      const count = await notificationService.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
      setNotifications([]);
      setFilteredNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [selectedType, selectedCategory, notifications]);

  const filterNotifications = () => {
    if (!Array.isArray(notifications)) {
      setFilteredNotifications([]);
      return;
    }

    let filtered = notifications;

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'checkmark-circle';
      case 'INFO': return 'information-circle';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'close-circle';
      default: return 'notifications';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return colors.success;
      case 'INFO': return colors.info;
      case 'WARNING': return colors.warning;
      case 'ERROR': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DOCUMENT': return colors.primary;
      case 'EMPLOYEE': return colors.secondary;
      case 'PROJECT': return colors.info;
      case 'OFFBOARDING': return colors.warning;
      case 'TIMESHEET': return colors.success;
      default: return colors.gray[500];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => !item.isRead && handleMarkAsRead(item.id)}
    >
      <Card style={[styles.notificationCard, !item.isRead ? styles.unreadCard : undefined]}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationLeft}>
            <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
              <Ionicons name={getTypeIcon(item.type) as any} size={24} color={getTypeColor(item.type)} />
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.titleRow}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <View style={styles.metaRow}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                  <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                    {item.category}
                  </Text>
                </View>
                <Text style={[styles.timestamp, { marginLeft: spacing.sm }]}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <Card style={styles.headerCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {notifications.length - unreadCount}
            </Text>
            <Text style={styles.statLabel}>Read</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <Button
            title="Mark All as Read"
            onPress={handleMarkAllAsRead}
            variant="outline"
            size="small"
          />
        )}
      </Card>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Type:</Text>
            {['ALL', 'SUCCESS', 'INFO', 'WARNING', 'ERROR'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, selectedType === type && styles.filterChipActive, { marginRight: spacing.sm }]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category:</Text>
            {['ALL', 'DOCUMENT', 'EMPLOYEE', 'PROJECT', 'OFFBOARDING', 'TIMESHEET'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive, { marginRight: spacing.sm }]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} />
        }
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          </Card>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  headerCard: {
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

export default NotificationListScreen;
