import type { Meta, StoryObj } from '@storybook/react';
import LiveCounter from './LiveCounter';

const meta = {
  title: 'Components/LiveCounter',
  component: LiveCounter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'LiveCounter displays real-time traffic counts for a specific camera, including in/out counts for different vehicle types.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    camera: {
      description: 'Camera object containing traffic data',
      control: 'object',
    },
    isLoading: {
      description: 'Whether the component is in loading state',
      control: 'boolean',
    },
    error: {
      description: 'Error message to display',
      control: 'text',
    },
  },
} satisfies Meta<typeof LiveCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with sample data
export const Default: Story = {
  args: {
    camera: {
      camera_id: 'homero_oe',
      camera_name: 'Av. Homero Oeste-Este',
      counts: {
        car_in: 25,
        car_out: 18,
        bus_in: 4,
        bus_out: 3,
        truck_in: 2,
        truck_out: 1,
      },
      total_in: 31,
      total_out: 22,
      timestamp: '2025-01-06T12:00:00Z',
    },
    isLoading: false,
    error: undefined,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    camera: undefined,
    isLoading: true,
    error: undefined,
  },
};

// Error state
export const Error: Story = {
  args: {
    camera: undefined,
    isLoading: false,
    error: 'Failed to load camera data',
  },
};

// High traffic scenario
export const HighTraffic: Story = {
  args: {
    camera: {
      camera_id: 'homero_oe',
      camera_name: 'Av. Homero Oeste-Este',
      counts: {
        car_in: 150,
        car_out: 120,
        bus_in: 25,
        bus_out: 20,
        truck_in: 15,
        truck_out: 10,
      },
      total_in: 190,
      total_out: 150,
      timestamp: '2025-01-06T18:00:00Z',
    },
    isLoading: false,
    error: undefined,
  },
};

// No traffic scenario
export const NoTraffic: Story = {
  args: {
    camera: {
      camera_id: 'homero_oe',
      camera_name: 'Av. Homero Oeste-Este',
      counts: {
        car_in: 0,
        car_out: 0,
        bus_in: 0,
        bus_out: 0,
        truck_in: 0,
        truck_out: 0,
      },
      total_in: 0,
      total_out: 0,
      timestamp: '2025-01-06T03:00:00Z',
    },
    isLoading: false,
    error: undefined,
  },
};
