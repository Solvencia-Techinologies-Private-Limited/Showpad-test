/**
 * Tracks which fit set cards are selected. Cards are identified by
 * `${sectionIndex}:${contactIndex}` so the same power/cyl/axis combination
 * appearing in different sections is tracked independently. Visual
 * selection only - no cart/quantity logic.
 */
export class FitSetSelectionStore {
    private readonly selected = new Set<string>();
    private readonly listeners: Array<() => void> = [];

    toggle(cardKey: string): void {
        if (this.selected.has(cardKey)) {
            this.selected.delete(cardKey);
        } else {
            this.selected.add(cardKey);
        }
        this.listeners.forEach((listener) => listener());
    }

    isSelected(cardKey: string): boolean {
        return this.selected.has(cardKey);
    }

    countInSection(sectionIndex: number): number {
        const prefix = `${sectionIndex}:`;
        let count = 0;
        for (const key of this.selected) {
            if (key.startsWith(prefix)) count += 1;
        }
        return count;
    }

    get totalCount(): number {
        return this.selected.size;
    }

    onChange(listener: () => void): void {
        this.listeners.push(listener);
    }
}
