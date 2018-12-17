
module.exports = {
  async handleResponse(response) {
      const data = await response.json();
      if (response.ok) {
          return data;
      }
      throw new Error(data.message);
  }
};