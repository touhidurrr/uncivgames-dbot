function parseTimestamps(document) {
  if (document.updatedAt) document.updatedAt = new Date(document.updatedAt);
  if (document.createdAt) document.createdAt = new Date(document.createdAt);
  return document;
}

function assignTimestamps(action, parameters) {
  const date = new Date();

  if (action === 'insertOne') {
    parameters.document = Object.assign(parameters.document, {
      createdAt: date,
      updatedAt: date,
    });
  } else if (action === 'insertMany') {
    const timestamps = { createdAt: date, updatedAt: date };
    parameters.documents = parameters.documents.map(doc => Object.assign(doc, timestamps));
  } else if (action === 'updateOne' || action === 'updateMany') {
    if (parameters.update['$set']) {
      parameters.update['$set'].updatedAt = date;
    } else {
      parameters.update['$set'] = { updatedAt: date };
    }
  } else if (action === 'replaceOne') {
    parameters.replacement.updatedAt = date;
  }
}

async function doMongoRequest(collection, action, parameters) {
  assignTimestamps(action, parameters);
  let {
    document,
    documents,
    filter,
    projection,
    sort,
    limit,
    skip,
    update,
    upsert,
    replacement,
    pipeline,
  } = parameters;

  if (typeof filter === 'string') filter = { _id: filter };

  return await fetch(`${env.DATA_API_ENDPOINT}/action/${action}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'api-key': env.DATA_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataSource: env.DATA_API_CLUSTER_NAME,
      database: 'unciv',
      collection,
      document,
      documents,
      filter,
      projection,
      sort,
      limit,
      skip,
      update,
      upsert,
      replacement,
      pipeline,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.document) data.document = parseTimestamps(data.document);
      if (data.documents) data.documents = data.documents.map(parseTimestamps);
      return data;
    });
}

export default {
  async findOne(collection, filter, projection) {
    return (await doMongoRequest(collection, 'findOne', { filter, projection })).document;
  },
  async find(collection, ...args) {
    if (!args[0].filter) {
      if (args.length === 1)
        return (await doMongoRequest(collection, 'find', { filter: args[0] })).documents;
      else if (args.length === 2)
        return (await doMongoRequest(collection, 'find', { filter: args[0], projection: args[1] }))
          .documents;
      else throw 'Invalid Arguments !';
    } else if (args.length > 1) throw 'Invalid Arguments !';
    return (await doMongoRequest(collection, 'find', args[0])).documents;
  },
  async insertOne(collection, document) {
    return (await doMongoRequest(collection, 'insertOne', { document })).insertedId;
  },
  async insertMany(collection, documents) {
    return (await doMongoRequest(collection, 'insertMany', { documents })).insertedIds;
  },
  async updateOne(collection, filter, update = undefined) {
    if (!update) return await doMongoRequest(collection, 'updateOne', filter);
    else return await doMongoRequest(collection, 'updateOne', { filter, update });
  },
  async updateMany(collection, filter, update = undefined) {
    if (!update) return await doMongoRequest(collection, 'updateMany', filter);
    else return await doMongoRequest(collection, 'updateMany', { filter, update });
  },
  async replaceOne(collection, filter, replacement = undefined) {
    if (!replacement) return await doMongoRequest(collection, 'replaceOne', filter);
    else return await doMongoRequest(collection, 'replaceOne', { filter, replacement });
  },
  async deleteOne(collection, filter) {
    return await doMongoRequest(collection, 'deleteOne', { filter });
  },
  async deleteMany(collection, filter) {
    return await doMongoRequest(collection, 'deleteMany', { filter });
  },
  async aggregate(collection, pipeline) {
    return await doMongoRequest(collection, 'aggregate', { pipeline });
  },
};
