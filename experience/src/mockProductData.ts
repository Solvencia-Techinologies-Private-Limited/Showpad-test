import clariti from '../clariti.png';
import avairaVitalityToric from '../Avaira Vitality toric@2x.jpg';
import biofinitySphere from '../Biofinity_sphere.jpg';
import type { Product } from './types.ts';

export const MOCK_PRODUCTS: Product[] = [
    { id: 'clariti', name: 'Clariti', imageUrl: clariti },
    { id: 'avaira-vitality-toric', name: 'Avaira Vitality Toric', imageUrl: avairaVitalityToric },
    { id: 'biofinity-sphere', name: 'Biofinity Sphere', imageUrl: biofinitySphere },
];
