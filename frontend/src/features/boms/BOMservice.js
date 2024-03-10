class BOMService {
  async createProject(data) {
    try {
      const response = await fetch('/api/bom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create BOM');
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error('Failed to create BOM:', error);
      throw error;
    }
  }

  async getAllProjects() {
    try {
      const response = await fetch('/api/bom');

      if (!response.ok) {
        throw new Error('Failed to fetch BOMs');
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error('Failed to fetch BOMs:', error);
      throw error;
    }
  }

  async getBOMById(id) {
    try {
      const response = await fetch(`/api/bom/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch BOM');
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error('Failed to fetch BOM:', error);
      throw error;
    }
  }

  async updateProject(id, data) {
    try {
      const response = await fetch(`/api/bom/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update BOM');
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error('Failed to update BOM:', error);
      throw error;
    }
  }

  async deleteProject(id) {
    try {
      const response = await fetch(`/api/bom/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete BOM');
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error('Failed to delete BOM:', error);
      throw error;
    }
  }
}

export default new BOMService();
