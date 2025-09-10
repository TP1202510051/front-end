import { Link } from 'react-router';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="text-xl text-slate-700 mt-4">Página no encontrada</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600">
        Volver al Inicio
      </Link>
    </div>
  );
}

export default NotFound;