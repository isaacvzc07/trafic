import type { Meta, StoryObj } from '@storybook/react';
import TrafficChartVisx from './TrafficChartVisx';

const meta = {
  title: 'Components/TrafficChartVisx',
  component: TrafficChartVisx,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'TrafficChartVisx displays hourly traffic statistics using Visx for better performance. Shows trends for different vehicle types over time.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'Array of hourly statistics to display',
      control: 'object',
    },
  },
} satisfies Meta<typeof TrafficChartVisx>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample data for stories
const generateSampleData = (hours: number = 24) => {
  const data = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      period: hour.toISOString().split('T')[0],
      hour: hour.toISOString(),
      camera_id: 'homero_oe',
      vehicle_type: 'car' as const,
      direction: 'in' as const,
      count: Math.floor(Math.random() * 50) + 10,
      avg_confidence: 0.8 + Math.random() * 0.2,
    });
    
    data.push({
      period: hour.toISOString().split('T')[0],
      hour: hour.toISOString(),
      camera_id: 'homero_oe',
      vehicle_type: 'car' as const,
      direction: 'out' as const,
      count: Math.floor(Math.random() * 50) + 10,
      avg_confidence: 0.8 + Math.random() * 0.2,
    });
    
    data.push({
      period: hour.toISOString().split('T')[0],
      hour: hour.toISOString(),
      camera_id: 'homero_oe',
      vehicle_type: 'bus' as const,
      direction: 'in' as const,
      count: Math.floor(Math.random() * 10) + 2,
      avg_confidence: 0.8 + Math.random() * 0.2,
    });
  }
  
  return data;
};

// Default story with 24 hours of data
export const Default: Story = {
  args: {
    data: generateSampleData(24),
  },
};

// Loading state
export const Loading: Story = {
  args: {
    data: undefined,
  },
  parameters: {
    storyshots: { disable: true },
  },
};

// Empty data
export const Empty: Story = {
  args: {
    data: [],
  },
};

// High traffic scenario
export const HighTraffic: Story = {
  args: {
    data: generateSampleData(24).map(item => ({
      ...item,
      count: item.count * 3, // Triple the traffic
    })),
  },
};

// 7 days of data
export const SevenDays: Story = {
  args: {
    data: generateSampleData(24 * 7),
  },
};
