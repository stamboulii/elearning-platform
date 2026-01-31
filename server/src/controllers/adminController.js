import adminService from '../services/adminService.js';

class AdminController {
  async getAllUsers(req, res) {
    const data = await adminService.getAllUsers(req.query);
    res.json({ success: true, data });
  }

  async getUserById(req, res) {
    const user = await adminService.getUserById(req.params.id);
    res.json({ success: true, data: { user } });
  }

  async updateUser(req, res) {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: { user } });
  }

  async deleteUser(req, res) {
    await adminService.deleteUser(req.params.id);
    res.json({ success: true });
  }

  async toggleUserStatus(req, res) {
    const user = await adminService.toggleUserStatus(req.params.id);
    res.json({ success: true, data: { user } });
  }

  async getDashboardStats(req, res) {
    const data = await adminService.getDashboardStats(req.query.period);
    res.json({ success: true, data });
  }

  async getAllCourses(req, res) {
    console.log('DEBUG: AdminController.getAllCourses hit');
    const data = await adminService.getAllCourses(req.query);
    res.json({ success: true, data });
  }

  async approveCourse(req, res) {
    const course = await adminService.approveCourse(req.params.id);
    res.json({ success: true, data: { course } });
  }

  async rejectCourse(req, res) {
    const course = await adminService.rejectCourse(req.params.id, req.body.reason);
    res.json({ success: true, data: { course } });
  }
}

export default new AdminController();
