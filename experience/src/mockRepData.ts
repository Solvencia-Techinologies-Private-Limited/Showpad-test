export interface RepInfo {
    salesRepName: string;
    salesRepEmail: string;
    orderProcessingEmail: string;
    country: string;
}

export const MOCK_COUNTRIES: string[] = [
    'Australia',
    'Canada',
    'Denmark',
    'Finland',
    'France',
    'Germany',
    'Ireland',
    'Italy',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Spain',
    'Sweden',
    'Switzerland',
    'United Kingdom',
    'United States',
];

const mockRepInfo: RepInfo = {
    salesRepName: '',
    salesRepEmail: '',
    orderProcessingEmail: '',
    country: MOCK_COUNTRIES[0],
};

export const getMockRepInfo = (): RepInfo => ({ ...mockRepInfo });
