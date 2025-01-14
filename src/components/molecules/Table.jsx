import Button from "../atoms/Button"

const Table = ({ data, headers, onEdit = () => { }, onDelete = () => { } }) => {
  // Función para convertir un string a camelCase
  const toCamelCase = (str) => {
    // Si el encabezado es "DNI", lo tratamos de manera especial
    if (str === "DNI") {
      return "dni";
    }

    return str
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, '');
  };

  return (
    <table className="w-full max-w-full table-auto">
      <thead className="hidden xl:table-header-group">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="text-start px-3 py-2">{header}</th>
          ))}
          <th className="text-start px-3 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id || item.dni} className="block xl:table-row border-b xl:border-b-0 last:border-b-0 xl:border-t pb-2 xl:pb-0 mt-3 xl:mt-0">
            {headers.map((header, index) => (
              <td key={index} className={`px-3 py-2 block xl:table-cell ${header.toLowerCase() === 'id' ? 'hidden' : ''}`}>
                <span className="font-semibold table-cell xl:hidden">{header}: </span>
                {item[toCamelCase(header)]}
              </td>
            ))}
            <td className="px-3 py-2 block xl:table-cell">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onEdit(item.id || item.dni)} className="w-full sm:max-w-28 bg-secondary-light/95 dark:bg-secondary-dark/75 hover:bg-secondary-dark dark:hover:bg-secondary-dark">Editar</Button>
                <Button onClick={() => onDelete(item.id || item.dni)} className="w-full sm:max-w-28 bg-danger-light/95 dark:bg-danger-dark/75 hover:bg-danger-dark dark:hover:bg-danger-dark">Eliminar</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table