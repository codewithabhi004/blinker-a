// MOCKED — in-memory fallback for AI Studio container environment
console.warn('[AI Studio] Database not connected — using mock');
const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d) => d?.data ?? {},
  update: async (d) => d?.data ?? {},
  upsert: async (d) => d?.create ?? d?.update ?? {},
  delete: async () => ({})
};

export const prisma = new Proxy({}, {
  get: () => new Proxy(noOp, {
    get: (target, prop) => target[prop] || (async () => ({}))
  })
});

