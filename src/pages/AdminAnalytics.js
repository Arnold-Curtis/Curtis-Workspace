import React, { useState, useEffect, useCallback } from 'react'; import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../stylings/AdminAnalytics.css';
import {
    getAnalyticsDashboard,
    getAnalyticsUsers,
    getAnalyticsConversions
} from '../utils/apiService';

/**
 * AdminAnalytics - Enhanced Analytics Dashboard
 * Beautiful charts, real-time data, comprehensive metrics
 */
const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [users, setUsers] = useState([]);
    const [conversions, setConversions] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('overview');

    // Chart colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    // Load analytics data
    const loadAnalyticsData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [dashboardRes, usersRes, conversionsRes] = await Promise.all([
                getAnalyticsDashboard(),
                getAnalyticsUsers(),
                getAnalyticsConversions()
            ]);

            if (dashboardRes.success) {
                setDashboard(dashboardRes.data);
            }

            if (usersRes.success) {
                setUsers(usersRes.data || []);
            }

            if (conversionsRes.success) {
                setConversions(conversionsRes.data);
            }
        } catch (err) {
            setError('Failed to load analytics data');
            console.error('Analytics load error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnalyticsData();

        // Auto-refresh every 60 seconds
        const interval = setInterval(loadAnalyticsData, 60000);
        return () => clearInterval(interval);
    }, [loadAnalyticsData]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Engagement score color
    const getEngagementColor = (score) => {
        if (score >= 70) return '#3fa33c';
        if (score >= 40) return '#daa520';
        return '#f85149';
    };

    // Prepare conversion funnel data for chart
    const getFunnelData = () => {
        if (!conversions) return [];

        const total = conversions.visitors || 1;
        return [
            { name: 'Visitors', value: conversions.visitors || 0, percentage: 100 },
            { name: 'Guestbook', value: conversions.guestbook_30d || 0, percentage: ((conversions.guestbook_30d / total) * 100).toFixed(1) },
            { name: 'Contacts', value: conversions.contacts_30d || 0, percentage: ((conversions.contacts_30d / total) * 100).toFixed(1) },
            { name: 'Bookings', value: conversions.bookings_30d || 0, percentage: ((conversions.bookings_30d / total) * 100).toFixed(1) },
            { name: 'Resumes', value: conversions.resume_requests_30d || 0, percentage: ((conversions.resume_requests_30d / total) * 100).toFixed(1) }
        ];
    };

    // Prepare conversions pie chart data
    const getConversionsPieData = () => {
        if (!dashboard) return [];

        return [
            { name: 'Guestbook', value: dashboard.total_guestbook || 0 },
            { name: 'Contacts', value: dashboard.total_contacts || 0 },
            { name: 'Bookings', value: dashboard.total_bookings || 0 },
            { name: 'Resumes', value: dashboard.total_resume_requests || 0 }
        ].filter(item => item.value > 0);
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <i className="fas fa-chart-line fa-spin"></i>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-error">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
                <button onClick={loadAnalyticsData} className="retry-button">
                    <i className="fas fa-redo"></i> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            {/* Header with Refresh */}
            <div className="analytics-header">
                <h2><i className="fas fa-chart-bar"></i> Analytics Dashboard</h2>
                <button onClick={loadAnalyticsData} className="refresh-button" title="Refresh data">
                    <i className="fas fa-sync-alt"></i> Refresh
                </button>
            </div>

            {/* Sub-tabs */}
            <div className="analytics-subtabs">
                <button
                    className={`subtab ${activeSubTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('overview')}
                >
                    <i className="fas fa-chart-pie"></i> Overview
                </button>
                <button
                    className={`subtab ${activeSubTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('users')}
                >
                    <i className="fas fa-users"></i> Users
                </button>
                <button
                    className={`subtab ${activeSubTab === 'conversions' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('conversions')}
                >
                    <i className="fas fa-funnel-dollar"></i> Conversions
                </button>
            </div>

            {/* Overview Tab */}
            {activeSubTab === 'overview' && dashboard && (
                <div className="analytics-overview">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon users">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboard.total_users || 0}</span>
                                <span className="stat-label">Total Users</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon sessions">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboard.total_sessions || 0}</span>
                                <span className="stat-label">Total Sessions</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon active">
                                <i className="fas fa-bolt"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboard.active_users_7d || 0}</span>
                                <span className="stat-label">Active (7 days)</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon engagement">
                                <i className="fas fa-fire"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboard.avg_engagement || 0}%</span>
                                <span className="stat-label">Avg Engagement</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="charts-row">
                        {/* Conversions Pie Chart */}
                        <div className="chart-card">
                            <h3><i className="fas fa-chart-pie"></i> Conversions Breakdown</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={getConversionsPieData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {getConversionsPieData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Funnel Visualization */}
                        <div className="chart-card">
                            <h3><i className="fas fa-filter"></i> Conversion Funnel (30d)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={getFunnelData()} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#0088FE" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Last Sync Info */}
                    <div className="sync-info">
                        <i className="fas fa-sync-alt"></i>
                        <span>Last synced: {formatDate(dashboard.last_sync)}</span>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeSubTab === 'users' && (
                <div className="analytics-users">
                    {users.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-user-slash"></i>
                            <p>No tracked users yet</p>
                            <small>Users will appear after they interact with forms</small>
                        </div>
                    ) : (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Engagement</th>
                                        <th>Sessions</th>
                                        <th>Last Activity</th>
                                        <th>Replay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="user-name">
                                                <div className="user-avatar">
                                                    {(user.name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                {user.name || 'Anonymous'}
                                            </td>
                                            <td className="user-email">
                                                {user.email ? (
                                                    <a href={`mailto:${user.email}`}>{user.email}</a>
                                                ) : (
                                                    <span className="no-email">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <div
                                                    className="engagement-badge"
                                                    style={{ backgroundColor: getEngagementColor(user.engagement_score || 0) }}
                                                >
                                                    {user.engagement_score || 0}
                                                </div>
                                            </td>
                                            <td>{user.session_count || 0}</td>
                                            <td className="last-activity">
                                                {formatDate(user.last_activity || user.last_seen)}
                                            </td>
                                            <td>
                                                {user.last_session_replay_url ? (
                                                    <a
                                                        href={user.last_session_replay_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="replay-link"
                                                    >
                                                        <i className="fas fa-play-circle"></i> Watch
                                                    </a>
                                                ) : (
                                                    <span className="no-replay">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Conversions Tab */}
            {activeSubTab === 'conversions' && conversions && (
                <div className="analytics-conversions">
                    <h3><i className="fas fa-funnel-dollar"></i> Conversion Details (Last 30 Days)</h3>

                    {/* Conversion Stats Cards */}
                    <div className="conversion-stats-grid">
                        <div className="conversion-stat-card">
                            <i className="fas fa-users icon"></i>
                            <div className="stat-info">
                                <span className="stat-number">{conversions.visitors || 0}</span>
                                <span className="stat-name">Total Visitors</span>
                            </div>
                        </div>
                        <div className="conversion-stat-card">
                            <i className="fas fa-book icon"></i>
                            <div className="stat-info">
                                <span className="stat-number">{conversions.guestbook_30d || 0}</span>
                                <span className="stat-name">Guestbook Entries</span>
                                <span className="stat-rate">{conversions.visitors ? ((conversions.guestbook_30d / conversions.visitors) * 100).toFixed(1) : 0}% conversion</span>
                            </div>
                        </div>
                        <div className="conversion-stat-card">
                            <i className="fas fa-envelope icon"></i>
                            <div className="stat-info">
                                <span className="stat-number">{conversions.contacts_30d || 0}</span>
                                <span className="stat-name">Contact Forms</span>
                                <span className="stat-rate">{conversions.visitors ? ((conversions.contacts_30d / conversions.visitors) * 100).toFixed(1) : 0}% conversion</span>
                            </div>
                        </div>
                        <div className="conversion-stat-card">
                            <i className="fas fa-calendar icon"></i>
                            <div className="stat-info">
                                <span className="stat-number">{conversions.bookings_30d || 0}</span>
                                <span className="stat-name">Meeting Bookings</span>
                                <span className="stat-rate">{conversions.visitors ? ((conversions.bookings_30d / conversions.visitors) * 100).toFixed(1) : 0}% conversion</span>
                            </div>
                        </div>
                        <div className="conversion-stat-card">
                            <i className="fas fa-file-alt icon"></i>
                            <div className="stat-info">
                                <span className="stat-number">{conversions.resume_requests_30d || 0}</span>
                                <span className="stat-name">Resume Requests</span>
                                <span className="stat-rate">{conversions.visitors ? ((conversions.resume_requests_30d / conversions.visitors) * 100).toFixed(1) : 0}% conversion</span>
                            </div>
                        </div>
                    </div>

                    {/* Funnel Visualization */}
                    <div className="funnel-chart-container">
                        <h4>Conversion Funnel</h4>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={getFunnelData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#ccc" />
                                <YAxis stroke="#ccc" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #444' }}
                                    formatter={(value, name) => [value, name === 'value' ? 'Count' : name]}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
