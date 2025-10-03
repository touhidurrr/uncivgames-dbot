export class JsonResponse extends Response {
  constructor(body: unknown, init?: ResponseInit) {
    const json = JSON.stringify(body);
    init = {
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
      ...init,
    };
    super(json, init);
  }
}
