import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Download, 
  Clock,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { auditService } from '../lib/api/audit';
import type { AuditLog } from '../types';

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');

  // Fetch audit logs
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['audit-logs', searchTerm, actionFilter, dateRange],
    queryFn: () => auditService.getAuditLogs({
      search: searchTerm,
      action: actionFilter === 'all' ? undefined : actionFilter,
      startDate: getDateRangeStart(dateRange),
    }),
  });

  // Helper function to get start date based on range
  function getDateRangeStart(range: string): string {
    const now = new Date();
    switch (range) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  // Handle audit logs data structure
  let auditLogs: AuditLog[] = [];
  let totalLogs = 0;
  
  if (response?.data) {
    if (Array.isArray(response.data)) {
      auditLogs = response.data;
      totalLogs = response.data.length;
    } else {
      const data = response.data as any;
      auditLogs = data.data || data.logs || [];
      totalLogs = data.total || data.pagination?.total || auditLogs.length;
    }
  }

  const handleExport = async () => {
    try {
      toast.success('Audit log export started...');
      // Here you would call the export API
      // await auditService.exportLogs({ search: searchTerm, action: actionFilter, dateRange });
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('register')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else if (lowerAction.includes('update') || lowerAction.includes('modify')) {
      return <Info className="h-4 w-4 text-blue-600" />;
    } else if (lowerAction.includes('login') || lowerAction.includes('logout')) {
      return <User className="h-4 w-4 text-purple-600" />;
    } else {
      return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('register')) {
      return <Badge variant="success">Create</Badge>;
    } else if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
      return <Badge variant="destructive">Delete</Badge>;
    } else if (lowerAction.includes('update') || lowerAction.includes('modify')) {
      return <Badge variant="info">Update</Badge>;
    } else if (lowerAction.includes('login')) {
      return <Badge variant="success">Login</Badge>;
    } else if (lowerAction.includes('logout')) {
      return <Badge variant="secondary">Logout</Badge>;
    } else {
      return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-600';
      case 'medium':
      case 'warning':
        return 'text-yellow-600';
      case 'low':
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Error loading audit logs: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all system activities and security events
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              User Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.action?.includes('user')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => 
                log.action?.includes('login') || 
                log.action?.includes('security') ||
                log.action?.includes('failed')
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => {
                if (!log.timestamp) return false;
                const logDate = new Date(log.timestamp);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return logDate > oneDayAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading audit logs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No audit logs found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <TableRow key={log.id || `log-${log.timestamp}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getActionIcon(log.action || 'unknown')}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {log.action || 'Unknown Action'}
                        </div>
                        {log.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {log.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.action || 'unknown')}
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-900 dark:text-white">
                      {log.username || 'System'}
                    </div>
                    {log.userRole && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {log.userRole}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {log.resource || '-'}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                    {log.ipAddress || '-'}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${getSeverityColor(log.severity)}`}>
                      <div className={`w-2 h-2 rounded-full bg-current`}></div>
                      <span className="text-sm capitalize">
                        {log.severity || 'info'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {auditLogs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {auditLogs.length} of {totalLogs} audit logs
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
