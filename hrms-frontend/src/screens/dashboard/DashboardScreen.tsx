import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboardStats, fetchEmployeeDashboard } from '../../store/slices/dashboardSlice';
import { logout } from '../../store/slices/authSlice';
import GradientCard from '../../components/common/GradientCard';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function DashboardScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, employeeDashboard, loading } = useSelector((state: RootState) => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN');
  const isHR = user?.roles?.some(role => role.name === 'HR');
  const isEmployee = user?.roles?.some(role => role.name === 'EMPLOYEE');

  useEffect(() => {
    loadDashboardData();
  }, [dispatch, isAdmin, isHR, isEmployee]);

  const loadDashboardData = async () => {
    if (isAdmin || isHR) {
      await dispatch(fetchDashboardStats());
    } else if (isEmployee) {
      await dispatch(fetchEmployeeDashboard());
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return '#e6fffa';
      case 'SUBMITTED': return '#fff5e6';
      case 'REJECTED': return '#ffe6e6';
      case 'DRAFT': return '#f0f0f0';
      default: return '#f0f0f0';
    }
  };

  const renderAdminDashboard = () => (
    <View>
      {/* Key Metrics Section */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.statsGrid}>
          <GradientCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon="people"
            gradient={['#667eea', '#764ba2']}
            subtitle={`${stats?.onboardingEmployees || 0} new this month`}
            style={styles.statCard}
            onPress={() => navigation.navigate('EmployeeList')}
          />
          <GradientCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            icon="briefcase"
            gradient={['#4facfe', '#00f2fe']}
            subtitle={`${stats?.totalProjects || 0} total projects`}
            style={styles.statCard}
            onPress={() => navigation.navigate('ProjectList')}
          />
          <GradientCard
            title="Pending Documents"
            value={stats?.pendingDocuments || 0}
            icon="document-text"
            gradient={['#43e97b', '#38f9d7']}
            subtitle={`${stats?.totalDocuments || 0} total docs`}
            style={styles.statCard}
            onPress={() => navigation.navigate('Documents')}
          />
          <GradientCard
            title="Pending Offboardings"
            value={stats?.pendingOffboardings || 0}
            icon="exit"
            gradient={['#fa709a', '#fee140']}
            subtitle={`${stats?.completedOffboardings || 0} completed`}
            style={styles.statCard}
            onPress={() => navigation.navigate('OffboardingList')}
          />
        </View>
      </View>

      {/* Invoice & Financial Section */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <View style={styles.statsGrid}>
          <GradientCard
            title="Total Invoices"
            value={stats?.totalInvoices || 0}
            icon="receipt"
            gradient={['#667eea', '#764ba2']}
            subtitle={`$${(stats?.totalInvoiceAmount || 0).toLocaleString()}`}
            style={styles.statCard}
            onPress={() => navigation.navigate('InvoiceDashboard')}
          />
          <GradientCard
            title="Paid Invoices"
            value={stats?.paidInvoices || 0}
            icon="checkmark-circle"
            gradient={['#4facfe', '#00f2fe']}
            subtitle={`${stats?.pendingInvoices || 0} pending`}
            style={styles.statCard}
            onPress={() => navigation.navigate('InvoiceDashboard')}
          />
        </View>
      </View>

      {/* Timesheet Section */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Timesheet Management</Text>
        <View style={styles.statsGrid}>
          <GradientCard
            title="Total Timesheets"
            value={stats?.totalTimesheets || 0}
            icon="calendar-check"
            gradient={['#43e97b', '#38f9d7']}
            subtitle={`${stats?.approvedTimesheets || 0} approved`}
            style={styles.statCard}
            onPress={() => navigation.navigate('TimesheetList')}
          />
          <GradientCard
            title="Pending Approvals"
            value={stats?.pendingApprovalTimesheets || 0}
            icon="hourglass"
            gradient={['#fa709a', '#fee140']}
            subtitle={`${stats?.rejectedTimesheets || 0} rejected`}
            style={styles.statCard}
            onPress={() => navigation.navigate('TimesheetApprovals')}
          />
        </View>
      </View>

      {/* Department Analytics */}
      {stats?.departmentStats && Object.keys(stats.departmentStats).length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Department Distribution</Text>
          <Card style={styles.chartCard}>
            <Card.Content>
              <View style={styles.departmentStats}>
                {Object.entries(stats.departmentStats).map(([dept, count]) => (
                  <View key={dept} style={styles.departmentItem}>
                    <View style={styles.departmentInfo}>
                      <Text style={styles.departmentName}>{dept}</Text>
                      <Text style={styles.departmentCount}>{count} employees</Text>
                    </View>
                    <View style={styles.departmentBar}>
                      <View 
                        style={[
                          styles.departmentProgress, 
                          { width: `${(Number(count) / (stats?.totalEmployees || 1)) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Recent Activities */}
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        <View style={styles.activitiesGrid}>
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.activityIcon}
                >
                  <Ionicons name="person-add" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.activityTitle}>Recent Hires</Text>
              </View>
              
              <View style={styles.activityList}>
                {stats?.recentEmployees && stats.recentEmployees.length > 0 ? (
                  stats.recentEmployees.slice(0, 3).map((employee: any, index: number) => (
                    <TouchableOpacity 
                      key={employee.id || index} 
                      style={styles.activityItem}
                      onPress={() => navigation.navigate('EmployeeView', { id: employee.id })}
                    >
                      <LinearGradient
                        colors={['#4facfe', '#00f2fe']}
                        style={styles.activityAvatar}
                      >
                        <Text style={styles.avatarText}>
                          {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                        </Text>
                      </LinearGradient>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityName}>
                          {employee.firstName} {employee.lastName}
                        </Text>
                        <Text style={styles.activityMeta}>{employee.jobTitle}</Text>
                      </View>
                      <Text style={styles.activityTime}>
                        {new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="inbox" size={32} color="#a0aec0" />
                    <Text style={styles.emptyText}>No recent hires</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <LinearGradient
                  colors={['#43e97b', '#38f9d7']}
                  style={styles.activityIcon}
                >
                  <Ionicons name="briefcase" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.activityTitle}>Latest Projects</Text>
              </View>
              
              <View style={styles.activityList}>
                {stats?.recentProjects && stats.recentProjects.length > 0 ? (
                  stats.recentProjects.slice(0, 3).map((project: any, index: number) => (
                    <TouchableOpacity 
                      key={project.id || index} 
                      style={styles.activityItem}
                      onPress={() => navigation.navigate('ProjectView', { id: project.id })}
                    >
                      <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        style={styles.activityAvatar}
                      >
                        <Text style={styles.avatarText}>
                          {project.projectName?.substring(0, 2).toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityName}>{project.projectName}</Text>
                        <Text style={styles.activityMeta}>{project.clientCompanyName}</Text>
                      </View>
                      <Text style={styles.activityTime}>
                        {new Date(project.projectStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="inbox" size={32} color="#a0aec0" />
                    <Text style={styles.emptyText}>No recent projects</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>
    </View>
  );

  const renderEmployeeDashboard = () => (
    <View style={styles.employeeSection}>
      <Card style={styles.welcomeCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.welcomeGradient}
        >
          <Text style={styles.welcomeText}>Welcome back, {user?.username}!</Text>
          <Text style={styles.welcomeSubtext}>Here's your dashboard overview</Text>
        </LinearGradient>
      </Card>

      {/* Employee Stats */}
      {employeeDashboard && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>My Overview</Text>
          <View style={styles.statsGrid}>
            <GradientCard
              title="My Timesheets"
              value={employeeDashboard.totalTimesheets || 0}
              icon="time"
              gradient={['#43e97b', '#38f9d7']}
              subtitle={`${employeeDashboard.approvedTimesheets || 0} approved`}
              style={styles.statCard}
              onPress={() => navigation.navigate('TimesheetList')}
            />
            <GradientCard
              title="Draft Timesheets"
              value={employeeDashboard.draftTimesheets || 0}
              icon="document"
              gradient={['#fa709a', '#fee140']}
              subtitle={`${employeeDashboard.submittedTimesheets || 0} submitted`}
              style={styles.statCard}
              onPress={() => navigation.navigate('TimesheetList')}
            />
            <GradientCard
              title="My Documents"
              value={employeeDashboard.totalDocuments || 0}
              icon="folder"
              gradient={['#4facfe', '#00f2fe']}
              subtitle={`${employeeDashboard.verifiedDocs || 0} verified`}
              style={styles.statCard}
              onPress={() => navigation.navigate('Documents')}
            />
            <GradientCard
              title="Pending Docs"
              value={employeeDashboard.pendingDocs || 0}
              icon="clock"
              gradient={['#667eea', '#764ba2']}
              subtitle="Awaiting review"
              style={styles.statCard}
              onPress={() => navigation.navigate('Documents')}
            />
          </View>
        </View>
      )}
      
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('TimesheetList')}
          >
            <Card style={styles.actionCardInner}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="time" size={32} color="#667eea" />
                <Text style={styles.actionTitle}>My Timesheets</Text>
                <Text style={styles.actionSubtitle}>Track your time</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Documents')}
          >
            <Card style={styles.actionCardInner}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="document-text" size={32} color="#4facfe" />
                <Text style={styles.actionTitle}>Documents</Text>
                <Text style={styles.actionSubtitle}>Manage files</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('SelfService')}
          >
            <Card style={styles.actionCardInner}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="headset" size={32} color="#43e97b" />
                <Text style={styles.actionTitle}>Support</Text>
                <Text style={styles.actionSubtitle}>Get help</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Card style={styles.actionCardInner}>
              <Card.Content style={styles.actionContent}>
                <Ionicons name="person" size={32} color="#fa709a" />
                <Text style={styles.actionTitle}>Profile</Text>
                <Text style={styles.actionSubtitle}>View details</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Timesheets for Employee */}
      {employeeDashboard?.recentTimesheets && employeeDashboard.recentTimesheets.length > 0 && (
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Recent Timesheets</Text>
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityList}>
                {employeeDashboard.recentTimesheets.slice(0, 5).map((timesheet: any, index: number) => (
                  <TouchableOpacity 
                    key={timesheet.id || index} 
                    style={styles.activityItem}
                    onPress={() => navigation.navigate('TimesheetView', { id: timesheet.id })}
                  >
                    <View style={styles.timesheetStatus}>
                      <Chip 
                        mode="outlined" 
                        compact 
                        style={[
                          styles.statusChip,
                          { backgroundColor: getStatusColor(timesheet.status) }
                        ]}
                      >
                        {timesheet.status}
                      </Chip>
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityName}>
                        Week of {new Date(timesheet.weekStartDate).toLocaleDateString()}
                      </Text>
                      <Text style={styles.activityMeta}>
                        {timesheet.totalHours || 0} hours logged
                      </Text>
                    </View>
                    <Text style={styles.activityTime}>
                      {new Date(timesheet.lastModified || timesheet.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );

  if (loading && !stats && !employeeDashboard) {
    return (
      <LinearGradient colors={['#f5f7fa', '#c3cfe2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#c3cfe2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color="#2d3748" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              <Ionicons name="speedometer" size={28} color="#2d3748" />
              {' '}Dashboard
            </Text>
            <Text style={styles.headerSubtitle}>
              {isAdmin ? 'Administrator View' : isHR ? 'HR Manager View' : 'Employee View'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {/* Notification Bell */}
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications" size={24} color="#718096" />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.userAvatar}
            >
              <Text style={styles.avatarText}>
                {user?.username ? user.username.substring(0, 1).toUpperCase() : 'U'}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.userName}>{user?.username || 'User'}</Text>
              <Text style={styles.userRole}>
                {isAdmin ? 'Administrator' : isHR ? 'HR Manager' : 'Employee'}
              </Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={handleLogout}
            icon="logout"
            compact
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {(isAdmin || isHR) ? renderAdminDashboard() : renderEmployeeDashboard()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTablet ? 30 : 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 22,
    fontWeight: '700',
    color: '#2d3748',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  userName: {
    fontWeight: 'bold',
    color: '#2d3748',
  },
  userRole: {
    fontSize: 12,
    color: '#718096',
  },
  logoutButton: {
    borderColor: '#dc3545',
  },
  content: {
    flex: 1,
    padding: isTablet ? 30 : 20,
  },
  metricsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: isTablet ? '23%' : '48%',
    marginBottom: 25,
  },
  chartSection: {
    marginBottom: 40,
  },
  chartCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  departmentStats: {
    gap: 15,
  },
  departmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  departmentInfo: {
    flex: 1,
    marginRight: 15,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  departmentCount: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  departmentBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  departmentProgress: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  activitiesSection: {
    marginBottom: 40,
  },
  activitiesGrid: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 30,
  },
  activityCard: {
    flex: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#f7fafc',
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontWeight: '600',
    color: '#2d3748',
    fontSize: 14,
  },
  activityMeta: {
    color: '#718096',
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    color: '#a0aec0',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#a0aec0',
    fontSize: 14,
    marginTop: 8,
  },
  employeeSection: {
    flex: 1,
  },
  welcomeCard: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  welcomeGradient: {
    padding: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActions: {
    marginBottom: 30,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: isTablet ? '48%' : '48%',
    marginBottom: 20,
  },
  actionCardInner: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginTop: 12,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  timesheetStatus: {
    marginRight: 15,
  },
  statusChip: {
    height: 28,
  },
});