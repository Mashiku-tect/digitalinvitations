import Layout from '../layout/Layout';

const Home = () => {
  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your invitations today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Invitations', value: '124', change: '+12%', color: 'blue' },
          { title: 'Active Events', value: '8', change: '+2', color: 'green' },
          { title: 'Guests', value: '1,234', change: '+48', color: 'purple' },
          { title: 'Response Rate', value: '78%', change: '+5%', color: 'orange' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <span className={`text-${stat.color}-600 font-semibold`}>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invitations */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Invitations</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">W</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sarah & John Wedding</p>
                    <p className="text-sm text-gray-500">Created 2 days ago</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Create Invitation', icon: '🎨', color: 'bg-blue-500' },
              { title: 'Import Guests', icon: '📥', color: 'bg-green-500' },
              { title: 'View Analytics', icon: '📊', color: 'bg-purple-500' },
              { title: 'Settings', icon: '⚙️', color: 'bg-gray-500' }
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl mb-2`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;