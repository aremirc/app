import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const BarChart = ({ data = [], labelName = "Técnico", dataName = "Visitas" }) => {
  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: dataName,
        data: data.map((item) => item.value),
        backgroundColor: '#4fd1c5', // Puedes cambiar por un array para múltiples colores
        borderRadius: 6,
        barThickness: 20,
        maxBarThickness: 25,
      },
    ],
  }

  const textColor = '#2d3748'        // Gris oscuro: buen contraste
  const gridColor = '#e2e8f0'        // Gris claro para líneas sutiles

  const options = {
    indexAxis: 'y', // Horizontal bar
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        display: false,
        labels: { color: textColor },
      },
      title: {
        display: true,
        text: `${dataName} por ${labelName}`,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: textColor,
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        backgroundColor: '#1a202c',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e0',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          precision: 0,
          stepSize: 1,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  }

  return (
    <div className="bg-background-light dark:bg-background-dark/95 text-text-light dark:text-text-dark rounded-lg shadow-md h-[260px]">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default BarChart
