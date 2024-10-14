export const customFetch = (queryKey: string) => {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const modifiedInit = {
      ...init,
      headers: {
        ...init?.headers,
        "X-Query-Key": queryKey,
      },
    };

    const originalFetch = window.fetch;
    return new Promise<Response>((resolve) => {
      originalFetch(input, modifiedInit).then((response) => {
        const modifiedResponse = Object.create(response, {
          url: { value: queryKey, enumerable: true },
        });
        resolve(modifiedResponse);
      });
    });
  };
};
