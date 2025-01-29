const randomOrgFetch = (method: string, params: object) =>
  fetch('https://api.random.org/json-rpc/4/invoke', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params: {
        apiKey: env.RANDOM_ORG_TOKEN,
        ...params,
      },
      id: Date.now(),
    }),
  }).then(res => res.json());

export const choose = async <T>(arr: T[]): Promise<T> => {
  if (arr.length === 1) return arr[0];
  return arr[
    await randomOrgFetch('generateIntegers', {
      n: 1,
      min: 0,
      max: arr.length - 1,
      replacement: true,
      base: 10,
      pregeneratedRandomization: null,
      // @ts-ignore
    }).then(json => json.result.random.data[0])
  ];
};

export const scramble = async <T>(arr: T[]): Promise<T[]> => {
  if (arr.length === 1) return arr;
  const randomIndexes = await randomOrgFetch('generateIntegers', {
    n: arr.length,
    min: 0,
    max: arr.length - 1,
    replacement: false,
    base: 10,
    pregeneratedRandomization: null,
    // @ts-ignore
  }).then(json => json.result.random.data);

  const scrambledArr = [];
  for (let i = 0, l = arr.length; i < l; ++i) {
    scrambledArr[i] = arr[randomIndexes[i]];
  }
  return scrambledArr;
};
