import departmentRepo from './department.repository.js'

class DepartmentService {
  async getActiveDepartments() {
    return departmentRepo.findActive()
  }

  async createDepartment(data) {
    return departmentRepo.create(data)
  }
}

export default new DepartmentService()
