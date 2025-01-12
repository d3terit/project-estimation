import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Activity } from '../../../shared/types/activityTypes';
import { CATEGORIES, CATEGORY_COLORS } from '../../../core/constants';
import DetailModal from './components/DetailModal';

const GridTimelinePage = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedComplexity, setSelectedComplexity] = useState<number>(0);
    const [techCategories, setTechCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [selectedTechCategory, setSelectedTechCategory] = useState<number>(0);

    React.useEffect(() => {
        const loadActivities = async () => {
            let url = "/data/activities.csv";
            if (import.meta.env.MODE === 'production') {
                url = `${import.meta.env.BASE_URL}/data/activities.csv`;
            }
            const response = await fetch(url).then(res => res.text());
            const lines = response.split('\n').slice(1);
            const uniqueCategories: string[] = []
            const parsed = lines.map((line: string) => {
                const [name, description, frequency, detail, system, version, category, requirements, complexity, techCategory] = line.split(';');
                const [mainCat] = category.split('-');
                const techs = requirements.split(',').map(t => t.trim());
                const nComplexity = parseInt(complexity);
                if (!uniqueCategories.includes(techCategory.trim())) {
                    uniqueCategories.push(techCategory.trim());
                }
                const indexCategory = uniqueCategories.indexOf(techCategory.trim());
                return {
                    id: crypto.randomUUID(),
                    name,
                    description,
                    frequency,
                    detalle: detail,
                    system,
                    version,
                    category,
                    mainCategory: mainCat,
                    requirements: techs,
                    technologies: techs,
                    complexity: nComplexity,
                    techCategory: indexCategory,
                    backgroundColor: CATEGORY_COLORS[indexCategory],
                    textComplexity: nComplexity === 1 ? 'Baja' : nComplexity === 2 ? 'Media' : 'Alta',
                    spanMultipleVersions: frequency.toLowerCase().includes('continuo') ||
                        frequency.toLowerCase().includes('24/7')
                } as Activity;
            });
            setActivities(parsed);
            setTechCategories(uniqueCategories);
        };
        loadActivities();
    }, []);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesComplexity = selectedComplexity === 0 ||
                activity.complexity === selectedComplexity;
            const matchesCategory = selectedCategory === 0 ||
                activity.techCategory === selectedCategory;
            const matchTechCategory = selectedTechCategory === 0 ||
                activity.techCategory === selectedTechCategory;
            return matchesSearch && matchTechCategory && matchesComplexity && matchesCategory;
        });
    }, [activities, searchTerm, selectedTechCategory, selectedComplexity, selectedCategory]);

    const organizedActivities = useMemo(() => {
        const organized: any = {};
        ['1', '2', '3', '4'].forEach(version => {
            organized[version] = {};
            Object.keys(CATEGORIES.operational).forEach(category => {
                organized[version][category] = [];
            });
        });

        filteredActivities.forEach(activity => {
            const serviceCategory = Object.entries(CATEGORIES.operational).find(([_, prefixes]) =>
                prefixes.some(prefix => activity.category.startsWith(prefix))
            )?.[0];

            if (serviceCategory && organized[activity.version]) {
                organized[activity.version][serviceCategory].push(activity);
            }
        });

        return organized;
    }, [filteredActivities]);

    return (
        <div className="p-2 lg:p-6 max-w-full bg-gray-50 min-h-screen">
            {/* Header y Filtros - Responsive */}
            <div className="mb-4 lg:mb-8 space-y-4">
                <h1 className="text-xl lg:text-2xl font-bold text-center mb-4 lg:mb-6">
                    Mapa de Actividades | Extra - Recepcionista
                </h1>

                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    {/* Buscador */}
                    <div className="relative flex-grow max-w-full lg:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar actividades..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Botón de filtros */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 w-full lg:w-auto"
                    >
                        <Filter className="h-5 w-5" />
                        <span>Filtros</span>
                        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>

                {/* Panel de filtros expandible - Responsive */}
                {showFilters && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow-sm">
                        {/* Filtros de tecnología */}
                        <div className="space-y-2">
                            <h3 className="font-medium mb-2">Tecnologías</h3>
                            <select
                                value={selectedTechCategory}
                                onChange={(e) => setSelectedTechCategory(parseInt(e.target.value))}
                                className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={0}>Todas las tecnologías</option>
                                {techCategories.map((value, index) => (
                                    <option key={index} value={index+1}>{value}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtros adicionales */}
                        <div className="space-y-2">
                            <h3 className="font-medium mb-2">Complejidad</h3>
                            <select
                                value={selectedComplexity}
                                onChange={(e) => setSelectedComplexity(parseInt(e.target.value))}
                                className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={0}>Todas las complejidades</option>
                                <option value={1}>Baja</option>
                                <option value={2}>Media</option>
                                <option value={3}>Alta</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium mb-2">Categoría</h3>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
                                className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todas las categorías</option>
                                {Object.entries(CATEGORIES.operational).map(([key, prefixes]) => (
                                    <option key={key} value={prefixes[0]}>{key}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Leyenda de colores - Responsive scroll */}
                <div className="overflow-x-auto">
                    <div className="flex flex-nowrap gap-3 p-4 bg-white rounded-lg shadow-sm min-w-max">
                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                            Categorías tecnológicas:
                        </span>
                        {techCategories.map((value, index) => (
                            <span
                                key={index}
                                className={`${CATEGORY_COLORS[index]} px-3 py-1 rounded-full text-sm whitespace-nowrap`}
                            >
                                {value}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Estadísticas - Grid responsive */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <h3 className="text-xs lg:text-sm font-medium text-gray-500">Total Actividades</h3>
                        <p className="text-xl lg:text-2xl font-bold">{filteredActivities.length}</p>
                    </div>
                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <h3 className="text-xs lg:text-sm font-medium text-gray-500">Complejidad Alta</h3>
                        <p className="text-xl lg:text-2xl font-bold text-red-600">
                            {filteredActivities.filter(a => a.complexity === 3).length}
                        </p>
                    </div>
                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <h3 className="text-xs lg:text-sm font-medium text-gray-500">Tecnologías Únicas</h3>
                        <p className="text-xl lg:text-2xl font-bold text-blue-600">
                            {new Set(filteredActivities.flatMap(a => a.technologies)).size}
                        </p>
                    </div>
                    <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                        <h3 className="text-xs lg:text-sm font-medium text-gray-500">Versión más reciente</h3>
                        <p className="text-xl lg:text-2xl font-bold text-green-600">
                            {Math.max(...filteredActivities.map(a => parseInt(a.version)))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid por versión - Responsive */}
            <div className="space-y-8 lg:space-y-12">
                {['1', '2', '3', '4'].map(version => {
                    const hasActivities = Object.values(organizedActivities[version]).some((arr:any) => arr.length > 0);
                    if (!hasActivities) return null;

                    return (
                        <div key={version} className="relative">
                            <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 border-b pb-2">
                                Versión {version}
                            </h2>
                            
                            {/* Grid responsive con scroll horizontal en móvil */}
                            <div className="overflow-x-auto">
                                <div className="grid grid-cols-5 gap-2 lg:gap-4 min-w-max lg:min-w-0">
                                    {Object.entries(CATEGORIES.operational).map(([category, _]) => (
                                        <div key={category} className="w-64 lg:w-auto space-y-4 border-r pr-2 lg:pr-4 last:border-r-0 last:pr-0">
                                            <h3 className="text-xs lg:text-sm font-medium text-gray-600 text-center">
                                                {category}
                                            </h3>
                                            <div className="space-y-2 lg:space-y-4">
                                                {organizedActivities[version][category].map((activity:Activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className={`${activity.backgroundColor}
                                                            p-3 lg:p-4 rounded-lg cursor-pointer
                                                            transition-all duration-200 hover:scale-105
                                                            ${activity.spanMultipleVersions ? 'row-span-2' : ''}`}
                                                        onClick={() => setSelectedActivity(activity)}
                                                    >
                                                        <div className="flex flex-col h-full">
                                                            <h4 className="text-sm lg:text-base font-medium mb-2">
                                                                {activity.name}
                                                            </h4>
                                                            <p className="text-xs lg:text-sm text-gray-600 mb-3 line-clamp-2">
                                                                {activity.description}
                                                            </p>
                                                            
                                                            <div className="mt-auto">
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    {activity.technologies.slice(0, 2).map((tech, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50 rounded-full"
                                                                        >
                                                                            {tech}
                                                                        </span>
                                                                    ))}
                                                                    {activity.technologies.length > 2 && (
                                                                        <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                                                                            +{activity.technologies.length - 2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                                                                        {activity.category}
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-1
                                                                    ${activity.complexity === 3 ? 'bg-red-300' :
                                                                        activity.complexity === 2 ? 'bg-yellow-300' :
                                                                        'bg-green-300'}`}
                                                                >
                                                                    {activity.textComplexity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
            <DetailModal
                selectedActivity={selectedActivity}
                setSelectedActivity={setSelectedActivity}
            />
        </div>
    );
};

export default GridTimelinePage; 