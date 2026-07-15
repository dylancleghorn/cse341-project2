const fs = require('fs');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const json = (schema) => ({ 'application/json': { schema } });
const jsonExample = (schema, example) => ({ 'application/json': { schema, example } });
const activity = { $ref: '#/components/schemas/Activity' };
const error = { $ref: '#/components/schemas/Error' };
const createActivityExample = {
  title: 'Ward Summer Social',
  description: 'Dinner, lawn games, and time to visit with ward members and neighbors.',
  category: 'ward social',
  date: '2030-07-20',
  time: '18:30',
  location: 'Meetinghouse lawn',
  organizer: 'Activities Committee',
  participantLimit: 80,
  status: 'open'
};
const updateActivityExample = {
  title: 'Ward Summer Social and Potluck',
  description: 'Bring a side dish or dessert. Dinner and lawn games begin at 6:30 PM.',
  category: 'ward social',
  date: '2030-07-27',
  time: '18:30',
  location: 'Meetinghouse cultural hall',
  organizer: 'Activities Committee',
  participantLimit: 100,
  status: 'open'
};
const idParameter = { name: 'id', in: 'path', required: true, description: 'MongoDB activity id', schema: { type: 'string' } };
const authErrors = {
  401: { description: 'Authentication required', content: json(error) },
  403: { description: 'Not the activity owner or an administrator', content: json(error) }
};
const doc = {
  info: {
    title: 'Ward Activity Board API',
    version: '1.0.0',
    description: 'CRUD and participant RSVP API. Sign in at /auth/github first; the browser session cookie authenticates protected Swagger requests.'
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth', description: 'GitHub OAuth login and logout endpoints' },
    { name: 'Activities', description: 'Activity CRUD operations' },
    { name: 'Participants', description: 'Activity RSVP operations' },
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
          participantLimit: { type: 'integer', minimum: 0, example: 40, description: 'Maximum attendance; 0 means unlimited' },
          status: { type: 'string', enum: ['planned','open','full','completed','cancelled'] }
        }
      },
      Activity: { allOf: [
        { $ref: '#/components/schemas/ActivityInput' },
        { type: 'object', properties: { _id: { type: 'string' }, createdBy: { $ref: '#/components/schemas/User' }, participants: { type: 'array', items: { $ref: '#/components/schemas/User' } }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } } }
      ] },
      Error: { type: 'object', properties: { error: { type: 'string' }, details: { type: 'array', items: { type: 'object' } } } }
    }
  },
  definitions: {
    User: { $ref: '#/components/schemas/User' }, ActivityInput: { $ref: '#/components/schemas/ActivityInput' },
    Activity: { $ref: '#/components/schemas/Activity' }, Error: { $ref: '#/components/schemas/Error' }
  },
  paths: {
    '/auth/github': {
      servers: [{ url: '/' }],
      get: {
        tags: ['Auth'],
        summary: 'Start GitHub OAuth login',
        description: 'Redirects the browser to GitHub. After login, users are redirected to Swagger UI unless a protected page stored a different return path.',
        responses: {
          302: { description: 'Redirect to GitHub OAuth authorization page' },
          500: { description: 'OAuth configuration or server error', content: json(error) }
        }
      }
    },
    '/auth/github/callback': {
      servers: [{ url: '/' }],
      get: {
        tags: ['Auth'],
        summary: 'GitHub OAuth callback',
        description: 'GitHub redirects users here after authentication. This route creates the server-side login session and redirects to Swagger UI by default.',
        responses: {
          302: { description: 'Redirect to the app after successful login or failed login' },
          500: { description: 'OAuth callback or server error', content: json(error) }
        }
      }
    },
    '/auth/logout': {
      servers: [{ url: '/' }],
      post: {
        tags: ['Auth'],
        summary: 'Log out the current user',
        description: 'Destroys the Passport session, clears the session cookie, and redirects to the home page.',
        security: [{ cookieAuth: [] }],
        responses: {
          302: { description: 'Logged out and redirected to home page' },
          500: { description: 'Logout or server error', content: json(error) }
        }
      }
    },
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
        requestBody: {
          required: true,
          description: 'Complete activity data. `createdBy` and `participants` come from authenticated users and must not be submitted.',
          content: jsonExample({ $ref: '#/components/schemas/ActivityInput' }, createActivityExample)
        },
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
        requestBody: {
          required: true,
          description: 'PUT replaces all editable activity fields, so send the complete object.',
          content: jsonExample({ $ref: '#/components/schemas/ActivityInput' }, updateActivityExample)
        },
        responses: { 200: { description: 'Activity updated', content: json(activity) }, 400: { description: 'Validation failed', content: json(error) }, ...authErrors, 404: { description: 'Activity not found', content: json(error) } }
      },
      delete: {
        tags: ['Activities'], summary: 'Delete an owned activity (admin may delete any)', security: [{ cookieAuth: [] }], parameters: [idParameter],
        responses: { 204: { description: 'Activity deleted' }, 400: { description: 'Invalid id', content: json(error) }, ...authErrors, 404: { description: 'Activity not found', content: json(error) } }
      }
    },
    '/activities/{id}/participants': {
      post: {
        tags: ['Participants'], summary: 'RSVP the current user to an activity', security: [{ cookieAuth: [] }], parameters: [idParameter],
        responses: { 200: { description: 'Participant added', content: json(activity) }, 400: { description: 'Invalid id', content: json(error) }, 401: authErrors[401], 404: { description: 'Activity not found', content: json(error) }, 409: { description: 'Already attending, full, or closed', content: json(error) } }
      },
      delete: {
        tags: ['Participants'], summary: 'Cancel the current user RSVP', security: [{ cookieAuth: [] }], parameters: [idParameter],
        responses: { 200: { description: 'Participant removed', content: json(activity) }, 400: { description: 'Invalid id', content: json(error) }, 401: authErrors[401], 404: { description: 'Activity or RSVP not found', content: json(error) } }
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
