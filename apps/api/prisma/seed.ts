import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * Helpers
 */
async function upsertFolder(path: string, name: string, parentPath?: string) {
  let parentId: number | null = null
  if (parentPath) {
    const parent = await prisma.folder.findUnique({ where: { path: parentPath } })
    if (!parent) throw new Error(`Parent folder not found for path: ${parentPath}`)
    parentId = parent.id
  }
  return prisma.folder.upsert({
    where: { path },
    create: { name, path, parentId },
    update: { name, parentId }
  })
}

async function main() {
  // Idempotent seed: upsert folders by unique path, then insert files with skipDuplicates
  // Adjust names/paths as you like—these match your explorer UI examples.

  // ROOTS
  const documents = await upsertFolder('/Documents', 'Documents')
  const pictures  = await upsertFolder('/Pictures',  'Pictures')
  const music     = await upsertFolder('/Music',     'Music')
  const work      = await upsertFolder('/Work',      'Work')

  // CHILDREN
  const invoices  = await upsertFolder('/Documents/Invoices', 'Invoices', '/Documents')
  const transport = await upsertFolder('/Documents/Invoices/Transport', 'Transport', '/Documents/Invoices')
  const family    = await upsertFolder('/Pictures/Family',    'Family',   '/Pictures')
  const vacations = await upsertFolder('/Pictures/Vacations', 'Vacations','/Pictures')

  // FILES (createMany with skipDuplicates so re-seeding is safe)
  const fileRows = [
    { name: 'cv.pdf',            path: '/Documents/cv.pdf',                fileType: 'pdf', fileSize: 256000,  folderId: documents.id },
    { name: 'logo.png',          path: '/Pictures/logo.png',               fileType: 'png', fileSize: 128000,  folderId: pictures.id  },
    { name: 'wireframe.svg',     path: '/Pictures/wireframe.svg',          fileType: 'svg', fileSize: 64000,   folderId: pictures.id  },
    { name: 'song.mp3',          path: '/Music/song.mp3',                  fileType: 'mp3', fileSize: 3145728, folderId: music.id     },
    { name: 'family-dinner.jpg', path: '/Pictures/Family/family-dinner.jpg', fileType: 'jpg', fileSize: 1536000, folderId: family.id    },
    { name: 'project-notes.txt', path: '/Work/project-notes.txt',          fileType: 'txt', fileSize: 8192,    folderId: work.id      },
  ]


  await prisma.fileItem.createMany({
    data: fileRows,
    skipDuplicates: true // relies on unique path in schema
  })

  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
