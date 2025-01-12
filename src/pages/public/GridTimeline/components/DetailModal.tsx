import { Activity } from "../../../../shared/types/activityTypes";
import { X, AlertCircle, Clock, Database, Cpu } from 'lucide-react';

const DetailModal = ({ 
    selectedActivity, 
    setSelectedActivity 
}: { 
    selectedActivity: Activity | null, 
    setSelectedActivity: (activity: Activity | null) => void 
}) => {
    if (!selectedActivity) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative z-50">
                <button
                    onClick={() => setSelectedActivity(null)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="grid gap-6">
                    {/* Header */}
                    <div>
                        <h2 className="text-xl font-bold">{selectedActivity.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                Versión {selectedActivity.version}
                            </span>
                            <span className="px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                                {selectedActivity.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-sm ${
                                selectedActivity.complexity === 3 ? 'bg-red-100 text-red-800' :
                                selectedActivity.complexity === 2 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                Complejidad {selectedActivity.textComplexity}
                            </span>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Descripción
                        </h3>
                        <p className="text-gray-600 mt-1">{selectedActivity.description}</p>
                    </div>

                    {/* Frecuencia */}
                    <div>
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Frecuencia
                        </h3>
                        <p className="text-gray-600 mt-1">{selectedActivity.frequency}</p>
                    </div>

                    {/* Sistemas */}
                    <div>
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Sistemas
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedActivity.system.split(',').map((sys, index) => (
                                <span 
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                >
                                    {sys.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tecnologías */}
                    <div>
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Cpu className="h-5 w-5" />
                            Tecnologías
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedActivity.technologies.map((tech, index) => (
                                <span 
                                    key={index}
                                    className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-sm first-letter:capitalize"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setSelectedActivity(null)}
                className="fixed inset-0 bg-black opacity-50 z-40 w-full h-full cursor-pointer"
            ></button>
        </div>
    );
};

export default DetailModal;