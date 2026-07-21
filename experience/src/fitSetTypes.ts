// Shapes mirror the raw FitSets-US.json structure directly (the on-disk
// schema shared by every collection in the file), so any collection can be
// rendered by the same generic renderer without per-collection code.

export interface FitSetContact {
    Power?: string;
    Cyl?: string;
    Axis?: string;
    [key: string]: string | undefined;
}

export interface FitSetCollection {
    NumberOfItemsPerRow: number;
    SectionHeaders: string[];
    RowGaps?: Record<string, number>[];
    ColumnGaps?: Record<string, number>[];
    ColumnGapTexts?: Record<string, Record<string, string>>[];
    ColumnRowTexts?: Record<string, Record<string, string>>[];
    FullRowTexts?: Record<string, string>[];
    SharedParameters?: Record<string, string>;
    Contacts: FitSetContact[][];
}

export interface FitSetProduct {
    TechName?: string;
    FitSets: Record<string, FitSetCollection>;
}

export type FitSetsFile = Record<string, FitSetProduct | number>;
