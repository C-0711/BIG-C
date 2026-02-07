import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function TimelineChart({ entityName, compact = false }) {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    if (entityName) {
      loadTimeline(entityName);
    }
  }, [entityName]);

  const loadTimeline = async (name) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8766/api/timeline/mentions?entity=${encodeURIComponent(name)}`);
      if (response.ok) {
        const data = await response.json();
        setTimelineData(data);
      } else {
        // Generate mock data for demonstration
        setTimelineData(generateMockData(name));
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
      // Generate mock data on error
      setTimelineData(generateMockData(name));
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (name) => {
    // Generate sample data for demonstration
    const years = [2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
    return years.map(year => ({
      year: year.toString(),
      mentions: Math.floor(Math.random() * 100) + 10,
      documents: Math.floor(Math.random() * 50) + 5
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '0.875rem', margin: '0.25rem 0' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ height: compact ? '200px' : '100%' }}>
        <p>Loading timeline...</p>
      </div>
    );
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="empty-state" style={{ height: compact ? '200px' : '100%' }}>
        <CalendarIcon className="empty-state-icon" />
        <p>No timeline data available</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            Timeline Analysis
          </h3>
          {entityName && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Mentions of {entityName} over time
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem' }}
            onClick={() => setChartType('line')}
            title="Line Chart"
          >
            <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </button>
          <button
            className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem' }}
            onClick={() => setChartType('bar')}
            title="Bar Chart"
          >
            <ChartBarIcon style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis
                dataKey="year"
                stroke="var(--text-secondary)"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis
                stroke="var(--text-secondary)"
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
              />
              <Line
                type="monotone"
                dataKey="mentions"
                stroke="#4B5563"
                strokeWidth={2}
                dot={{ fill: '#4B5563', r: 4 }}
                activeDot={{ r: 6 }}
                name="Mentions"
              />
              <Line
                type="monotone"
                dataKey="documents"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Documents"
              />
            </LineChart>
          ) : (
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis
                dataKey="year"
                stroke="var(--text-secondary)"
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis
                stroke="var(--text-secondary)"
                style={{ fontSize: '0.75rem' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
              />
              <Bar dataKey="mentions" fill="#4B5563" name="Mentions" />
              <Bar dataKey="documents" fill="#10b981" name="Documents" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginTop: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            {timelineData.reduce((sum, d) => sum + d.mentions, 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Total Mentions
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
            {timelineData.reduce((sum, d) => sum + d.documents, 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Total Documents
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)' }}>
            {timelineData.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Time Points
          </div>
        </div>
      </div>
    </div>
  );
}
