import { useState, useEffect } from 'react';
import { 
  Building2, 
  ExternalLink,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface SystemIntegration {
  name: string;
  url: string;
  icon: React.ComponentType<any>;
  description: string;
  status: 'online' | 'offline' | 'maintenance';
  features: string[];
}

const systems: SystemIntegration[] = [
  {
    name: 'Warehouse Management',
    url: import.meta.env.VITE_WAREHOUSE_FRONTEND_URL || 'http://localhost:3003',
    icon: Building2,
    description: 'Manage inventory, warehouses, and logistics operations',
    status: 'online',
    features: [
      'Inventory Tracking',
      'Warehouse Operations',
      'Stock Management',
      'Reporting & Analytics'
    ]
  }
];

export default function SystemIntegrationPanel() {
  const [systemStatuses, setSystemStatuses] = useState<Record<string, 'online' | 'offline' | 'checking'>>({});

  useEffect(() => {
    // Check system availability
    const checkSystemStatus = async () => {
      for (const system of systems) {
        setSystemStatuses(prev => ({ ...prev, [system.name]: 'checking' }));
        
        try {
          // Simple health check - in production, use proper health endpoints
          await fetch(system.url, { 
            method: 'HEAD',
            mode: 'no-cors'
          });
          setSystemStatuses(prev => ({ ...prev, [system.name]: 'online' }));
        } catch (error) {
          setSystemStatuses(prev => ({ ...prev, [system.name]: 'offline' }));
        }
      }
    };

    checkSystemStatus();
    
    // Check every 5 minutes
    const interval = setInterval(checkSystemStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSystemAccess = (system: SystemIntegration) => {
    // Open in new tab with user context if possible
    const url = new URL(system.url);
    
    // Pass user token for SSO (if implemented)
    const token = localStorage.getItem('accessToken');
    if (token) {
      url.searchParams.set('token', token);
    }
    
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Integration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access other ERP modules and systems
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <SettingsIcon className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {systems.map((system) => {
          const Icon = system.icon;
          const currentStatus = systemStatuses[system.name] || system.status;
          
          return (
            <div 
              key={system.name}
              className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {system.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(currentStatus)}`}
                    >
                      {currentStatus === 'checking' ? 'Checking...' : currentStatus}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {system.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {system.features.slice(0, 3).map((feature, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {system.features.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        +{system.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSystemAccess(system)}
                  disabled={currentStatus === 'offline'}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Access
                </Button>
              </div>
            </div>
          );
        })}

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Quick Actions
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 justify-start"
              onClick={() => {
                const warehouseUrl = import.meta.env.VITE_WAREHOUSE_FRONTEND_URL || 'http://localhost:3003';
                window.open(`${warehouseUrl}/inventory`, '_blank');
              }}
            >
              <Building2 className="h-4 w-4" />
              View Inventory
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 justify-start"
              onClick={() => {
                const warehouseUrl = import.meta.env.VITE_WAREHOUSE_FRONTEND_URL || 'http://localhost:3003';
                window.open(`${warehouseUrl}/transactions`, '_blank');
              }}
            >
              <Bell className="h-4 w-4" />
              Recent Transactions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
