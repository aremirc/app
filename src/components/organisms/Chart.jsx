import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const Chart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Ventas',
        data: data.map(item => item.sales),
        borderColor: '#4B89F1',
        backgroundColor: 'rgba(75, 137, 241, 0.2)',
        fill: true,
      },
    ],
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-semibold">Ventas por Mes</h3>
      <Line data={chartData} />
    </div>
  )
}

export default Chart