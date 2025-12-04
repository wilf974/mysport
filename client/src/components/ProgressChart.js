import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ProgressChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function ProgressChart({ data, exerciseName }) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;

        return {
            labels: data.map(d => new Date(d.date).toLocaleDateString()),
            datasets: [
                {
                    label: 'Poids (kg)',
                    data: data.map(d => d.weight),
                    borderColor: '#4f46e5', // Primary color
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                // On pourrait ajouter le volume ici si on veut
            ],
        };
    }, [data]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: `Progression : ${exerciseName}`,
                color: '#0f172a',
                font: {
                    size: 16,
                    weight: '600',
                    family: "'Inter', sans-serif",
                },
                padding: {
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: {
                    family: "'Inter', sans-serif",
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: '#e2e8f0',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        family: "'Inter', sans-serif",
                    },
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        family: "'Inter', sans-serif",
                    },
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    if (!chartData) {
        return (
            <div className="chart-empty-state">
                <p>Pas assez de données pour afficher le graphique.</p>
                <small>Complétez au moins une séance avec cet exercice.</small>
            </div>
        );
    }

    return (
        <div className="progress-chart-container">
            <Line options={options} data={chartData} />
        </div>
    );
}

export default ProgressChart;
