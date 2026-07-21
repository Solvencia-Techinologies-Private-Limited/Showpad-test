import type { FitSetCollection, FitSetContact } from './fitSetTypes.ts';
import { FitSetSelectionStore } from './fitSetSelection.ts';

/** Row-gap units from the JSON are small integers (0-2); this scales them to pixels. */
const ROW_GAP_UNIT_PX = 10;
/** Width of the in-grid label column used for axis-angle callouts (e.g. "10°"). */
const GAP_LABEL_COLUMN_PX = 44;

export interface FitSetSectionRefs {
    itemsCountEl: HTMLElement;
}

const numericKeysAscending = (obj: Record<string, unknown> | undefined): number[] =>
    Object.keys(obj ?? {})
        .map(Number)
        .sort((a, b) => a - b);

/** Splits the 0..perRow-1 column range into contiguous groups at the given boundary indices. */
const buildColumnGroups = (perRow: number, boundaries: number[]): number[][] => {
    const points = [0, ...boundaries.filter((b) => b > 0 && b < perRow), perRow];
    const groups: number[][] = [];
    for (let i = 0; i < points.length - 1; i += 1) {
        const group: number[] = [];
        for (let col = points[i]; col < points[i + 1]; col += 1) group.push(col);
        groups.push(group);
    }
    return groups;
};

const buildGridTemplateColumns = (columnGroups: number[][]): string =>
    columnGroups.map((group) => `repeat(${group.length}, 1fr)`).join(` ${GAP_LABEL_COLUMN_PX}px `);

/** A single grid row: data cells (rendered via `cellContent`) with label columns between groups. */
const renderGridRow = (
    columnGroups: number[][],
    gridTemplateColumns: string,
    gapLabels: Record<string, string>,
    cellContent: (colIndex: number) => HTMLElement,
): HTMLElement => {
    const row = document.createElement('div');
    row.className = 'fitset-row';
    row.style.gridTemplateColumns = gridTemplateColumns;

    columnGroups.forEach((group, groupIndex) => {
        group.forEach((colIndex) => row.appendChild(cellContent(colIndex)));

        const isLastGroup = groupIndex === columnGroups.length - 1;
        if (!isLastGroup) {
            const labelCol = document.createElement('div');
            labelCol.className = 'fitset-axis-label';
            labelCol.textContent = gapLabels[String(group[group.length - 1] + 1)] ?? '';
            row.appendChild(labelCol);
        }
    });

    return row;
};

const renderHeaderRow = (
    columnGroups: number[][],
    gridTemplateColumns: string,
    headerTexts: Record<string, string>,
): HTMLElement => {
    const row = renderGridRow(columnGroups, gridTemplateColumns, {}, (colIndex) => {
        const cell = document.createElement('div');
        cell.className = 'fitset-column-header';
        cell.textContent = headerTexts[String(colIndex)]?.trim() ?? '';
        return cell;
    });
    row.classList.add('fitset-header-row');
    return row;
};

const renderFullRowBanner = (text: string): HTMLElement => {
    const banner = document.createElement('div');
    banner.className = 'fitset-full-row-banner';
    banner.style.gridColumn = '1 / -1';
    banner.textContent = text;
    return banner;
};

const renderSection = (
    sectionIndex: number,
    collection: FitSetCollection,
    techName: string,
    selection: FitSetSelectionStore,
): { element: HTMLElement; refs: FitSetSectionRefs } => {
    const perRow = collection.NumberOfItemsPerRow;
    const contacts = collection.Contacts[sectionIndex] ?? [];
    const rowGaps = collection.RowGaps?.[sectionIndex] ?? {};
    const columnGaps = collection.ColumnGaps?.[sectionIndex] ?? {};
    const columnGapTexts = collection.ColumnGapTexts?.[sectionIndex] ?? {};
    const columnRowTexts = collection.ColumnRowTexts?.[sectionIndex] ?? {};
    const fullRowTexts = collection.FullRowTexts?.[sectionIndex] ?? {};

    const boundaries = numericKeysAscending(columnGaps).filter((n) => n > 0);
    const columnGroups = buildColumnGroups(perRow, boundaries);
    const gridTemplateColumns = buildGridTemplateColumns(columnGroups);

    const section = document.createElement('section');
    section.className = 'fitset-section';

    const drawerBar = document.createElement('div');
    drawerBar.className = 'fitset-drawer-bar';

    const drawerIcon = document.createElement('span');
    drawerIcon.className = 'fitset-drawer-icon';

    const drawerLabel = document.createElement('span');
    drawerLabel.className = 'fitset-drawer-label';
    drawerLabel.textContent = collection.SectionHeaders[sectionIndex] ?? '';

    const itemsCountEl = document.createElement('span');
    itemsCountEl.className = 'fitset-drawer-count';
    itemsCountEl.textContent = 'Items: 0';

    drawerBar.append(drawerIcon, drawerLabel, itemsCountEl);
    section.appendChild(drawerBar);

    const grid = document.createElement('div');
    grid.className = 'fitset-grid';
    const topGap = rowGaps['0'];
    if (typeof topGap === 'number' && topGap > 0) grid.style.paddingTop = `${topGap * ROW_GAP_UNIT_PX}px`;

    const totalRows = Math.ceil(contacts.length / perRow);

    const firstHeaderTexts = Object.values(columnRowTexts)[0];
    if (firstHeaderTexts) {
        grid.appendChild(renderHeaderRow(columnGroups, gridTemplateColumns, firstHeaderTexts));
    }

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
        const rowItems: FitSetContact[] = contacts.slice(rowIndex * perRow, rowIndex * perRow + perRow);
        const gapLabels = columnGapTexts[String(rowIndex)] ?? {};

        const dataRow = renderGridRow(columnGroups, gridTemplateColumns, gapLabels, (colIndex) => {
            const contact = rowItems[colIndex];
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'fitset-card';
            if (!contact) {
                cell.classList.add('fitset-card--empty');
                cell.disabled = true;
                return cell;
            }

            const power = document.createElement('span');
            power.className = 'fitset-card-power';
            power.textContent = contact.Power ?? '';

            const material = document.createElement('span');
            material.className = 'fitset-card-material';
            material.textContent = techName;

            cell.append(power, material);

            const cardKey = `${sectionIndex}:${rowIndex * perRow + colIndex}`;
            if (selection.isSelected(cardKey)) cell.classList.add('fitset-card--selected');

            cell.addEventListener('click', () => selection.toggle(cardKey));
            selection.onChange(() => cell.classList.toggle('fitset-card--selected', selection.isSelected(cardKey)));

            return cell;
        });
        grid.appendChild(dataRow);

        const headerRepeatTexts = columnRowTexts[String(rowIndex)];
        if (headerRepeatTexts) {
            grid.appendChild(renderHeaderRow(columnGroups, gridTemplateColumns, headerRepeatTexts));
        }

        const fullRowText = fullRowTexts[String(rowIndex)];
        if (fullRowText) {
            grid.appendChild(renderFullRowBanner(fullRowText));
        }

        const gapAfter = rowGaps[String(rowIndex + 1)];
        if (typeof gapAfter === 'number' && gapAfter > 0) {
            const spacer = document.createElement('div');
            spacer.className = 'fitset-row-spacer';
            spacer.style.gridColumn = '1 / -1';
            spacer.style.height = `${gapAfter * ROW_GAP_UNIT_PX}px`;
            grid.appendChild(spacer);
        }
    }

    section.appendChild(grid);

    selection.onChange(() => {
        itemsCountEl.textContent = `Items: ${selection.countInSection(sectionIndex)}`;
    });

    return { element: section, refs: { itemsCountEl } };
};

export const renderFitSetGrid = (
    container: HTMLElement,
    collection: FitSetCollection,
    techName: string,
    selection: FitSetSelectionStore,
): FitSetSectionRefs[] => {
    const refs: FitSetSectionRefs[] = [];
    collection.Contacts.forEach((_, sectionIndex) => {
        const { element, refs: sectionRefs } = renderSection(sectionIndex, collection, techName, selection);
        container.appendChild(element);
        refs.push(sectionRefs);
    });
    return refs;
};
