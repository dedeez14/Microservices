import { useState, useEffect } from 'react';
import { 
  Users, 
  ExternalLink,
  Settings as SettingsIcon,
  Shield,
  Activity
} from 'lucide-react';

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
    name: 'User Management',
    url: import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:3002',
    icon: Users,
    description: 'Manage users, roles, authentication, and access control',
    status: 'online',
    features: [
      'User Management',
      'Role Based Access Control',
      'Authentication & JWT',
      'Audit Logs & Security'
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
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSystemAccess = (system: SystemIntegration) => {
    // Open in new tab with user context if possible
    const url = new URL(system.url);
    
    // Pass user token for SSO (if implemented)
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      url.searchParams.set('token', token);
    }
    
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              System Integration
            </h3>
            <p className="text-sm text-gray-600">
              Access other ERP modules and systems
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <SettingsIcon className="h-4 w-4" />
            Configure
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {systems.map((system) => {
          const Icon = system.icon;
          const currentStatus = systemStatuses[system.name] || system.status;
          
          return (
            <div 
              key={system.name}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {system.name}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${getStatusColor(currentStatus)}`}>
                      {currentStatus === 'checking' ? 'Checking...' : currentStatus}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {system.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {system.features.slice(0, 3).map((feature, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {system.features.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{system.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={() => handleSystemAccess(system)}
                  disabled={currentStatus === 'offline'}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="h-4 w-4" />
                  Access
                </button>
              </div>
            </div>
          );
        })}

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-3">
            Quick Actions
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="flex items-center gap-2 justify-start px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => {
                const userUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:3002';
                window.open(`${userUrl}/users`, '_blank');
              }}
            >
              <Users className="h-4 w-4" />
              Manage Users
            </button>
            
            <button 
              className="flex items-center gap-2 justify-start px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => {
                const userUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:3002';
                window.open(`${userUrl}/roles`, '_blank');
              }}
            >
              <Shield className="h-4 w-4" />
              Role Management
            </button>
            
            <button 
              className="flex items-center gap-2 justify-start px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => {
                const userUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:3002';
                window.open(`${userUrl}/audit`, '_blank');
              }}
            >
              <Activity className="h-4 w-4" />
              Audit Logs
            </button>
            
            <button 
              className="flex items-center gap-2 justify-start px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => {
                const userUrl = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:3002';
                window.open(`${userUrl}/settings`, '_blank');
              }}
            >
              <SettingsIcon className="h-4 w-4" />
              User Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
