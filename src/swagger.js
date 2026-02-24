const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Support Ticket Management API',
        version: '1.0.0',
        description: 'API for managing support tickets with roles and permissions'
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
                summary: 'Login user',
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
                    200: { description: 'Success' }
                }
            }
        },
        '/users': {
            get: {
                tags: ['Users'],
                summary: 'Get all users (Manager only)',
                responses: { 200: { description: 'Success' } }
            },
            post: {
                tags: ['Users'],
                summary: 'Create user (Manager only)',
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
                responses: { 201: { description: 'Created' } }
            }
        },
        '/tickets': {
            get: {
                tags: ['Tickets'],
                summary: 'Get tickets (MANAGER=all, SUPPORT=assigned, USER=own)',
                responses: { 200: { description: 'Success' } }
            },
            post: {
                tags: ['Tickets'],
                summary: 'Create ticket (USER, MANAGER)',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string', minLength: 5 },
                                    description: { type: 'string', minLength: 10 },
                                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Created' } }
            }
        },
        '/tickets/{id}/assign': {
            patch: {
                tags: ['Tickets'],
                summary: 'Assign ticket (MANAGER, SUPPORT)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    assigned_to: { type: 'string', description: 'User ID' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Success' } }
            }
        },
        '/tickets/{id}/status': {
            patch: {
                tags: ['Tickets'],
                summary: 'Update ticket status (MANAGER, SUPPORT assigned)',
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
                responses: { 200: { description: 'Success' } }
            }
        },
        '/tickets/{id}': {
            delete: {
                tags: ['Tickets'],
                summary: 'Delete ticket (MANAGER only)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Success' } }
            }
        },
        '/tickets/{id}/comments': {
            get: {
                tags: ['Comments'],
                summary: 'List comments for a ticket (Authorized roles)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Success' } }
            },
            post: {
                tags: ['Comments'],
                summary: 'Add comment to ticket (Authorized roles)',
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
                responses: { 201: { description: 'Created' } }
            }
        },
        '/comments/{id}': {
            patch: {
                tags: ['Comments'],
                summary: 'Edit comment (author or MANAGER)',
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
                responses: { 200: { description: 'Success' } }
            },
            delete: {
                tags: ['Comments'],
                summary: 'Delete comment (author or MANAGER)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Success' } }
            }
        }
    }
};

module.exports = { swaggerUi, swaggerDocument };
