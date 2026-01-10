'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
 
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  
);

const UserTicketsRatioChart = () => {
  // Mock data for the chart
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Users',
        data: [2500, 3200, 8500, 4200, 6800, 7200, 1800, 2200, 8200, 9100, 7800, 6500],
        borderColor: '#FFD700', // Yellow color
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFD700',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Tickets sold',
        data: [2800, 3500, 9200, 4500, 7200, 7800, 2100, 2500, 8800, 9800, 8500, 7200],
        borderColor: '#00FF00', // Green color
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#00FF00',
        pointBorderColor: '#00FF00',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#FFFFFF',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'User to tickets sold ratio',
        color: '#FFFFFF',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#333333',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
       
      },
    },
    scales: {
      x: {
        position: 'bottom',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            size: 12,
          },
        },
        border: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
          borderDash: [5, 5], // Dashed horizontal lines
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            size: 12,
          },
          callback: function(value) {
            return value.toLocaleString();
          },
        },
        border: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        beginAtZero: true,
        max: 10000,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div className="w-full h-85 rounded-lg p-6 " style={{background: "linear-gradient(124deg, #73C5FF -70.49%, #000 40.66%)",
   strokeWidth: "1px",
   stroke: "#000"}}>
      <Line data={data} options={options} />
    </div>
  );
};

export default UserTicketsRatioChart; 