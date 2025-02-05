import { Router } from 'express';

/**
 * API Documentation
 * 
 * Base URL: /api
 * 
 * Authentication:
 * All endpoints except /auth/login require a Bearer token in the Authorization header
 * 
 * Error Responses:
 * {
 *   message: string    // Error description
 * }
 */

export const apiDocs = {
  auth: {
    login: {
      path: '/api/auth/login',
      method: 'POST',
      description: 'Authenticate user and get access token',
      body: {
        email: 'string',
        password: 'string'
      },
      responses: {
        200: {
          token: 'string',
          user: {
            id: 'number',
            name: 'string',
            lastname: 'string',
            email: 'string',
            role: 'string'
          }
        },
        401: 'Invalid credentials'
      }
    }
  },
  requisitions: {
    list: {
      path: '/api/requisitions',
      method: 'GET',
      description: 'Get list of requisitions',
      query: {
        page: 'number',
        limit: 'number',
        status: 'string?',
        startDate: 'string?',
        endDate: 'string?'
      },
      responses: {
        200: {
          requisitions: 'Requisition[]',
          pagination: {
            total: 'number',
            page: 'number',
            limit: 'number',
            pages: 'number'
          }
        }
      }
    },
    create: {
      path: '/api/requisitions',
      method: 'POST',
      description: 'Create new requisition',
      body: {
        provider_id: 'number',
        program_model_id: 'number',
        execution_date: 'string',
        community_id: 'number',
        detail: 'string',
        items: {
          quantity: 'number',
          description: 'string'
        }[]
      },
      responses: {
        201: 'Requisition',
        400: 'Validation error'
      }
    }
  },
  payments: {
    list: {
      path: '/api/payment-requests',
      method: 'GET',
      description: 'Get list of payment requests',
      query: {
        page: 'number',
        limit: 'number',
        status: 'string?'
      },
      responses: {
        200: {
          payments: 'PaymentRequest[]',
          pagination: {
            total: 'number',
            page: 'number',
            limit: 'number',
            pages: 'number'
          }
        }
      }
    }
  },
  records: {
    list: {
      path: '/api/records',
      method: 'GET',
      description: 'Get list of records',
      query: {
        page: 'number',
        limit: 'number',
        type: 'string?'
      },
      responses: {
        200: {
          records: 'Record[]',
          pagination: {
            total: 'number',
            page: 'number',
            limit: 'number',
            pages: 'number'
          }
        }
      }
    }
  }
};