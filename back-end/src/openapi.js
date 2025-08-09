const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'HackOps API',
    description: 'OpenAPI documentation for HackOps backend routes.',
    version: '1.0.0',
  },
  servers: [
    { url: 'http://localhost:{port}', variables: { port: { default: '5000' } } },
  ],
  tags: [
    { name: 'System' },
    { name: 'Outreach' },
    { name: 'Team Management' },
    { name: 'Speaker & Jury' },
    { name: 'Growth' },
    { name: 'Track Creation' },
    { name: 'Live Support' },
    { name: 'Partnerships' },
    { name: 'Tracking' },
    { name: 'Todos & Agenda' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } } },
        },
      },
    },
    '/outreach/health': {
      get: { tags: ['Outreach'], summary: 'Outreach service health', responses: { '200': { description: 'OK' } } },
    },
    '/outreach/campaigns': {
      post: {
        tags: ['Outreach'],
        summary: 'Create outreach campaign',
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { type: 'object', additionalProperties: true }, example: { name: 'Recruit Devs', audience: 'Global' } } },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/team-management/health': { get: { tags: ['Team Management'], summary: 'Team Management health', responses: { '200': { description: 'OK' } } } },
    '/team-management/teams': { post: { tags: ['Team Management'], summary: 'Create team', responses: { '201': { description: 'Created' } } } },
    '/speaker-jury-management/health': { get: { tags: ['Speaker & Jury'], summary: 'Speaker & Jury health', responses: { '200': { description: 'OK' } } } },
    '/speaker-jury-management/speakers': { post: { tags: ['Speaker & Jury'], summary: 'Add speaker', responses: { '201': { description: 'Created' } } } },
    '/speaker-jury-management/jury': { post: { tags: ['Speaker & Jury'], summary: 'Add jury', responses: { '201': { description: 'Created' } } } },
    '/growth/health': { get: { tags: ['Growth'], summary: 'Growth health', responses: { '200': { description: 'OK' } } } },
    '/growth/announcements': { post: { tags: ['Growth'], summary: 'Create announcement', responses: { '201': { description: 'Created' } } } },
    '/track-creation/health': { get: { tags: ['Track Creation'], summary: 'Track Creation health', responses: { '200': { description: 'OK' } } } },
    '/track-creation/tracks': { post: { tags: ['Track Creation'], summary: 'Create track', responses: { '201': { description: 'Created' } } } },
    '/live-support/health': { get: { tags: ['Live Support'], summary: 'Live Support health', responses: { '200': { description: 'OK' } } } },
    '/live-support/tickets': { post: { tags: ['Live Support'], summary: 'Create support ticket', responses: { '201': { description: 'Created' } } } },
    '/partnerships/health': { get: { tags: ['Partnerships'], summary: 'Partnerships health', responses: { '200': { description: 'OK' } } } },
    '/partnerships/sponsors': { post: { tags: ['Partnerships'], summary: 'Add sponsor', responses: { '201': { description: 'Created' } } } },
    '/tracking/health': { get: { tags: ['Tracking'], summary: 'Tracking health', responses: { '200': { description: 'OK' } } } },
    '/tracking/metrics': { post: { tags: ['Tracking'], summary: 'Create metric', responses: { '201': { description: 'Created' } } } },
    '/todos-agenda/health': { get: { tags: ['Todos & Agenda'], summary: 'Todos health', responses: { '200': { description: 'OK' } } } },
    '/todos-agenda/todos': { post: { tags: ['Todos & Agenda'], summary: 'Add todo', responses: { '201': { description: 'Created' } } } },
  },
};

export default openapiSpec;
