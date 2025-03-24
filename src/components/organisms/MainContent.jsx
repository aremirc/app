import Card from "../molecules/Card";
import axios from "axios";
import { useEffect, useState } from "react";
import DashboardGrid from "../templates/DashboardGrid";
import Icon from "../atoms/Icon";
import Table from "../molecules/Table";
import Chart from "./Chart";
import LoadingSpinner from "../atoms/LoadingSpinner";

// Datos estáticos de ejemplo
const orders = {
  headers: ["ID", "Cliente", "Empleado", "Servicio", "Finalización"],
  data: [
    { id: 1, cliente: "KayPacha", empleado: "Luis", servicio: "Instalación de cámaras de seguridad", finalización: "60%" },
    { id: 2, cliente: "La Cascada", empleado: "Luis", servicio: "Instalación de cámaras de seguridad", finalización: "60%" },
    { id: 3, cliente: "Plaza4", empleado: "Luis", servicio: "Instalación de cámaras de seguridad", finalización: "60%" },
    { id: 4, cliente: "Poder Judicial", empleado: "Luis", servicio: "Instalación de cámaras de seguridad", finalización: "60%" },
    { id: 5, cliente: "Librería Ruíz", empleado: "Luis", servicio: "Instalación de cámaras de seguridad", finalización: "60%" },
    { id: 6, cliente: "Colegio GuterGrass", empleado: "Luis", servicio: "Instalación de cámaras de seguridad", finalización: "60%" },
  ]
};

const pendingOrders = [
  { id: 1, name: "Hospital Regional", date: "22 DEC 7:20 PM", icon: ":D" },
  { id: 2, name: "Terralpa", date: "21 DEC 9:28 PM", icon: ":D" },
  { id: 3, name: "El Fogón", date: "19 DEC 11:35 AM", icon: ":D" },
];

const chartData = [
  { month: 'Enero', sales: 1000 },
  { month: 'Febrero', sales: 1200 },
  { month: 'Marzo', sales: 1500 },
  { month: 'Abril', sales: 1800 },
];

const MainContent = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga para las métricas

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("/api/metrics");
        if (response?.data?.data) {
          setMetrics(response.data.data); // Asignamos los datos de métricas al estado
        } else {
          console.error("Error: No se encontraron métricas.");
        }
      } catch (error) {
        console.error("Error al cargar métricas:", error);
      } finally {
        setLoading(false); // Indicamos que la carga ha terminado
      }
    };

    fetchMetrics(); // Llamamos a la función para obtener los datos
  }, []);

  return (
    <>
      <DashboardGrid>
        {loading ? (
          <LoadingSpinner />
        ) : (
          metrics.length > 0 ? (
            metrics.map((item) => (
              <Card key={item.dni} title={`${item.firstName} ${item.lastName}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Visitas Totales</h4>
                    <p className="text-primary dark:text-primary-dark font-semibold">{item.totalVisits}</p>
                  </div>
                  {/* Si hay algún icono, lo mostramos */}
                  {item.icon && <Icon name={item.icon} size={28} active />}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <h4 className="font-medium">Tiempo Total</h4>
                    <p className="text-primary dark:text-primary-dark font-semibold">{item.totalTime}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p>No se encontraron métricas para mostrar.</p>
          )
        )}
      </DashboardGrid>

      <DashboardGrid>
        <Card title="Servicios">
          <div className="flex flex-wrap md:flex-nowrap justify-between gap-3 md:gap-8">
            <div>
              <p className="pt-3">Ve los servicios disponibles y realiza modificaciones en ellos si fuera necesario.</p>
            </div>
            <div className="w-full">
              <img className="object-cover rounded-md" src="https://images.pexels.com/photos/96612/pexels-photo-96612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Servicios" />
            </div>
          </div>
        </Card>

        {/* <Chart data={chartData} /> */}
        <Card>
          <img className="w-full h-56 object-cover rounded-md" src="https://images.pexels.com/photos/11139140/pexels-photo-11139140.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="Imagen de ejemplo" />
        </Card>
      </DashboardGrid>

      <DashboardGrid>
        <Card title="Órdenes">
          <Table data={orders.data} headers={orders.headers} />
        </Card>

        <Card title="Órdenes pendientes">
          {pendingOrders.map((item) => (
            <div key={item.id} className="flex gap-5 p-3">
              <div>{item.icon}</div>
              <div className="flex flex-col gap-2">
                <h5 className="font-semibold">{item.name}</h5>
                <p className="text-xs">{item.date}</p>
              </div>
            </div>
          ))}
        </Card>
      </DashboardGrid>
    </>
  );
};

export default MainContent;
