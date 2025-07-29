import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Lock, 
  TrendingUp, 
  Calendar,
  Activity,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { userService } from '../lib/api/users';
import { auditService } from '../lib/api/audit';
import SystemIntegrationPanel from '../components/integration/SystemIntegrationPanel';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userService.getUserStats(),
  });

  // Fetch recent audit logs
  const { data: recentAudit } = useQuery({
    queryKey: ['recent-audit'],
    queryFn: () => auditService.getAuditLogs({ limit: 5 }),
  });

  const stats = userStats?.data;
  
  // Handle audit logs data structure
  let auditLogs: any[] = [];
  if (recentAudit?.data) {
    if (Array.isArray(recentAudit.data)) {
      auditLogs = recentAudit.data;
    } else {
      const data = recentAudit.data as any;
      auditLogs = data.data || data.logs || [];
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        navigate('/users');
        break;
      case 'roles':
        navigate('/roles');
        break;
      case 'audit':
        navigate('/audit');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.profile.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your user management system today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentRegistrations || 0} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inactiveUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Users</CardTitle>
            <Lock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lockedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Security issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roles Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Roles Distribution
            </CardTitle>
            <CardDescription>
              Overview of users by role assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="capitalize">
                      {role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium">{count as number}</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalUsers ? ((count as number) / stats.totalUsers) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.usersByRole || Object.keys(stats.usersByRole).length === 0) && (
                <div className="text-center text-gray-500 py-8">
                  No role data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.length > 0 ? auditLogs.map((log: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {log.action?.includes('create') ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : log.action?.includes('delete') ? (
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {log.action || 'Unknown action'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.performedBy?.username || 'System'} • {' '}
                      {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Unknown time'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Response Time</span>
                <span className="font-medium text-green-600">~120ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Database Health</span>
                <span className="font-medium text-green-600">Excellent</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cache Hit Rate</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Failed Login Attempts</span>
                <span className="font-medium text-yellow-600">3 today</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>2FA Enabled Users</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Password Policy</span>
                <span className="font-medium text-green-600">Enforced</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-sm"
                onClick={() => handleQuickAction('users')}
              >
                → View User Reports
              </Button>
              <Button 
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-sm"
                onClick={() => handleQuickAction('roles')}
              >
                → Manage Roles
              </Button>
              <Button 
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-sm"
                onClick={() => handleQuickAction('audit')}
              >
                → Export Audit Log
              </Button>
              <Button 
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-sm"
                onClick={() => handleQuickAction('settings')}
              >
                → System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Integration Panel */}
      <div className="mt-8">
        <SystemIntegrationPanel />
      </div>
    </div>
  );
}
