// MongoDB service for regular email/password authentication
// This will handle login and registration while Google Sign-In uses Supabase

// Normalize API base: allow user to set with or without "/api".
// If not provided, prefer same-origin /api (for deployments), otherwise fallback to localhost.
const computeApiUrl = () => {
  const raw = (import.meta.env.VITE_MONGODB_API_URL || '').trim();
  const normalize = (u) => (/\/api\/?$/i.test(u) ? u.replace(/\/?$/, '') : u.replace(/\/?$/, '') + '/api');
  try {
    if (raw) return normalize(raw);
    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin;
      // In dev we usually want the Node server; in prod same-origin works
      if (!/localhost|127\.0\.0\.1|\:5173/.test(origin)) return normalize(origin);
    }
  } catch {}
  return 'http://localhost:3002/api';
};
const API_URL = computeApiUrl();

class MongoDBService {
  constructor() {
    this.token = localStorage.getItem('mongodb_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('mongodb_token', token);
    } else {
      localStorage.removeItem('mongodb_token');
    }
  }

  // Safely parse JSON; if server returns HTML (e.g., error page), surface a clear error
  async parseJsonSafe(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('API did not return JSON. Check API URL and server. First bytes: ' + text.slice(0, 60));
    }
    return response.json();
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password })
      });

      const data = await this.parseJsonSafe(response);
      console.log('MongoDB API response:', data);
      console.log('User object from API:', data.user);
      console.log('User role from API:', data.user?.role);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setToken(data.token);
      return { data: data.user, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to request password reset');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ token, password })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to reset password');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async register(userData) {
    try {
      console.log('MongoDB register - sending data:', userData);
      console.log('MongoDB register - API URL:', `${API_URL}/auth/register`);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      console.log('MongoDB register - response status:', response.status);
      const data = await this.parseJsonSafe(response);
      console.log('MongoDB register - response data:', data);

      if (!response.ok) {
        console.log('MongoDB register - error response:', data);
        throw new Error(data.message || 'Registration failed');
      }

      console.log('MongoDB register - success, setting token');
      this.setToken(data.token);
      return { data: data.user, error: null };
    } catch (error) {
      console.log('MongoDB register - catch error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
    }
  }

  async getUser() {
    if (!this.token) {
      console.log('getUser: No token found');
      return null;
    }

    try {
      console.log('getUser: Fetching user data with token');
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      console.log('getUser: Response status:', response.status);

      if (!response.ok) {
        console.log('getUser: Response not ok, clearing token');
        this.setToken(null);
        return null;
      }

      const data = await this.parseJsonSafe(response);
      console.log('getUser: User data received:', data.user);
      return data.user;
    } catch (error) {
      console.error('getUser: Error fetching user:', error);
      this.setToken(null);
      return null;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await this.parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      return { data: data.user, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async startSubscription(plan = 'Premium') {
    try {
      const response = await fetch(`${API_URL}/subscription/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ plan })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to start subscription');
      return { data: data.user, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Razorpay endpoints
  async createRazorpayOrder(amountInRupees, plan = 'Premium', billingCycle = 'monthly', options = {}) {
    try {
      const { notes = {}, isTestMode = false } = options || {};
      const response = await fetch(`${API_URL}/payments/razorpay/order`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amountInRupees, plan, billingCycle, isTestMode, notes })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to create order');
      return { data: data.order, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async verifyRazorpayPayment(payload) {
    try {
      const response = await fetch(`${API_URL}/payments/razorpay/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Doctors directory
  async listDoctors(query = '') {
    try {
      const params = new URLSearchParams({ search: query, status: 'approved' });
      const response = await fetch(`${API_URL}/doctors?${params.toString()}`);
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch doctors');
      const list = Array.isArray(data) ? data : (data.doctors || []);
      return { data: list, error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  // Consultation fee (doctor)
  async doctorSetConsultationFee(amountInRupees) {
    try {
      const response = await fetch(`${API_URL}/doctor/consultation-fee`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amountInRupees })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to set consultation fee');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async getDoctorConsultationFee(doctorId) {
    try {
      const response = await fetch(`${API_URL}/doctors/${doctorId}/consultation-fee`);
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch consultation fee');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async createConsultationOrder(doctorId, { appointmentId, isTestMode = false } = {}) {
    try {
      const response = await fetch(`${API_URL}/consultations/${doctorId}/pay/order`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ appointmentId, isTestMode })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to create consultation order');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async verifyConsultationPayment(payload) {
    try {
      const response = await fetch(`${API_URL}/consultations/pay/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Referrals
  async createReferral({ referredTo, patientId, reason, notes = '' }) {
    try {
      const response = await fetch(`${API_URL}/referrals`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ referredTo, patientId, reason, notes })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to create referral');
      return { data: data.referral, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async listSentReferrals() {
    try {
      const response = await fetch(`${API_URL}/doctor/referrals/sent`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch referrals');
      return { data: data.referrals || [], error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  async listReceivedReferrals() {
    try {
      const response = await fetch(`${API_URL}/doctor/referrals/received`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch referrals');
      return { data: data.referrals || [], error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  async updateReferralStatus(referralId, status) {
    try {
      const response = await fetch(`${API_URL}/referrals/${referralId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to update referral status');
      return { data: data.referral, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async getReferredPatientHistory(patientId) {
    try {
      const response = await fetch(`${API_URL}/doctor/patients/${patientId}/history`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch history');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Chat APIs
  async fetchMessages(withUserId) {
    try {
      const response = await fetch(`${API_URL}/chat/conversations/${withUserId}/messages`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch messages');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async sendMessage(toUserId, text) {
    try {
      const response = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ toUserId, text })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to send message');
      return { data: data.message, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async uploadImageDataUri(dataUri) {
    try {
      const response = await fetch(`${API_URL}/chat/upload-image`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ dataUri })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async sendMediaMessage(toUserId, mediaUrl, mediaType, text = '') {
    try {
      const response = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ toUserId, text, mediaUrl, mediaType })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to send message');
      return { data: data.message, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async getPresence(userId) {
    try {
      const response = await fetch(`${API_URL}/chat/presence/${userId}`);
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch presence');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async fetchOverviewStats() {
    try {
      const response = await fetch(`${API_URL}/stats/overview`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch stats');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Patients directory (for doctors)
  async listPatients(query = '') {
    try {
      const params = new URLSearchParams({ search: query });
      const response = await fetch(`${API_URL}/doctor/patients?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch patients');
      const list = Array.isArray(data) ? data : (data.patients || []);
      return { data: list, error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  // Appointments
  async listAppointments() {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch appointments');
      return { data: data.appointments || [], error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  async createAppointment(payload) {
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to create appointment');
      return { data: data.appointment, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async createAppointmentWithPayment(payload) {
    try {
      const response = await fetch(`${API_URL}/appointments/book-with-payment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to create appointment with payment');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async cancelAppointment(appointmentId) {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to cancel appointment');
      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Doctor APIs
  async doctorListAppointments() {
    try {
      const response = await fetch(`${API_URL}/doctor/appointments`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch doctor appointments');
      return { data: data.appointments || [], error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  async doctorListPatients() {
    try {
      const response = await fetch(`${API_URL}/doctor/patients`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch doctor patients');
      return { data: data.patients || [], error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }


  // Availability APIs
  async doctorUpsertAvailability(date, slots, timezone = 'UTC') {
    try {
      const endpoint = `${API_URL}/doctor/availability`;
      console.debug('[API] PUT availability →', endpoint, { hasToken: !!this.token, date, slotsCount: Array.isArray(slots)?slots.length:0 });
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ date, slots, timezone })
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to save availability');
      return { data: data.availability, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async listAvailabilityByDate(date) {
    try {
      const params = new URLSearchParams({ date });
      const endpoint = `${API_URL}/availability?${params.toString()}`;
      console.debug('[API] GET availability →', endpoint);
      const response = await fetch(endpoint);
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch availability');
      return { data: data.availability || [], error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  // Audit Logs for doctors
  // GET /doctor/audit-logs?page=1&limit=50
  async doctorAuditLogs(page = 1, limit = 50) {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const response = await fetch(`${API_URL}/doctor/audit-logs?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch audit logs');
      // support either {logs: [...]} or direct array
      const logs = Array.isArray(data) ? data : (data.logs || []);
      return { data: logs, error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }

  // Admin: Get user consultation history
  // GET /admin/users/:userId/consultations
  async getUserConsultations(userId) {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/consultations`, {
        headers: this.getAuthHeaders()
      });
      const data = await this.parseJsonSafe(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch consultations');
      return { data: data.consultations || [], error: null };
    } catch (error) {
      return { data: [], error: { message: error.message } };
    }
  }
}

export const mongodbService = new MongoDBService();