export interface Product {
    id: string;
    name: string;
    imageUrl: string;
}

export type View = 'welcome' | 'products' | 'contact-picker' | 'first-fit';

export type NavigateFn = (view: View, product?: Product) => void;
