import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const BarChart = ({ data, labelName = "Técnico", dataName = "Visitas" }) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: dataName,
        data: data.map(item => item.value),
        backgroundColor: '#4fd1c5',
        borderRadius: 4,
      },
    ],
  }

  const neutralTextColor = '#333333' // gris claro (funciona bien sobre fondos oscuros y claros)
  const neutralGridColor = '#e2e8f0' // gris oscuro sutil para las líneas del grid

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: neutralTextColor, // leyenda
        },
      },
      title: {
        display: true,
        text: `${dataName} por ${labelName}`,
        font: { size: 18 },
        color: neutralTextColor, // título
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: neutralTextColor, // texto del eje X
        },
        grid: {
          color: neutralGridColor, // líneas de fondo eje X
        },
      },
      y: {
        ticks: {
          color: neutralTextColor, // texto del eje Y
        },
        grid: {
          color: neutralGridColor, // líneas de fondo eje Y
        },
      },
    },
  }

  return (
    <div className="bg-background-light dark:bg-background-dark/95 text-text-light dark:text-text-dark rounded-lg shadow-md mt-6 min-w-full h-[250px]">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default BarChart
