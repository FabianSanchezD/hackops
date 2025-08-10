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
  '/growth/create-post': {
      post: {
        tags: ['Growth'],
  summary: 'Create AI-generated social media post using GPT-image-1',
  description: 'Generate a social media post image using the GPT-image-1 model for direct image creation. The response image field is a URL you can click/open. If the API returns base64, the server persists it to /media and returns the public link.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: {
                    type: 'string',
                    description: 'Text prompt describing the content for the social media post',
                    example: 'A vibrant hackathon event with developers coding together'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Post created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Post created successfully' },
                    image: {
                      type: 'string',
                      format: 'uri',
                      description: 'Public URL to the generated image',
                      example: 'http://localhost:5000/media/post_17123456789.png'
                    },
                    originalPrompt: { 
                      type: 'string',
                      description: 'The original prompt provided by the user',
                      example: 'A vibrant hackathon event with developers coding together'
                    },
                    enhancedPrompt: {
                      type: 'string',
                      description: 'The formatted prompt used for GPT-image-1 generation',
                      example: 'Create a high-quality social media post image (1080x1080 square format) based on this prompt: A vibrant hackathon event with developers coding together. Make it visually appealing...'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request - missing prompt',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Prompt is required' },
                    message: { type: 'string', example: 'Please provide a prompt in the request body' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Internal server error' },
                    message: { type: 'string', example: 'Failed to create post. Please try again later.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/growth/create-description': {
      post: {
        tags: ['Growth'],
        summary: 'Create AI-generated description (text)',
        description: 'Generate a concise, engaging social post description from a prompt using a current GPT-4.1-class model.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', example: 'Announce a global AI hackathon in October 2025 with prizes and community impact.' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Description created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Description created successfully' },
                    description: { type: 'string', example: 'Join the Global AI Hackathon this October! Build with cutting-edge models, learn from mentors, and compete for prizes... #AI #Hackathon' }
                  }
                }
              }
            }
          },
          '400': { description: 'Bad request - missing prompt' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/growth/announcements': { post: { tags: ['Growth'], summary: 'Create announcement', responses: { '201': { description: 'Created' } } } },
    '/track-creation/health': { get: { tags: ['Track Creation'], summary: 'Track Creation health', responses: { '200': { description: 'OK' } } } },
    '/track-creation/ai-ideas': {
      post: {
        tags: ['Track Creation'],
        summary: 'Generate AI ideas for tracks and challenges',
        description: 'Use OpenAI to propose tracks and challenge ideas for a hackathon.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  theme: { type: 'string', example: 'AI for Social Good' },
                  audience: { type: 'string', example: 'students and early-career developers' },
                  durationDays: { type: 'integer', example: 2 },
                  tracksCount: { type: 'integer', example: 4 },
                  challengesPerTrack: { type: 'integer', example: 3 },
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Ideas generated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    ideas: {
                      type: 'object',
                      properties: {
                        tracks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              objective: { type: 'string' },
                              challenges: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    meta: { type: 'object' }
                  }
                }
              }
            }
          },
          '500': { description: 'Failed to generate ideas' }
        }
      }
    },
    '/track-creation/ai-ideas/refine': {
      post: {
        tags: ['Track Creation'],
        summary: 'Refine previously generated ideas',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ideas'],
                properties: {
                  ideas: {
                    type: 'object',
                    properties: {
                      tracks: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            objective: { type: 'string' },
                            challenges: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string' },
                                  description: { type: 'string' }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  instruction: { type: 'string', example: 'Make challenges more concrete and reduce overlap.' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Refined successfully' },
          '400': { description: 'ideas missing' },
          '500': { description: 'Failed to refine' }
        }
      }
    },
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
