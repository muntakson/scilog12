import { PrismaClient, ProductCategory, AIProvider } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const LOGBOOK_SECTIONS = [
  { key: 'introduction',        title: 'Introduction' },
  { key: 'materials_apparatus', title: 'Materials & Apparatus' },
  { key: 'procedure',           title: 'Procedure' },
  { key: 'results',             title: 'Results' },
  { key: 'discussion',          title: 'Discussion' },
  { key: 'conclusion',          title: 'Conclusion' },
  { key: 'acknowledgments',     title: 'Acknowledgments' },
  { key: 'references',          title: 'References' },
];

async function main() {
  // --- Users ---
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash    = await bcrypt.hash('admin123',    10);

  const don = await prisma.user.upsert({
    where: { email: 'don@example.com' },
    update: {},
    create: {
      email: 'don@example.com', passwordHash, name: 'Don Park',
      yearLevel: 8, school: 'Demo School', role: 'STUDENT',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@scilog12.org' },
    update: {},
    create: {
      email: 'admin@scilog12.org', passwordHash: adminHash, name: 'Admin',
      role: 'ADMIN',
    },
  });

  await prisma.cart.upsert({
    where: { userId: don.id }, update: {},
    create: { userId: don.id },
  });

  // --- Products ---
  const products = [
    { sku: 'ELE-ARDUINO-UNO',  name: 'Arduino Uno R3',          category: 'ELECTRICAL', priceCents: 3500, stock: 50,
      description: 'Microcontroller board for data logging and prototyping.', imageUrl: null },
    { sku: 'ELE-HALL-A3144',   name: 'Hall Effect Sensor A3144 (x5)', category: 'ELECTRICAL', priceCents: 600, stock: 200,
      description: 'Digital Hall sensor for detecting magnetic steel balls.', imageUrl: null },
    { sku: 'MEC-BALL-MAG-12',  name: 'Magnetic steel ball Ø12mm (x10)', category: 'MECHANICAL', priceCents: 1200, stock: 80,
      description: 'Neodymium-cored steel ball for brachistochrone experiments.', imageUrl: null },
    { sku: 'MEC-PLA-1KG',      name: 'PLA filament 1kg',         category: 'MECHANICAL', priceCents: 2500, stock: 30,
      description: '1.75mm PLA filament for 3D printing experiment slides.', imageUrl: null },
    { sku: 'BIO-PETRI-25',     name: 'Sterile petri dishes (x25)', category: 'BIOLOGICAL', priceCents: 1800, stock: 60,
      description: '90mm sterile polystyrene petri dishes.', imageUrl: null },
    { sku: 'CHE-PH-STRIPS',    name: 'pH test strips (100ct)',   category: 'CHEMICAL', priceCents: 900, stock: 120,
      description: 'Universal pH 1-14 indicator strips.', imageUrl: null },
    { sku: 'ELE-JUMPER-120',   name: 'Jumper wires (120pcs)',    category: 'ELECTRICAL', priceCents: 800, stock: 200,
      description: 'Mixed male-male / male-female / female-female jumper wires.', imageUrl: null },
    { sku: 'ELE-BREADBOARD',   name: 'Solderless breadboard 830', category: 'ELECTRICAL', priceCents: 700, stock: 150,
      description: '830 tie-point breadboard.', imageUrl: null },
  ] as const;

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku }, update: { priceCents: p.priceCents, stock: p.stock },
      create: { ...p, category: p.category as ProductCategory },
    });
  }

  // --- Don's brachistochrone project ---
  const existing = await prisma.project.findFirst({
    where: { ownerId: don.id, title: { contains: 'Brachistochrone' } },
  });
  const project = existing ?? await prisma.project.create({
    data: {
      ownerId: don.id,
      title: 'Brachistochrone curve race',
      description: 'Compare the descent time of a magnetic steel ball along line, circle, parabola, and cycloid curves.',
    },
  });

  // --- Logbook with sections ---
  let logbook = await prisma.logbook.findUnique({ where: { projectId: project.id } });
  if (!logbook) {
    logbook = await prisma.logbook.create({ data: { projectId: project.id } });
    await prisma.logbookSection.createMany({
      data: LOGBOOK_SECTIONS.map((s, i) => ({
        logbookId: logbook!.id, key: s.key, title: s.title, order: i,
        content: i === 0
          ? 'In 1696 Johann Bernoulli posed the brachistochrone problem: which curve, between two points at different heights, lets an object slide under gravity in the shortest time? The answer is a cycloid. This experiment tests that prediction by racing a magnetic steel ball down five 3D-printed slides — line, circle, parabola, and two cycloid variations.'
          : '',
      })),
    });
  }

  // --- AI conversation seed (Don asking for OpenSCAD slides + firmware) ---
  const convoExists = await prisma.aIConversation.findFirst({ where: { projectId: project.id } });
  if (!convoExists) {
    const convo = await prisma.aIConversation.create({
      data: { projectId: project.id, provider: AIProvider.ANTHROPIC, model: 'claude-opus-4-7', title: 'Generate the 5 slides' },
    });
    await prisma.aIMessage.createMany({
      data: [
        { conversationId: convo.id, role: 'user',
          content: 'I want to 3D-print 5 slides for a brachistochrone race: straight line, circular arc, parabola, and two cycloids (one classic, one wider). Slides should be 400mm long, 40mm wide, with a 6mm channel for a 12mm steel ball, and mounting tabs at each end. Can you give me OpenSCAD code for each?' },
        { conversationId: convo.id, role: 'assistant',
          content: 'Here are the five slides as OpenSCAD modules. Each takes the same length/width parameters and only differs in the curve() function. I parameterised the cycloid via its rolling-circle radius so you can also try a "wider" variant by passing a larger r. (… code …) Note: the cycloid module needs $fn>=200 to print smoothly.' },
        { conversationId: convo.id, role: 'user',
          content: 'Great. Now give me an Arduino Uno sketch with two A3144 hall sensors (start gate and finish gate) that prints elapsed milliseconds to Serial, plus a simple Android companion app that reads the same Serial over USB-OTG and logs CSV.' },
        { conversationId: convo.id, role: 'assistant',
          content: 'Arduino sketch uses INT0/INT1 hardware interrupts on D2/D3 so timing resolution is ~4µs. (… sketch …). For Android, the simplest approach is the usb-serial-for-android library; I’ve scaffolded a Kotlin app that opens the first CdcAcmSerialDriver, prints incoming lines to a RecyclerView, and writes them to Documents/brachistochrone.csv. (… code …). One caveat: USB-OTG support depends on your phone — test with an inexpensive USB-OTG adapter before relying on it on game day.' },
      ],
    });
  }

  console.log('✅ Seed complete. Login as don@example.com / password123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
