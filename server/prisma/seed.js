import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing existing records...');
  await prisma.attachment.deleteMany();
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.channelMember.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.club.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('[Seed] Creating 5 Academic Departments...');
  const deptISE = await prisma.department.create({
    data: {
      name: 'Information Science & Engineering',
      code: 'ISE',
      description: 'Department dedicated to data engineering, software systems, and cloud architecture.',
      headOfDepartment: 'Dr. K. N. Sharma',
    },
  });

  const deptCSE = await prisma.department.create({
    data: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Computing theory, artificial intelligence, algorithms, and cybersecurity.',
      headOfDepartment: 'Dr. Kavitha Sundaram',
    },
  });

  const deptECE = await prisma.department.create({
    data: {
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'Embedded systems, VLSI design, signal processing, and telecommunications.',
      headOfDepartment: 'Dr. R. Rajesh',
    },
  });

  const deptME = await prisma.department.create({
    data: {
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Thermodynamics, robotics, advanced manufacturing, and CAD modeling.',
      headOfDepartment: 'Dr. H. V. Prasad',
    },
  });

  const deptCV = await prisma.department.create({
    data: {
      name: 'Civil Engineering',
      code: 'CV',
      description: 'Structural engineering, environmental hydraulics, and sustainable infrastructure.',
      headOfDepartment: 'Dr. Geetha Murthy',
    },
  });

  console.log('[Seed] Creating Academic Batches...');
  await prisma.batch.createMany({
    data: [
      { name: 'ISE 3rd Year (Batch 2023-2027)', year: '2023-2027', departmentId: deptISE.id },
      { name: 'CSE 3rd Year (Batch 2023-2027)', year: '2023-2027', departmentId: deptCSE.id },
      { name: 'ECE 4th Year (Batch 2022-2026)', year: '2022-2026', departmentId: deptECE.id },
      { name: 'ME 2nd Year (Batch 2024-2028)', year: '2024-2028', departmentId: deptME.id },
      { name: 'CV 4th Year (Batch 2022-2026)', year: '2022-2026', departmentId: deptCV.id },
    ],
  });

  console.log('[Seed] Hashing demo password: Campus@123 ...');
  const passwordHash = bcrypt.hashSync('Campus@123', 10);

  console.log('[Seed] Creating 22 Realistic Campus Users across 5 Roles...');
  const userAdmin = await prisma.user.create({
    data: {
      email: 'admin@campus.edu',
      passwordHash,
      fullName: 'Dr. Suresh Acharya',
      role: 'SUPER_ADMIN',
      bio: 'Campus Dean of Academic Infrastructure & Digital Services.',
      isOnline: true,
    },
  });

  const userDeptAdmin = await prisma.user.create({
    data: {
      email: 'dept.admin@campus.edu',
      passwordHash,
      fullName: 'Prof. Meenakshi Sundaram',
      role: 'DEPT_ADMIN',
      departmentId: deptISE.id,
      bio: 'Head of Department Administrator for Information Science & Engineering.',
      isOnline: true,
    },
  });

  const userProfSharma = await prisma.user.create({
    data: {
      email: 'prof.sharma@campus.edu',
      passwordHash,
      fullName: 'Prof. K. N. Sharma',
      role: 'FACULTY',
      departmentId: deptISE.id,
      bio: 'Professor of Operating Systems & Distributed Architecture.',
      isOnline: true,
    },
  });

  const userDrKavitha = await prisma.user.create({
    data: {
      email: 'dr.kavitha@campus.edu',
      passwordHash,
      fullName: 'Dr. Kavitha Sundaram',
      role: 'FACULTY',
      departmentId: deptCSE.id,
      bio: 'Associate Professor & Campus Placement Faculty Advisor.',
      isOnline: false,
    },
  });

  const userVikram = await prisma.user.create({
    data: {
      email: 'vikram.singh@campus.edu',
      passwordHash,
      fullName: 'Vikram Singh',
      role: 'CLUB_COORDINATOR',
      departmentId: deptCSE.id,
      batch: '2023-2027',
      studentId: '1MS23CS192',
      bio: 'President, Campus Coding Club. Full-stack systems & competitive programming.',
      isOnline: true,
    },
  });

  const userHarish = await prisma.user.create({
    data: {
      email: 'harish.k@campus.edu',
      passwordHash,
      fullName: 'Harish Kalyan',
      role: 'CLUB_COORDINATOR',
      departmentId: deptECE.id,
      batch: '2022-2026',
      studentId: '1MS22EC088',
      bio: 'Lead Coordinator, Robotics & Automation Guild.',
      isOnline: false,
    },
  });

  const userAbdul = await prisma.user.create({
    data: {
      email: 'abdul.ahad@campus.edu',
      passwordHash,
      fullName: 'Abdul Ahad',
      role: 'STUDENT',
      departmentId: deptISE.id,
      batch: '2023-2027',
      studentId: '1MS23IS002',
      bio: 'Information Science undergrad. Interested in distributed backend systems and real-time protocols.',
      isOnline: true,
    },
  });

  const userRiya = await prisma.user.create({
    data: {
      email: 'riya.nair@campus.edu',
      passwordHash,
      fullName: 'Riya Nair',
      role: 'STUDENT',
      departmentId: deptCSE.id,
      batch: '2023-2027',
      studentId: '1MS23CS144',
      bio: 'CSE 3rd year. Placement coordinator student rep, cloud enthusiast.',
      isOnline: true,
    },
  });

  const userArjun = await prisma.user.create({
    data: {
      email: 'arjun.menon@campus.edu',
      passwordHash,
      fullName: 'Arjun Menon',
      role: 'STUDENT',
      departmentId: deptECE.id,
      batch: '2022-2026',
      studentId: '1MS22EC032',
      bio: 'Final year ECE student. Embedded systems and IoT hardware design.',
      isOnline: false,
    },
  });

  const userSneha = await prisma.user.create({
    data: {
      email: 'sneha.rao@campus.edu',
      passwordHash,
      fullName: 'Sneha Rao',
      role: 'STUDENT',
      departmentId: deptISE.id,
      batch: '2023-2027',
      studentId: '1MS23IS118',
      bio: 'Data structures mentor, open-source contributor, and ISE class representative.',
      isOnline: true,
    },
  });

  const userKaran = await prisma.user.create({
    data: {
      email: 'karan.mehta@campus.edu',
      passwordHash,
      fullName: 'Karan Mehta',
      role: 'STUDENT',
      departmentId: deptME.id,
      batch: '2024-2028',
      studentId: '1MS24ME061',
      bio: 'Sophomore Mechanical Engineering student. Formula Student chassis design team.',
      isOnline: false,
    },
  });

  const userAnanya = await prisma.user.create({
    data: {
      email: 'ananya.iyer@campus.edu',
      passwordHash,
      fullName: 'Ananya Iyer',
      role: 'STUDENT',
      departmentId: deptCV.id,
      batch: '2022-2026',
      studentId: '1MS22CV015',
      bio: 'Senior Civil Engineering undergrad. GIS research assistant and environmental society lead.',
      isOnline: true,
    },
  });

  const userPranav = await prisma.user.create({
    data: {
      email: 'pranav.kulkarni@campus.edu',
      passwordHash,
      fullName: 'Pranav Kulkarni',
      role: 'STUDENT',
      departmentId: deptCSE.id,
      batch: '2023-2027',
      studentId: '1MS23CS121',
      bio: 'Competitive programmer, graph theory and dynamic programming enthusiast.',
    },
  });

  const userTanvi = await prisma.user.create({
    data: {
      email: 'tanvi.joshi@campus.edu',
      passwordHash,
      fullName: 'Tanvi Joshi',
      role: 'STUDENT',
      departmentId: deptISE.id,
      batch: '2023-2027',
      studentId: '1MS23IS140',
      bio: 'Web development, UI systems, and academic peer tutor.',
    },
  });

  const userAditya = await prisma.user.create({
    data: {
      email: 'aditya.verma@campus.edu',
      passwordHash,
      fullName: 'Aditya Verma',
      role: 'STUDENT',
      departmentId: deptECE.id,
      batch: '2023-2027',
      studentId: '1MS23EC011',
      bio: 'VLSI architecture and microcontrollers.',
    },
  });

  const userDeepa = await prisma.user.create({
    data: {
      email: 'deepa.nambiar@campus.edu',
      passwordHash,
      fullName: 'Deepa Nambiar',
      role: 'STUDENT',
      departmentId: deptME.id,
      batch: '2023-2027',
      studentId: '1MS23ME033',
      bio: 'CAD/CAM modeling and thermal engineering laboratory assistant.',
    },
  });

  const userRohan = await prisma.user.create({
    data: {
      email: 'rohan.deshmukh@campus.edu',
      passwordHash,
      fullName: 'Rohan Deshmukh',
      role: 'STUDENT',
      departmentId: deptCSE.id,
      batch: '2022-2026',
      studentId: '1MS22CS174',
      bio: 'Final year capstone student focusing on database sharding and real-time streaming.',
    },
  });

  const userPooja = await prisma.user.create({
    data: {
      email: 'pooja.hegde@campus.edu',
      passwordHash,
      fullName: 'Pooja Hegde',
      role: 'STUDENT',
      departmentId: deptISE.id,
      batch: '2024-2028',
      studentId: '1MS24IS072',
      bio: 'First year engineering, exploring machine learning and web platforms.',
    },
  });

  const userKarthik = await prisma.user.create({
    data: {
      email: 'karthik.bhat@campus.edu',
      passwordHash,
      fullName: 'Karthik Bhat',
      role: 'STUDENT',
      departmentId: deptECE.id,
      batch: '2023-2027',
      studentId: '1MS23EC075',
      bio: 'Robotics team electronics lead and radio communications amateur.',
    },
  });

  const userNaveen = await prisma.user.create({
    data: {
      email: 'naveen.kumar@campus.edu',
      passwordHash,
      fullName: 'Naveen Kumar',
      role: 'STUDENT',
      departmentId: deptCV.id,
      batch: '2023-2027',
      studentId: '1MS23CV052',
      bio: 'Smart urban drainage and structural dynamics researcher.',
    },
  });

  const userBhavya = await prisma.user.create({
    data: {
      email: 'bhavya.shree@campus.edu',
      passwordHash,
      fullName: 'Bhavya Shree',
      role: 'STUDENT',
      departmentId: deptCSE.id,
      batch: '2024-2028',
      studentId: '1MS24CS038',
      bio: 'Algorithms, cybersecurity, and open source documentation.',
    },
  });

  const userManish = await prisma.user.create({
    data: {
      email: 'manish.tiwari@campus.edu',
      passwordHash,
      fullName: 'Manish Tiwari',
      role: 'STUDENT',
      departmentId: deptME.id,
      batch: '2022-2026',
      studentId: '1MS22ME091',
      bio: 'Aerodynamics, computational fluid dynamics, and solar vehicle project.',
    },
  });

  console.log('[Seed] Creating Student Clubs...');
  const clubCoding = await prisma.club.create({
    data: {
      name: 'Campus Coding Club',
      code: 'CCC',
      category: 'TECHNICAL',
      description: 'Premier campus software guild dedicated to competitive programming, hackathons, and systems engineering.',
      leadId: userVikram.id,
      memberCount: 142,
    },
  });

  const clubRobo = await prisma.club.create({
    data: {
      name: 'Robotics & Automation Guild',
      code: 'RAG',
      category: 'TECHNICAL',
      description: 'Interdisciplinary club designing autonomous rovers, drones, and industrial automation prototypes.',
      leadId: userHarish.id,
      memberCount: 88,
    },
  });

  const clubFest = await prisma.club.create({
    data: {
      name: 'Campus Fest Organizing Committee',
      code: 'CFOC',
      category: 'CULTURAL',
      description: 'Student-run organization coordinating the annual university cultural and technical symposium.',
      leadId: userSneha.id,
      memberCount: 210,
    },
  });

  await prisma.clubMember.createMany({
    data: [
      { clubId: clubCoding.id, userId: userVikram.id, role: 'COORDINATOR' },
      { clubId: clubCoding.id, userId: userAbdul.id, role: 'MEMBER' },
      { clubId: clubCoding.id, userId: userRiya.id, role: 'MEMBER' },
      { clubId: clubCoding.id, userId: userPranav.id, role: 'CORE' },
      { clubId: clubRobo.id, userId: userHarish.id, role: 'COORDINATOR' },
      { clubId: clubRobo.id, userId: userArjun.id, role: 'CORE' },
      { clubId: clubRobo.id, userId: userKarthik.id, role: 'MEMBER' },
      { clubId: clubFest.id, userId: userSneha.id, role: 'COORDINATOR' },
      { clubId: clubFest.id, userId: userAnanya.id, role: 'CORE' },
    ],
  });

  console.log('[Seed] Creating Department Channels...');
  const channelIseGeneral = await prisma.channel.create({
    data: {
      name: 'ise-announcements',
      description: 'Official department notices and academic schedule updates for ISE students.',
      departmentId: deptISE.id,
    },
  });

  const channelCseGeneral = await prisma.channel.create({
    data: {
      name: 'cse-projects',
      description: 'Capstone project reviews, team formations, and faculty mentor discussions.',
      departmentId: deptCSE.id,
    },
  });

  await prisma.channelMember.createMany({
    data: [
      { channelId: channelIseGeneral.id, userId: userProfSharma.id, role: 'ADMIN' },
      { channelId: channelIseGeneral.id, userId: userAbdul.id, role: 'MEMBER' },
      { channelId: channelIseGeneral.id, userId: userSneha.id, role: 'MEMBER' },
      { channelId: channelCseGeneral.id, userId: userDrKavitha.id, role: 'ADMIN' },
      { channelId: channelCseGeneral.id, userId: userRiya.id, role: 'MEMBER' },
    ],
  });

  console.log('[Seed] Creating Active Conversations (Groups & DMs)...');
  const convIseBatch = await prisma.conversation.create({
    data: {
      title: 'ISE 3rd Year (Batch 2023-2027)',
      type: 'GROUP',
      departmentId: deptISE.id,
      lastMessageAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  const convPlacement = await prisma.conversation.create({
    data: {
      title: 'Placement Preparation 2026',
      type: 'GROUP',
      lastMessageAt: new Date(Date.now() - 12 * 60 * 1000),
    },
  });

  const convCodingClub = await prisma.conversation.create({
    data: {
      title: 'Coding Club Discussions',
      type: 'GROUP',
      clubId: clubCoding.id,
      lastMessageAt: new Date(Date.now() - 35 * 60 * 1000),
    },
  });

  const convProjects = await prisma.conversation.create({
    data: {
      title: 'Final Year Projects Hub',
      type: 'GROUP',
      departmentId: deptISE.id,
      lastMessageAt: new Date(Date.now() - 90 * 60 * 1000),
    },
  });

  const convDmAhadSneha = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      lastMessageAt: new Date(Date.now() - 2 * 60 * 1000),
    },
  });

  const convDmAhadProf = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      lastMessageAt: new Date(Date.now() - 180 * 60 * 1000),
    },
  });

  await prisma.conversationMember.createMany({
    data: [
      { conversationId: convIseBatch.id, userId: userAbdul.id, role: 'MEMBER' },
      { conversationId: convIseBatch.id, userId: userSneha.id, role: 'ADMIN' },
      { conversationId: convIseBatch.id, userId: userTanvi.id, role: 'MEMBER' },
      { conversationId: convIseBatch.id, userId: userPooja.id, role: 'MEMBER' },
      { conversationId: convIseBatch.id, userId: userProfSharma.id, role: 'ADMIN' },

      { conversationId: convPlacement.id, userId: userAbdul.id, role: 'MEMBER' },
      { conversationId: convPlacement.id, userId: userRiya.id, role: 'ADMIN' },
      { conversationId: convPlacement.id, userId: userArjun.id, role: 'MEMBER' },
      { conversationId: convPlacement.id, userId: userSneha.id, role: 'MEMBER' },
      { conversationId: convPlacement.id, userId: userDrKavitha.id, role: 'ADMIN' },

      { conversationId: convCodingClub.id, userId: userVikram.id, role: 'ADMIN' },
      { conversationId: convCodingClub.id, userId: userAbdul.id, role: 'MEMBER' },
      { conversationId: convCodingClub.id, userId: userPranav.id, role: 'MEMBER' },
      { conversationId: convCodingClub.id, userId: userRiya.id, role: 'MEMBER' },

      { conversationId: convProjects.id, userId: userProfSharma.id, role: 'ADMIN' },
      { conversationId: convProjects.id, userId: userArjun.id, role: 'MEMBER' },
      { conversationId: convProjects.id, userId: userAnanya.id, role: 'MEMBER' },
      { conversationId: convProjects.id, userId: userRohan.id, role: 'MEMBER' },

      { conversationId: convDmAhadSneha.id, userId: userAbdul.id, role: 'MEMBER' },
      { conversationId: convDmAhadSneha.id, userId: userSneha.id, role: 'MEMBER' },

      { conversationId: convDmAhadProf.id, userId: userAbdul.id, role: 'MEMBER' },
      { conversationId: convDmAhadProf.id, userId: userProfSharma.id, role: 'ADMIN' },
    ],
  });

  console.log('[Seed] Seeding 36+ Realistic Messages with Replies & Reactions...');
  const msgP1 = await prisma.message.create({
    data: {
      conversationId: convPlacement.id,
      senderId: userRiya.id,
      content: 'Important update: Deloitte has shared their campus drive schedule. Round 1 online aptitude and coding round will be conducted on Friday at 10:00 AM.',
      isPinned: true,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
    },
  });

  const msgP2 = await prisma.message.create({
    data: {
      conversationId: convPlacement.id,
      senderId: userAbdul.id,
      content: "Does anyone have the updated aptitude syllabus for tomorrow's placement test?",
      replyToId: msgP1.id,
      createdAt: new Date(Date.now() - 2.5 * 3600 * 1000),
    },
  });

  const msgP3 = await prisma.message.create({
    data: {
      conversationId: convPlacement.id,
      senderId: userDrKavitha.id,
      content: 'The assessment consists of 30 quantitative aptitude questions, 20 logical reasoning questions, and 2 hands-on coding problems in Python/Java/C++. Minimum cutoff is 65% aggregate.',
      replyToId: msgP2.id,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  });

  const msgP4 = await prisma.message.create({
    data: {
      conversationId: convPlacement.id,
      senderId: userArjun.id,
      content: 'Thanks Dr. Kavitha. Will resume screening be conducted before or after the technical assessment?',
      createdAt: new Date(Date.now() - 1.2 * 3600 * 1000),
    },
  });

  const msgP5 = await prisma.message.create({
    data: {
      conversationId: convPlacement.id,
      senderId: userDrKavitha.id,
      content: 'Shortlisted candidates from Round 1 will undergo technical interviews directly on Saturday. Keep your verified resume copies ready.',
      replyToId: msgP4.id,
      createdAt: new Date(Date.now() - 12 * 60 * 1000),
    },
  });

  await prisma.messageReaction.createMany({
    data: [
      { messageId: msgP1.id, userId: userAbdul.id, emoji: '👍' },
      { messageId: msgP1.id, userId: userArjun.id, emoji: '🎯' },
      { messageId: msgP3.id, userId: userAbdul.id, emoji: '🙏' },
      { messageId: msgP3.id, userId: userRiya.id, emoji: '❤️' },
    ],
  });

  const msgB1 = await prisma.message.create({
    data: {
      conversationId: convIseBatch.id,
      senderId: userProfSharma.id,
      content: 'Good morning everyone. I have uploaded the Operating Systems process scheduling and deadlock avoidance lecture slides to the Resources library.',
      isPinned: true,
      createdAt: new Date(Date.now() - 6 * 3600 * 1000),
    },
  });

  const msgB2 = await prisma.message.create({
    data: {
      conversationId: convIseBatch.id,
      senderId: userSneha.id,
      content: 'Reminder to all ISE Section A & B: The Computer Networks socket programming lab report must be submitted via the department portal by 11:59 PM tonight.',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
  });

  const msgB3 = await prisma.message.create({
    data: {
      conversationId: convIseBatch.id,
      senderId: userTanvi.id,
      content: 'For the multi-client chat server assignment, should we handle connection timeouts using select() or threads?',
      replyToId: msgB2.id,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
    },
  });

  const msgB4 = await prisma.message.create({
    data: {
      conversationId: convIseBatch.id,
      senderId: userAbdul.id,
      content: 'Either approach is acceptable per the lab manual, but non-blocking I/O with poll or select is recommended if you have more than 5 concurrent mock connections.',
      replyToId: msgB3.id,
      createdAt: new Date(Date.now() - 2.2 * 3600 * 1000),
    },
  });

  const msgB5 = await prisma.message.create({
    data: {
      conversationId: convIseBatch.id,
      senderId: userSneha.id,
      content: 'Also please note: Tomorrow morning 9:00 AM tutorial session will be in Seminar Hall 2 instead of Classroom 304 due to projector maintenance.',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  await prisma.messageReaction.createMany({
    data: [
      { messageId: msgB1.id, userId: userAbdul.id, emoji: '👏' },
      { messageId: msgB4.id, userId: userTanvi.id, emoji: '💡' },
      { messageId: msgB5.id, userId: userAbdul.id, emoji: '👍' },
    ],
  });

  const msgC1 = await prisma.message.create({
    data: {
      conversationId: convCodingClub.id,
      senderId: userVikram.id,
      content: 'Weekly campus contest is scheduled for this Wednesday from 5:30 PM to 7:30 PM in Lab 3. The problem set focuses on Breadth-First Search and Dijkstra algorithm variants.',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000),
    },
  });

  const msgC2 = await prisma.message.create({
    data: {
      conversationId: convCodingClub.id,
      senderId: userPranav.id,
      content: 'Are freshmen permitted to write solutions in Python 3, or is C++20 strictly required for time-limit reasons?',
      replyToId: msgC1.id,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
  });

  const msgC3 = await prisma.message.create({
    data: {
      conversationId: convCodingClub.id,
      senderId: userVikram.id,
      content: 'Python 3 and PyPy are fully supported with a 2x time limit multiplier. First-year students are warmly encouraged to join!',
      replyToId: msgC2.id,
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: convDmAhadSneha.id,
        senderId: userSneha.id,
        content: 'Hey Abdul, did you finish cross-verifying the test cases for the distributed consensus simulation?',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        conversationId: convDmAhadSneha.id,
        senderId: userAbdul.id,
        content: 'Yes, verified leader election and log replication under network partition. The latency stayed under 45ms across 5 nodes.',
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        conversationId: convDmAhadSneha.id,
        senderId: userSneha.id,
        content: 'Great. Let us print the report and present it to Prof. Sharma during the 2 PM lab hour.',
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        conversationId: convDmAhadProf.id,
        senderId: userAbdul.id,
        content: 'Respected Sir, I have a doubt regarding question 4 of the internal test on virtual memory page replacement algorithms.',
        createdAt: new Date(Date.now() - 240 * 60 * 1000),
      },
      {
        conversationId: convDmAhadProf.id,
        senderId: userProfSharma.id,
        content: 'You can meet me in the staff room between 3:30 PM and 4:15 PM today, Abdul. Bring your calculation sheet along.',
        createdAt: new Date(Date.now() - 180 * 60 * 1000),
      },
    ],
  });

  console.log('[Seed] Creating 6 Official Campus Announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Deloitte Campus Placement Drive: Eligibility and Registration Guidelines',
        content: 'Deloitte Consulting will be conducting on-campus recruitment for Associate Software Engineers on October 28, 2026. Eligible branches: ISE, CSE, ECE. Minimum aggregate: 7.0 CGPA with no standing backlogs. Register via the placement portal by October 25, 5:00 PM.',
        priority: 'URGENT',
        departmentId: deptISE.id,
        authorId: userDrKavitha.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
      {
        title: 'Mid-Term Laboratory Examination Schedule Released',
        content: 'The 5th semester mid-term practical assessments will commence from Monday, November 3, 2026. Students must carry their certified lab records and university identity cards. Detailed batch schedules are pinned to department boards.',
        priority: 'IMPORTANT',
        departmentId: deptISE.id,
        authorId: userProfSharma.id,
      },
      {
        title: 'Central Library Extended Hours During Examination Fortnight',
        content: 'The Central University Library reading halls will remain open until 11:00 PM on all weekdays and Saturdays starting next week. High-speed Wi-Fi and reference book lending will be accessible during these extended study hours.',
        priority: 'NORMAL',
        authorId: userAdmin.id,
      },
      {
        title: 'Annual Technical Symposium Paper Submissions Open',
        content: 'Faculty and student researchers are invited to submit original research manuscripts for the 14th National Conference on Computational Systems & Smart Infrastructure. Selected papers will be submitted for IEEE explore indexing.',
        priority: 'IMPORTANT',
        departmentId: deptCSE.id,
        authorId: userDeptAdmin.id,
      },
      {
        title: 'Campus Hostels Network Upgrade & Maintenance Window',
        content: 'Campus IT Infrastructure Services will perform fiber optic backbone maintenance on Saturday between 02:00 AM and 05:00 AM. Intermittent internet access may occur in Block B and Block C during this window.',
        priority: 'NORMAL',
        authorId: userAdmin.id,
      },
      {
        title: 'Mandatory Anti-Ragging and Ethics Affirmation 2026-2027',
        content: 'All enrolled undergraduate and postgraduate students are required to verify their annual compliance affidavits through the national anti-ragging web portal before the end of the current month.',
        priority: 'URGENT',
        authorId: userAdmin.id,
      },
    ],
  });

  console.log('[Seed] Creating 6 Campus Events with Real Locations...');
  const eventDeloitte = await prisma.event.create({
    data: {
      title: 'Deloitte Placement Readiness & Technical Mock Interview Workshop',
      description: 'Hands-on training session conducted by campus alumni covering case studies, technical problem solving, resume review, and behavioural interview expectations.',
      location: 'Seminar Hall 1, Academic Block A',
      eventDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      maxCapacity: 150,
      registeredCount: 38,
      organizerId: userDrKavitha.id,
      departmentId: deptISE.id,
    },
  });

  const eventHackathon = await prisma.event.create({
    data: {
      title: 'HackCampus 2026: 24-Hour Inter-Departmental Hackathon',
      description: 'Annual flagship software and hardware build sprint. Tracks include Distributed Systems, Green Campus Tech, Health Informatics, and Smart Logistics. Mentors from top engineering firms will be present.',
      location: 'Main Auditorium & Innovation Lab',
      eventDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 8 * 24 * 3600 * 1000),
      maxCapacity: 200,
      registeredCount: 74,
      organizerId: userVikram.id,
      clubId: clubCoding.id,
    },
  });

  const eventRobotics = await prisma.event.create({
    data: {
      title: 'Hands-on Autonomous Rover Prototyping Bootcamp',
      description: 'Learn motor driver interfacing, LiDAR sensor mapping, and ROS2 navigation stack basics. Microcontroller kits will be provided to registered teams.',
      location: 'Robotics Center, Mechanical Annex',
      eventDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      maxCapacity: 45,
      registeredCount: 32,
      organizerId: userHarish.id,
      clubId: clubRobo.id,
    },
  });

  const eventAlumni = await prisma.event.create({
    data: {
      title: 'Alumni Mentorship Circle: Transitioning from Academia to Product Engineering',
      description: 'Interactive fireside chat with distinguished campus alumni working at top tech firms. Q&A on internships, open source contributions, and engineering culture.',
      location: 'Conference Room 2 & Live Stream',
      eventDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      maxCapacity: 120,
      registeredCount: 51,
      organizerId: userProfSharma.id,
      departmentId: deptISE.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Annual Inter-Departmental Badminton & Table Tennis Tournament',
      description: 'Annual indoor athletic championship. Singles and doubles brackets for men and women across all engineering departments.',
      location: 'Campus Sports Complex',
      eventDate: new Date(Date.now() + 18 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 15 * 24 * 3600 * 1000),
      maxCapacity: 80,
      registeredCount: 44,
      organizerId: userAdmin.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Colloquium on Clean Energy Transitions & Sustainable Civil Works',
      description: 'Guest lecture by visiting researcher Dr. S. Ramanathan on resilient urban drainage systems and low-carbon cement formulations.',
      location: 'Civil Engineering Seminar Hall',
      eventDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      registrationDeadline: new Date(Date.now() + 4 * 24 * 3600 * 1000),
      maxCapacity: 75,
      registeredCount: 29,
      organizerId: userAnanya.id,
      departmentId: deptCV.id,
    },
  });

  await prisma.eventRegistration.createMany({
    data: [
      { eventId: eventDeloitte.id, userId: userAbdul.id, status: 'REGISTERED' },
      { eventId: eventHackathon.id, userId: userAbdul.id, status: 'REGISTERED' },
      { eventId: eventAlumni.id, userId: userAbdul.id, status: 'REGISTERED' },
      { eventId: eventDeloitte.id, userId: userRiya.id, status: 'REGISTERED' },
      { eventId: eventHackathon.id, userId: userSneha.id, status: 'REGISTERED' },
    ],
  });

  console.log('[Seed] Creating 16 High-Quality Academic & Campus Resources...');
  await prisma.resource.createMany({
    data: [
      {
        title: 'Deloitte Placement Aptitude Question Bank (2023-2025 Solved)',
        description: 'Comprehensive compilation of past technical aptitude, quant formulas, logical patterns, and pseudocode challenges.',
        category: 'PLACEMENT',
        fileUrl: '/uploads/deloitte_aptitude_question_bank.pdf',
        fileType: 'PDF',
        fileSize: 4850000,
        departmentId: deptISE.id,
        uploaderId: userDrKavitha.id,
        downloadsCount: 342,
        tags: 'Placement,Aptitude,Deloitte,InterviewPrep',
      },
      {
        title: 'Operating Systems Process Scheduling & Synchronization Notes',
        description: 'Class lecture slides, semaphore exercises, Banker algorithm proofs, and classical IPC concurrency examples.',
        category: 'ACADEMICS',
        fileUrl: '/uploads/os_scheduling_notes.pdf',
        fileType: 'PDF',
        fileSize: 3200000,
        departmentId: deptISE.id,
        uploaderId: userProfSharma.id,
        downloadsCount: 218,
        tags: 'ISE,Semester5,OS,Scheduling',
      },
      {
        title: 'Computer Networks Socket Programming Lab Manual (C/Python)',
        description: 'Official 5th semester lab guide covering TCP multi-client chat architecture, UDP packet broadcasting, and checksums.',
        category: 'NOTES',
        fileUrl: '/uploads/networks_socket_lab_manual.pdf',
        fileType: 'PDF',
        fileSize: 2100000,
        departmentId: deptISE.id,
        uploaderId: userProfSharma.id,
        downloadsCount: 185,
        tags: 'ISE,Networks,Lab,Sockets',
      },
      {
        title: 'Final Year Engineering Project Report LaTeX Template & Guidelines',
        description: 'Standard university-approved LaTeX formatting template conforming to IEEE citation style and font specifications.',
        category: 'PROJECTS',
        fileUrl: '/uploads/final_year_project_template.zip',
        fileType: 'ZIP',
        fileSize: 1540000,
        departmentId: deptISE.id,
        uploaderId: userDeptAdmin.id,
        downloadsCount: 412,
        tags: 'Capstone,LaTeX,Template,IEEE',
      },
      {
        title: 'Competitive Programming Data Structures & Algorithms Cheat Sheet',
        description: 'Curated handbook containing time complexities, standard template library snippets, Segment Trees, and Disjoint Set Union.',
        category: 'CLUBS',
        fileUrl: '/uploads/cp_dsa_handbook.pdf',
        fileType: 'PDF',
        fileSize: 1870000,
        clubId: clubCoding.id,
        uploaderId: userVikram.id,
        downloadsCount: 290,
        tags: 'CodingClub,DSA,Algorithms,CompetitiveProgramming',
      },
      {
        title: 'Microcontroller 8051 & ARM Cortex-M4 Architecture Reference Guide',
        description: 'Register mappings, instruction cycle times, interrupt tables, and timer configuration code for ECE laboratory coursework.',
        category: 'ACADEMICS',
        fileUrl: '/uploads/arm_cortex_reference.pdf',
        fileType: 'PDF',
        fileSize: 5120000,
        departmentId: deptECE.id,
        uploaderId: userArjun.id,
        downloadsCount: 124,
        tags: 'ECE,Embedded,ARM,Microcontroller',
      },
      {
        title: 'Database Management Systems Normalization & SQL Practice Queries',
        description: 'Detailed tutorial with 60 practical SQL queries, 1NF to BCNF decompositions, indexing strategies, and ACID isolation levels.',
        category: 'NOTES',
        fileUrl: '/uploads/dbms_normalization_practice.pdf',
        fileType: 'PDF',
        fileSize: 2600000,
        departmentId: deptCSE.id,
        uploaderId: userRiya.id,
        downloadsCount: 265,
        tags: 'CSE,DBMS,SQL,Normalization',
      },
      {
        title: 'Campus Fest 2026 Sponsorship Proposal & Brochure Kit',
        description: 'Official corporate partnership decks, tier breakdowns, expected campus footfall statistics, and brand visibility packages.',
        category: 'EVENTS',
        fileUrl: '/uploads/campus_fest_sponsorship.pdf',
        fileType: 'PDF',
        fileSize: 6400000,
        clubId: clubFest.id,
        uploaderId: userSneha.id,
        downloadsCount: 88,
        tags: 'CampusFest,Sponsorship,Cultural',
      },
      {
        title: 'Finite Element Analysis (FEA) Introduction & ANSYS Workbench Tutorial',
        description: 'Step-by-step stress analysis guide for structural cantilever beams, meshing convergence, and boundary condition modeling.',
        category: 'ACADEMICS',
        fileUrl: '/uploads/fea_ansys_workbench_guide.pdf',
        fileType: 'PDF',
        fileSize: 7300000,
        departmentId: deptME.id,
        uploaderId: userDeepa.id,
        downloadsCount: 95,
        tags: 'ME,ANSYS,FEA,MechanicalDesign',
      },
      {
        title: 'Surveying & Remote Sensing GIS Mapping Fieldwork Handbook',
        description: 'Total station calibration procedures, theodolite error correction, GPS coordinate benchmarks, and QGIS mapping workflows.',
        category: 'ACADEMICS',
        fileUrl: '/uploads/gis_surveying_fieldwork.pdf',
        fileType: 'PDF',
        fileSize: 4200000,
        departmentId: deptCV.id,
        uploaderId: userAnanya.id,
        downloadsCount: 81,
        tags: 'Civil,GIS,Surveying,QGIS',
      },
      {
        title: 'Full-Stack Modern Web Engineering Roadmap (React, Node, TypeScript)',
        description: 'Internal workshop guide covering state management, REST API architecture, database migrations, and containerization.',
        category: 'PROJECTS',
        fileUrl: '/uploads/web_engineering_handbook.pdf',
        fileType: 'PDF',
        fileSize: 3100000,
        departmentId: deptISE.id,
        uploaderId: userAbdul.id,
        downloadsCount: 167,
        tags: 'FullStack,TypeScript,React,Web',
      },
      {
        title: 'Robotics Guild ROS2 Humble Navigation Stack Quickstart Guide',
        description: 'URDF robot description setup, Nav2 costmaps configuration, and RViz simulation workflows for differential drive robots.',
        category: 'CLUBS',
        fileUrl: '/uploads/ros2_humble_navigation_guide.pdf',
        fileType: 'PDF',
        fileSize: 3900000,
        clubId: clubRobo.id,
        uploaderId: userHarish.id,
        downloadsCount: 112,
        tags: 'Robotics,ROS2,Nav2,Robots',
      },
      {
        title: 'Campus Code of Academic Integrity and Research Ethics Handbook',
        description: 'Official university policies governing plagiarism prevention, examination conduct, intellectual property, and laboratory safety.',
        category: 'ACADEMICS',
        fileUrl: '/uploads/academic_integrity_handbook.pdf',
        fileType: 'PDF',
        fileSize: 1200000,
        uploaderId: userAdmin.id,
        downloadsCount: 520,
        tags: 'Ethics,Rules,Policy,Handbook',
      },
      {
        title: 'Machine Learning Model Deployment via Docker & FastApi Guide',
        description: 'Hands-on practical guide for serializing PyTorch/Scikit-learn models, building slim Alpine container images, and serving endpoints.',
        category: 'PROJECTS',
        fileUrl: '/uploads/ml_deployment_docker_fastapi.pdf',
        fileType: 'PDF',
        fileSize: 2800000,
        departmentId: deptCSE.id,
        uploaderId: userPranav.id,
        downloadsCount: 198,
        tags: 'CSE,MachineLearning,Docker,FastAPI',
      },
      {
        title: 'Campus Placement Behavioral & HR Interview Question Bank',
        description: 'STAR methodology framework breakdown, 50 behavioral situational prompts, salary negotiation norms, and corporate conduct expectations.',
        category: 'PLACEMENT',
        fileUrl: '/uploads/behavioral_interview_bank.pdf',
        fileType: 'PDF',
        fileSize: 2200000,
        uploaderId: userDrKavitha.id,
        downloadsCount: 310,
        tags: 'Placement,HR,Interview,Career',
      },
      {
        title: 'Digital Signal Processing (DSP) MATLAB Experiments & Filter Design',
        description: 'FIR/IIR Butterworth and Chebyshev filter implementations, Fast Fourier Transform spectral analysis, and sample waveform scripts.',
        category: 'NOTES',
        fileUrl: '/uploads/dsp_matlab_experiments.pdf',
        fileType: 'PDF',
        fileSize: 3400000,
        departmentId: deptECE.id,
        uploaderId: userArjun.id,
        downloadsCount: 145,
        tags: 'ECE,DSP,MATLAB,SignalProcessing',
      },
    ],
  });

  console.log('[Seed] Creating Realistic Notifications for Demo Users...');
  await prisma.notification.createMany({
    data: [
      {
        userId: userAbdul.id,
        type: 'ANNOUNCEMENT',
        title: 'Urgent Announcement',
        body: 'Deloitte Campus Placement Drive eligibility details have been published. Check registration deadline.',
        link: '/announcements',
        isRead: false,
      },
      {
        userId: userAbdul.id,
        type: 'MESSAGE',
        title: 'New message in Placement Preparation 2026',
        body: 'Dr. Kavitha Sundaram replied to the aptitude syllabus query.',
        link: '/chat',
        isRead: false,
      },
      {
        userId: userAbdul.id,
        type: 'EVENT',
        title: 'Event Registration Confirmed',
        body: 'You are registered for Deloitte Placement Readiness Workshop on Seminar Hall 1.',
        link: '/events',
        isRead: true,
      },
      {
        userId: userAbdul.id,
        type: 'RESOURCE',
        title: 'New Academic Resource Uploaded',
        body: 'Prof. K. N. Sharma added "Operating Systems Process Scheduling & Synchronization Notes".',
        link: '/resources',
        isRead: false,
      },
    ],
  });

  console.log('[Seed] Ingesting Campus Documents & Chunks for RAG Assistant...');
  const docPlacementPolicy = await prisma.document.create({
    data: {
      title: 'University Campus Placement Policy & Eligibility Manual 2026-2027',
      category: 'PLACEMENT_POLICY',
      uploaderId: userAdmin.id,
      chunkCount: 3,
    },
  });

  await prisma.documentChunk.createMany({
    data: [
      {
        documentId: docPlacementPolicy.id,
        chunkIndex: 0,
        content: `Section 1: General Placement Eligibility Criteria
Students registering for on-campus recruitment drives must maintain a minimum cumulative grade point average (CGPA) of 6.75 across all completed semesters without active backlogs at the time of company registration. Tier 1 recruiters (Deloitte, Microsoft, Cisco) enforce a company-specific cutoff of 7.0 or 7.5 CGPA with a maximum of one dead backlog cleared prior to the 5th semester.`,
        metadata: JSON.stringify({ section: '1.0', title: 'Eligibility Cutoffs' }),
      },
      {
        documentId: docPlacementPolicy.id,
        chunkIndex: 1,
        content: `Section 2: Deloitte Recruitment Schedule & Procedure
The Deloitte campus hiring drive for Associate Software Engineers and Risk & Financial Advisory takes place in the last week of October. Round 1 is a 90-minute computer-based test comprising 30 Quant questions, 20 Logical Reasoning questions, and 2 algorithmic coding exercises in Java/Python/C++. Shortlisted students appear for two technical rounds and an executive behavioral interview. Selected candidates receive offers with a standard joining date in July 2027.`,
        metadata: JSON.stringify({ section: '2.4', title: 'Deloitte Hiring Process' }),
      },
      {
        documentId: docPlacementPolicy.id,
        chunkIndex: 2,
        content: `Section 3: One-Student One-Offer Rule & Dream Companies
Once a student receives an offer with a compensation package below 8 LPA, they are permitted one additional attempt to interview for an accredited 'Dream Offer' (>12 LPA). Accepting an offer binds the student to participate only in elite tier super-dream rounds. Failure to attend an interview after formal registration results in de-registration from the placement cell for 60 calendar days.`,
        metadata: JSON.stringify({ section: '3.1', title: 'One-Student One-Offer Rule' }),
      },
    ],
  });

  const docAcademicHandbook = await prisma.document.create({
    data: {
      title: 'Autonomous Academic Regulations & Grading Norms',
      category: 'HANDBOOK',
      uploaderId: userAdmin.id,
      chunkCount: 2,
    },
  });

  await prisma.documentChunk.createMany({
    data: [
      {
        documentId: docAcademicHandbook.id,
        chunkIndex: 0,
        content: `Attendance Regulations:
A minimum of 85% attendance in theory and laboratory courses is mandatory to qualify for semester-end examinations (SEE). Students with attendance between 75% and 84% may be condoned by the Dean of Academics upon producing medical documentation approved within 3 days of absence. Students below 75% will be detained and required to re-register for the course during subsequent supplementary terms.`,
        metadata: JSON.stringify({ section: '4.2', title: 'Attendance Mandate' }),
      },
      {
        documentId: docAcademicHandbook.id,
        chunkIndex: 1,
        content: `Evaluation and Continuous Internal Assessment (CIE):
Each theory course is evaluated for 100 marks, consisting of 50 marks Continuous Internal Evaluation (CIE) and 50 marks Semester End Exam (SEE). CIE includes three written tests (best of two taken, 30 marks), course project/seminar (10 marks), and surprise quizzes/assignments (10 marks). Minimum CIE passing threshold is 40% (20/50).`,
        metadata: JSON.stringify({ section: '5.1', title: 'Grading & Internal Marks' }),
      },
    ],
  });

  console.log('[Seed] Database seeding completed successfully in plain JavaScript!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
