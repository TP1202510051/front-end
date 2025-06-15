import DashboardCard from '@/components/ui/dashboard-card';

const proyectos = [
  {
    id: '1',
    title: 'Campaña de Verano',
    lastEdited: 'Editado hace 2 horas',
    imageUrl: 'https://i.imgur.com/SBpn2o8.png',
  },
  {
    id: '2',
    title: 'Chisca',
    lastEdited: 'Editado hace 2 horas',
    imageUrl: 'https://i.imgur.com/SBpn2o8.png',
  },
  {
    id: '3',
    title: 'Otoño',
    lastEdited: 'Editado hace 12 dias',
    imageUrl: 'https://i.imgur.com/SBpn2o8.png',
  },
  {
    id: '4',
    title: 'Invierno',
    lastEdited: 'Editado hace 12 dias',
    imageUrl: 'https://i.imgur.com/SBpn2o8.png',
  },
];

const Dashboard = () => {
  return (
    <div className="w-full p-8 px-24 min-h-screen bg-[var(--dashboard-background)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {proyectos.map((proyecto) => (
            <DashboardCard
              key={proyecto.id}
              id={proyecto.id}
              title={proyecto.title}
              lastEdited={proyecto.lastEdited}
              imageUrl={proyecto.imageUrl}
            />
          ))}
        </div>
    </div>
  );
};

export default Dashboard;
