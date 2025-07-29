import SystemStatusDashboard from '../components/system/SystemStatusDashboard';

export default function SystemStatusPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Status
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor the health and performance of all ERP system components.
        </p>
      </div>

      <SystemStatusDashboard />
    </div>
  );
}
