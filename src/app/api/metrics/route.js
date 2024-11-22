import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data.json'); // Ruta donde se guardará el JSON

export async function GET() {

  const Metrics = [
    {
      id: 1,
      name: 'Clientes',
      quantity: 105,
      icon: 'client'
    },
    {
      id: 2,
      name: 'Órdenes',
      quantity: 300,
      icon: 'order'
    },
    {
      id: 3,
      name: 'Conformidad',
      quantity: 245,
      icon: 'visit'
    },
    {
      id: 4,
      name: 'Empleados',
      quantity: 10,
      icon: 'user'
    },
  ]

  // import { NextResponse } from "next/server"
  // return NextResponse.json(data)

  return new Response(JSON.stringify({ data: Metrics }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

// export async function POST(req) {
//   const newData = await req.json(); // Leer datos del cuerpo de la solicitud

//   // Leer el archivo existente
//   try {
//     const data = fs.readFileSync(filePath, 'utf8');
//     let jsonData = [];
//     if (data) {
//       jsonData = JSON.parse(data); // Convertir el JSON existente en un objeto
//     }

//     // Agregar los nuevos datos
//     jsonData.push(newData);

//     // Guardar los datos en el archivo
//     fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

//     return new Response(JSON.stringify({ message: 'Datos guardados exitosamente.' }), { status: 201 });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: 'Error al procesar la solicitud.' }), { status: 500 });
//   }
// }