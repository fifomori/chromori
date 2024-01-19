interface AchievementData {
    name: string;
    description: string;
    img: string;
}

interface Chromori {
    fetch: (
        method: string,
        path: string,
        callback: (status: number, res?: any) => void,
        options?: {
            type?: XMLHttpRequestResponseType;
            data?: any;
            json?: boolean;
        }
    ) => void;

    fetchSync: (
        method: string,
        path: string,
        options?: {
            mime?: string;
            data?: XMLHttpRequestBodyInit;
            json?: boolean;
        }
    ) => { status: number; res?: any };

    decoder: TextDecoder;
    encoder: TextEncoder;
    url: string;

    createAchievementElement: (name: string, description: string, icon: string, id: string) => HTMLDivElement;
}

interface Window {
    chromori: Chromori;
}

declare const chromori: Chromori;
