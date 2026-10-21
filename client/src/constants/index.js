export const DEMO_ACCOUNTS = [
  {
    roleName: 'Student',
    email: 'abdul.ahad@campus.edu',
    password: 'Campus@123',
    description: '3rd Year Information Science student. Chats in batch groups, downloads resources, registers for events.',
    badge: 'Undergraduate',
  },
  {
    roleName: 'Faculty',
    email: 'prof.sharma@campus.edu',
    password: 'Campus@123',
    description: 'Professor of Operating Systems & ISE Dept Head. Posts academic announcements and uploads lecture resources.',
    badge: 'Faculty Member',
  },
  {
    roleName: 'Club Coordinator',
    email: 'vikram.singh@campus.edu',
    password: 'Campus@123',
    description: 'Lead for Campus Coding Club. Organizes HackCampus 2026 and manages club community channels.',
    badge: 'Club Lead',
  },
  {
    roleName: 'Department Admin',
    email: 'dept.admin@campus.edu',
    password: 'Campus@123',
    description: 'Department administrator for ISE. Moderates channels and manages course schedules.',
    badge: 'Staff Admin',
  },
  {
    roleName: 'Super Admin',
    email: 'admin@campus.edu',
    password: 'Campus@123',
    description: 'Dean of Academic Infrastructure. Has access to the platform analytics dashboard and moderation triage.',
    badge: 'Campus Superadmin',
  },
];

export const RESOURCE_CATEGORIES = [
  { id: 'ALL', label: 'All Resources' },
  { id: 'PLACEMENT', label: 'Placement & Career' },
  { id: 'ACADEMICS', label: 'Academics & Syllabus' },
  { id: 'PROJECTS', label: 'Projects & Lab Works' },
  { id: 'NOTES', label: 'Notes & Study Guides' },
  { id: 'EVENTS', label: 'Events & Handouts' },
  { id: 'CLUBS', label: 'Club Publications' },
];

export const ROLES = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
  CLUB_COORDINATOR: 'Club Coordinator',
  DEPT_ADMIN: 'Department Admin',
  SUPER_ADMIN: 'Super Administrator',
};
