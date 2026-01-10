# User Tickets Ratio Chart Component

## Overview
This chart component displays the ratio between users and tickets sold over time. It's built using Chart.js and designed with a dark theme to match the application's aesthetic.

## Features
- **Dark Theme**: Matches the application's dark color scheme
- **Two Data Lines**: 
  - Users (Yellow line)
  - Tickets sold (Green line)
- **Interactive**: Hover tooltips with detailed information
- **Responsive**: Adapts to container size
- **Dashed Grid Lines**: Horizontal dashed lines for better readability
- **Right-aligned Y-axis**: Numbers formatted with commas
- **Bottom Legend**: Clear color-coded legend

## Current Implementation
The chart currently uses mock data for demonstration purposes. The data structure is:

```javascript
const mockData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Users',
      data: [2500, 3200, 8500, 4200, 6800, 7200, 1800, 2200, 8200, 9100, 7800, 6500],
      // ... styling properties
    },
    {
      label: 'Tickets sold',
      data: [2800, 3500, 9200, 4500, 7200, 7800, 2100, 2500, 8800, 9800, 8500, 7200],
      // ... styling properties
    }
  ]
};
```

## Usage

### Basic Usage
```jsx
import UserTicketsRatioChart from '../components/UserTicketsRatioChart';

function MyPage() {
  return (
    <div className="w-full h-96">
      <UserTicketsRatioChart />
    </div>
  );
}
```

### Integration in Admin Overview
The chart is already integrated into the admin overview page at `src/components/admin/UserTicketsSoldGraph.jsx`.

## Future API Integration

To replace mock data with real API data, you'll need to:

1. **Create API endpoints** that return data in the expected format:
```javascript
// Expected API response format
{
  labels: ['Jan', 'Feb', 'Mar', ...], // Month labels
  users: [2500, 3200, 8500, ...],     // User counts per month
  ticketsSold: [2800, 3500, 9200, ...] // Tickets sold per month
}
```

2. **Update the component** to fetch and use real data:
```javascript
const UserTicketsRatioChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/user-tickets-ratio');
        const data = await response.json();
        
        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Users',
              data: data.users,
              // ... styling properties
            },
            {
              label: 'Tickets sold',
              data: data.ticketsSold,
              // ... styling properties
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  // ... rest of component
};
```

3. **Add loading states** and error handling for better UX.

## Customization

### Colors
The chart uses these colors:
- Users line: `#FFD700` (Yellow)
- Tickets sold line: `#00FF00` (Green)
- Background: `#111827` (Dark gray)
- Text: `#FFFFFF` (White)

### Styling
The chart container uses Tailwind classes:
- `w-full h-96` for responsive sizing
- `bg-gray-900 rounded-lg p-6` for dark background with padding

### Chart Options
Key configuration options in the `options` object:
- `responsive: true` - Makes chart responsive
- `maintainAspectRatio: false` - Allows custom sizing
- `scales.y.position: 'right'` - Y-axis on the right
- `scales.y.grid.borderDash: [5, 5]` - Dashed horizontal lines

## Dependencies
- `chart.js` (already installed)
- React hooks (`useEffect`, `useRef`)

## Demo Page
Visit `/chart-demo` to see the chart in action with a full-page demo. 