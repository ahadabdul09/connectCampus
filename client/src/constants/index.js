export const CAMPUS_ROLES_INFO = [
  {
    roleName: 'Students',
    description: 'Participate in department channels, batch groups, and club discussions, access academic resources, and view verified campus announcements.',
    badge: 'Enrolled Students',
  },
  {
    roleName: 'Faculty',
    description: 'Broadcast course notices, curate academic repositories, moderate batch discussions, and communicate directly with advisees.',
    badge: 'Teaching Faculty',
  },
  {
    roleName: 'Club Coordinators',
    description: 'Organize campus societies, announce upcoming workshops and hackathons, coordinate member recruitment, and publish event assets.',
    badge: 'Student Societies',
  },
  {
    roleName: 'Department Administrators',
    description: 'Maintain department-wide communication, oversee faculty channels, manage curriculum resources, and manage student batch memberships.',
    badge: 'Academic Staff',
  },
  {
    roleName: 'Super Administrators',
    description: 'Institution-level authority to manage users, issue verified invitations, supervise departments and clubs, monitor compliance, and audit system metrics.',
    badge: 'Institutional Governance',
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
