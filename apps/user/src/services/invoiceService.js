import api from './api'

export const getDocuments = async (params = {}) => {
  const response = await api.get('/invoices', {
    params: {
      page: params.page || 1,
      limit: params.limit || 20,

      search: params.search || '',
      documentType: params.documentType || '',
      status: params.status || '',

      fromDate: params.fromDate || '',
      toDate: params.toDate || '',

      sortBy: params.sortBy || 'created_at',
      sortOrder: params.sortOrder || 'DESC',
    },
  })

  return response.data
}

export const getInvoiceStats = async () => {
  const response = await api.get('/invoices/stats')

  return response.data
}

export const getDocumentById = async (id) => {
  const response = await api.get(`/invoices/${id}`)

  return response.data
}

export const createDocument = async (payload) => {
  const response = await api.post('/invoices', payload)

  return response.data
}

export const updateDocument = async (id, payload) => {
  const response = await api.put(`/invoices/${id}`, payload)

  return response.data
}

export const deleteDocument = async (id) => {
  const response = await api.delete(`/invoices/${id}`)

  return response.data
}

export const getPatientByUHID = async (uhid) => {
  const response = await api.get('/patients/by-uhid', {
    params: { uhid },
  })

  return response.data
}