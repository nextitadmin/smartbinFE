// components/BinDisposalLineChart.jsx

import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
);

const BinDisposalLineChart = ({ data }) => {
    const chartData = {
        labels: ['', ...data.map(item => item.month), ''],
        datasets: [
            {
                label: 'Bin Disposals',
                data: [0, ...data.map(item => item.wasteCount), 0],
                fill: false,
                borderColor: '#ff8e1e',
                pointBackgroundColor: '#ff8e1e',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#333',
                    font: { size: 12 },
                },
            },
        },
        scales: {
            x: {
                ticks: { color: '#555' },
                grid: { display: false },

            },
            y: {
                min: 0,
                max: 50,
                ticks: {
                    stepSize: 10, color: '#555'
                },
                grid: { color: '#fff' },
                beginAtZero: true
            },
        },
    };

    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold text-zinc-700 mb-4">Bin Disposals Over Time</h2>
            <div className="relative w-full h-64 sm:h-72 lg:h-80">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default BinDisposalLineChart;