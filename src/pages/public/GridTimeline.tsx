import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

const CATEGORIES = {
    operational: {
        'OPERACIÓN INTERNA': ['IH-Op', 'IH-Seg', 'IH-Log', 'IH-Man', 'IH-Fin'],
        'SERVICIOS EXTERNOS': ['EX-Loc', 'EX-Tur', 'EX-Trans', 'EX-Event'],
        'SERVICIOS DIGITALES': ['DIG-Res', 'DIG-Mark', 'DIG-Rep', 'DIG-Com'],
        'SERVICIOS MIXTOS': ['MIX-Op', 'MIX-Dig', 'MIX-Serv'],
        'ANÁLISIS Y PREDICCIÓN': ['AN-Comp', 'AN-Pred', 'AN-Op']
    }
};

// Colores por tipo de servicio
const COLOR_SCHEME = {
    'IH': 'bg-red-200 hover:bg-red-300',
    'EX': 'bg-blue-200 hover:bg-blue-300',
    'DIG': 'bg-green-200 hover:bg-green-300',
    'MIX': 'bg-yellow-200 hover:bg-yellow-300',
    'AN': 'bg-pink-200 hover:bg-pink-300'
};

interface Activity {
    mainCategory: keyof typeof COLOR_SCHEME;
    spanMultipleVersions: boolean;
    name: string; description: string;
    frequency: string; detalle: string;
    system: string; version: string;
    category: string; requirements: string;
}

const GridTimeline = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [versions, setVersions] = useState<number[]>([]);
    const [numVersions, setNumVersions] = useState<number | null>(null);

    // Cargar datos
    React.useEffect(() => {
        const loadActivities = async () => {
            const response = await fetch('/data/activities.csv').then(res => res.text());
            const lines = response.split('\n').filter(line => line.trim() !== '' && !line.startsWith('###'));
            const parsed = lines.map((line: any) => {
                const [name, description, frequency, detalle, system, version, category, requirements] = line.split(';');
                const [mainCat] = category.split('-');
                return {
                    name,
                    description,
                    frequency,
                    detalle,
                    system,
                    version,
                    category,
                    mainCategory: mainCat,
                    requirements,
                    spanMultipleVersions: frequency.toLowerCase().includes('continuo') ||
                        frequency.toLowerCase().includes('24/7')
                };
            });
            setActivities(parsed);
            const versions = new Set<number>();
            parsed.forEach(activity => {
                versions.add(activity.version);
            });
            setVersions(Array.from(versions));
            setNumVersions(versions.size);
        };
        loadActivities();
    }, []);

    // Organizar actividades por versión y categoría
    const organizedActivities = useMemo(() => {
        if (activities.length === 0) return {};
        const filtered = activities.filter(activity =>
            activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const mainCategories = Object.keys(CATEGORIES.operational);

        const grid: any = {};
        versions.forEach(version => {
            grid[version] = {};
            mainCategories.forEach(category => {
                grid[version][category] = [];
            });
        });

        filtered.forEach(activity => {
            const category = (Object.keys(CATEGORIES.operational) as Array<keyof typeof CATEGORIES.operational>).find(cat =>
                CATEGORIES.operational[cat].some((prefix: string) => activity.category.startsWith(prefix))
            );

            if (category && grid[activity.version]) {
                grid[activity.version][category].push(activity);
            }
        });

        return grid;
    }, [activities, searchTerm, versions]);

    const mainCategories = Object.keys(CATEGORIES.operational);

    return (
        <div className="p-6 max-w-full bg-gray-50 min-h-screen">
            {/* Header y búsqueda */}
            <div className="mb-8 space-y-4">
                <h1 className="text-2xl font-bold">Mapa de Actividades del Hotel</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar actividades..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Timeline */}
            <div className="relative">
                {/* Cabeceras de categorías */}
                <div className="grid grid-cols-5 gap-4 mb-4">
                    {mainCategories.map(category => (
                        <div key={category} className="text-sm font-medium text-gray-600 text-center">
                            {category}
                        </div>
                    ))}
                </div>

                <div className="relative border-t border-l">
                    {['1', '2', '3', '4'].map(version => (
                        <div key={version} className="grid grid-cols-5 gap-0">
                            {mainCategories.map(category => (
                                <div
                                    key={`${version}-${category}`}
                                    className="border-r border-b p-2 min-h-32"
                                >
                                    {activities.length && organizedActivities[version][category].map((activity: Activity) => {
                                        const spanClasses = activity.spanMultipleVersions ? 'row-span-2' : '';
                                        const colorClass = COLOR_SCHEME[activity.mainCategory] || 'bg-gray-200';

                                        return (
                                            <div
                                                key={activity.name}
                                                className={`
                          ${colorClass} 
                          p-2 rounded-lg shadow-sm cursor-pointer 
                          transition-all duration-200 hover:scale-105
                          mb-2 ${spanClasses}
                        `}
                                                onClick={() => setSelectedActivity(activity)}
                                            >
                                                <h4 className="text-sm font-medium truncate">
                                                    {activity.name}
                                                </h4>
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    {activity.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de detalles */}
            {selectedActivity && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative z-50">
                        <button
                            onClick={() => setSelectedActivity(null)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="grid gap-4">
                            <div>
                                <h2 className="text-xl font-bold">{selectedActivity.name}</h2>
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-1 rounded-full text-sm bg-blue-100">
                                        Versión {selectedActivity.version}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-sm bg-gray-100">
                                        {selectedActivity.category}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700">Descripción</h3>
                                <p className="text-gray-600">{selectedActivity.description}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700">Frecuencia</h3>
                                <p className="text-gray-600">{selectedActivity.frequency}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700">Sistema</h3>
                                <p className="text-gray-600">{selectedActivity.system}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700">Requerimientos</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedActivity.requirements.split(', ').map((req, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                                        >
                                            {req}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedActivity(null)}
                        className="fixed inset-0 w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 opacity-50 z-40"
                    />
                </div>
            )}
        </div>
    );
};

export default GridTimeline;
