export class JsonResponse extends Response {
  constructor(body: any, init?: ResponseInit) {
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
