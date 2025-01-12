import { COLOR_SCHEME } from "../../core/constants";

export interface Activity {
    id: string;
    mainCategory: keyof typeof COLOR_SCHEME;
    spanMultipleVersions: boolean;
    name: string;
    description: string;
    frequency: string;
    detalle: string;
    system: string;
    version: string;
    category: string;
    requirements: string[];
    complexity: number;
    textComplexity: 'Baja' | 'Media' | 'Alta';
    technologies: string[];
    status?: 'active' | 'deprecated' | 'planned';
    backgroundColor: string;
    techCategory: number;
}