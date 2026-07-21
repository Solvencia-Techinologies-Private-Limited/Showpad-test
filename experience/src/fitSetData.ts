import fitSetsRaw from '../FitSets-US.json';
import type { FitSetCollection, FitSetProduct, FitSetsFile } from './fitSetTypes.ts';

const FIT_SETS_FILE = fitSetsRaw as unknown as FitSetsFile;

export interface ResolvedFitSet {
    collection: FitSetCollection;
    techName: string;
}

/**
 * Searches every product in FitSets-US.json for a FitSets entry with the
 * given name. Swapping which collection a page shows is then just a
 * matter of passing a different `collectionName` - no other code changes.
 */
export const findFitSetCollection = (collectionName: string): ResolvedFitSet | undefined => {
    for (const value of Object.values(FIT_SETS_FILE)) {
        if (typeof value === 'number') continue;
        const product = value as FitSetProduct;
        const collection = product.FitSets?.[collectionName];
        if (collection) {
            return { collection, techName: product.TechName ?? '' };
        }
    }
    return undefined;
};
