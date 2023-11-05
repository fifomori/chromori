interface Chromori {
  fetch: (
    method: string,
    path: string,
    callback: (res: any) => void,
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
  ) => any;

  decoder: TextDecoder;
  encoder: TextEncoder;
  url: string;
}

interface Window {
  chromori: Chromori;
}

declare const chromori: Chromori;
