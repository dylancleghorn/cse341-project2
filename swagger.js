const fs = require('fs');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const host = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const json = (schema) => ({ 'application/json': { schema } });
const activity = { $ref: '#/components/schemas/Activity' };
const error = { $ref: '#/components/schemas/Error' };
const idParameter = { name: 'id', in: 'path', required: true, description: 'MongoDB activity id', schema: { type: 'string' } };
const authErrors = {
  401: { description: 'Authentication required', content: json(error) },
  403: { description: 'Not the activity owner or an administrator', content: json(error) }
};
const doc = {
  info: {
    title: 'Ward Activity Board API',
    version: '1.0.0',
    description: 'CRUD and volunteer API. Sign in at /auth/github first; the browser session cookie authenticates protected Swagger requests.'
  },
  servers: [{ url: `${host}/api` }],
  tags: [
    { name: 'Activities', description: 'Activity CRUD operations' },
    { name: 'Volunteers', description: 'Volunteer signup operations' },
    { name: 'Users', description: 'Authenticated user operations' }
  ],
  components: {
    securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'ward.sid' } },
    schemas: {
      User: {
        type: 'object', properties: {
          _id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string', format: 'email' },
          oauthProvider: { type: 'string', example: 'github' }, oauthId: { type: 'string' }, role: { type: 'string', enum: ['user', 'admin'] }
        }
      },
      ActivityInput: {
        type: 'object', required: ['title','description','category','date','time','location','organizer','status'],
        properties: {
          title: { type: 'string', example: 'Neighborhood cleanup' },
          description: { type: 'string', example: 'Clean the park and nearby walking trail.' },
          category: { type: 'string', enum: ['service project','youth','relief society','elders quorum','ward social','devotional','temple trip','community','other'] },
          date: { type: 'string', format: 'date' }, time: { type: 'string', example: '09:00' },
          location: { type: 'string', example: 'Riverside Park' }, organizer: { type: 'string', example: 'Service Committee' },
          volunteersNeeded: { type: 'integer', minimum: 0, example: 12 },
          status: { type: 'string', enum: ['planned','open','full','completed','cancelled'] }
        }
      },
      Activity: { allOf: [
        { $ref: '#/components/schemas/ActivityInput' },
        { type: 'object', properties: { _id: { type: 'string' }, createdBy: { $ref: '#/components/schemas/User' }, volunteers: { type: 'array', items: { $ref: '#/components/schemas/User' } }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } } }
      ] },
      Error: { type: 'object', properties: { error: { type: 'string' }, details: { type: 'array', items: { type: 'object' } } } }
    }
  },
  definitions: {
    User: { $ref: '#/components/schemas/User' }, ActivityInput: { $ref: '#/components/schemas/ActivityInput' },
    Activity: { $ref: '#/components/schemas/Activity' }, Error: { $ref: '#/components/schemas/Error' }
  },
  paths: {
    '/activities/': {
      get: {
        tags: ['Activities'], summary: 'List all activities',
        parameters: [
          { name: 'category', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'status', in: 'query', required: false, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Activities sorted by date and time', content: json({ type: 'array', items: activity }) },
          400: { description: 'Invalid filter', content: json(error) }
        }
      },
      post: {
        tags: ['Activities'], summary: 'Create an activity', security: [{ cookieAuth: [] }],
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/ActivityInput' }) },
        responses: {
          201: { description: 'Activity created', content: json(activity) },
          400: { description: 'Validation failed', content: json(error) },
          401: authErrors[401]
        }
      }
    },
    '/activities/{id}': {
      get: {
        tags: ['Activities'], summary: 'Get one activity', parameters: [idParameter],
        responses: { 200: { description: 'Activity found', content: json(activity) }, 400: { description: 'Invalid id', content: json(error) }, 404: { description: 'Activity not found', content: json(error) } }
      },
      put: {
        tags: ['Activities'], summary: 'Update an owned activity (admin may update any)', security: [{ cookieAuth: [] }], parameters: [idParameter],
        requestBody: { required: true, content: json({ $ref: '#/components/schemas/ActivityInput' }) },
        responses: { 200: { description: 'Activity updated', content: json(activity) }, 400: { description: 'Validation failed', content: json(error) }, ...authErrors, 404: { description: 'Activity not found', content: json(error) } }
      },
      delete: {
        tags: ['Activities'], summary: 'Delete an owned activity (admin may delete any)', security: [{ cookieAuth: [] }], parameters: [idParameter],
        responses: { 204: { description: 'Activity deleted' }, 400: { description: 'Invalid id', content: json(error) }, ...authErrors, 404: { description: 'Activity not found', content: json(error) } }
      }
    },
    '/activities/{id}/volunteer': {
      post: {
        tags: ['Volunteers'], summary: 'Volunteer for an activity', security: [{ cookieAuth: [] }], parameters: [idParameter],
        responses: { 200: { description: 'Volunteer added', content: json(activity) }, 400: { description: 'Invalid id', content: json(error) }, 401: authErrors[401], 404: { description: 'Activity not found', content: json(error) }, 409: { description: 'Already signed up, full, or closed', content: json(error) } }
      },
      delete: {
        tags: ['Volunteers'], summary: 'Remove the current user volunteer signup', security: [{ cookieAuth: [] }], parameters: [idParameter],
        responses: { 200: { description: 'Volunteer removed', content: json(activity) }, 400: { description: 'Invalid id', content: json(error) }, 401: authErrors[401], 404: { description: 'Activity or signup not found', content: json(error) } }
      }
    },
    '/users/me': {
      get: {
        tags: ['Users'], summary: 'Return the authenticated user', security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Current user', content: json({ $ref: '#/components/schemas/User' }) }, 401: authErrors[401] }
      }
    }
  }
};

swaggerAutogen('./swagger-output.json', ['./src/routes/api/index.js'], doc)
  .then(() => {
    // swagger-autogen discovers the mounted endpoints; keep the explicit OpenAPI 3
    // operation contracts so Swagger UI shows bodies, security, and response schemas.
    const generated = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf8'));
    generated.paths = doc.paths;
    fs.writeFileSync('./swagger-output.json', `${JSON.stringify(generated, null, 2)}\n`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
