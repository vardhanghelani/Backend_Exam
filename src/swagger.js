const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Tkt API',
        version: '1.0',
        description: 'simple ticket api'
    },
    servers: [
        {
            url: 'http://localhost:3000'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ],
    paths: {
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'login user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'log ok' }
                }
            }
        },
        '/users': {
            get: {
                tags: ['Users'],
                summary: 'get all users',
                responses: { 200: { description: 'list users' } }
            },
            post: {
                tags: ['Users'],
                summary: 'add new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    password: { type: 'string' },
                                    roleName: { type: 'string', enum: ['MANAGER', 'SUPPORT', 'USER'] }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'user added' } }
            }
        },
        '/tickets': {
            get: {
                tags: ['Tickets'],
                summary: 'list tkts',
                responses: { 200: { description: 'all ok' } }
            },
            post: {
                tags: ['Tickets'],
                summary: 'mk new tkt',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'tkt made' } }
            }
        },
        '/tickets/{id}/assign': {
            patch: {
                tags: ['Tickets'],
                summary: 'assign tkt',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    assigned_to: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'assigned' } }
            }
        },
        '/tickets/{id}/status': {
            patch: {
                tags: ['Tickets'],
                summary: 'upd status',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'status ok' } }
            }
        },
        '/tickets/{id}': {
            delete: {
                tags: ['Tickets'],
                summary: 'kill tkt',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'gone' } }
            }
        },
        '/tickets/{id}/comments': {
            get: {
                tags: ['Comments'],
                summary: 'get tkt comms',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'comms list' } }
            },
            post: {
                tags: ['Comments'],
                summary: 'add comm',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    comment: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'comm added' } }
            }
        },
        '/comments/{id}': {
            patch: {
                tags: ['Comments'],
                summary: 'edit comm',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    comment: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'updated' } }
            },
            delete: {
                tags: ['Comments'],
                summary: 'kill comm',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'gone' } }
            }
        }
    }
};

module.exports = { swaggerUi, swaggerDocument };
