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
        backgroundColor: '#4B89F1',
        borderRadius: 4,
      },
    ],
  }

  const options = {
    indexAxis: 'y', // 👉 barras horizontales
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${dataName} por ${labelName}`,
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        }
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default BarChart
