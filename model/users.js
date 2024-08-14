class UsersModel {
    constructor(dataManager) {
      this.dataManager = dataManager;
    }
  
    async getUserById(id) {
      try {
        return await this.dataManager.getUserById(id);
      } catch (error) {
        console.error('Error getting user by ID:', error);
        throw new Error('Failed to retrieve user');
      }
    }
  
    async getUsersByCountry(country) {
      try {
        return await this.dataManager.getUsersByCountry(country);
      } catch (error) {
        console.error('Error getting users by country:', error);
        throw new Error('Failed to retrieve users by country');
      }
    }
  
    async getUsersByName(name) {
      try {
        return await this.dataManager.getUsersByName(name);
      } catch (error) {
        console.error('Error getting users by name:', error);
        throw new Error('Failed to retrieve users by name');
      }
    }
  
    async getUsersByAge(age) {
      try {
        return await this.dataManager.getUsersByAge(age);
      } catch (error) {
        console.error('Error getting users by age:', error);
        throw new Error('Failed to retrieve users by age');
      }
    }
  
    async deleteUser(id) {
      try {
        return await this.dataManager.deleteUser(id);
      } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user');
      }
    }
  }
  
  module.exports = UsersModel;