import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test organizations
  const org1 = await prisma.organization.upsert({
    where: { name: "Tech Innovation Hub" },
    update: {},
    create: {
      name: "Tech Innovation Hub",
      id: "tech-innovation-hub",
      description:
        "Leading the future of technology through innovation, education, and collaboration.",
      bannerUrl: "/img/logo.png",
      logoUrl: "/img/icon.png",
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { name: "Community Builders Network" },
    update: {},
    create: {
      name: "Community Builders Network",
      id: "community-builders",
      description:
        "Empowering communities through meaningful engagement, education, and sustainable development.",
      bannerUrl: "/img/icon.png",
      logoUrl: "/img/logo.png",
    },
  });

  // Create admin users for organizations
  const user1 = await prisma.user.upsert({
    where: { username: "alice_admin" },
    update: {},
    create: {
      id: "alice-admin",
      username: "alice_admin",
      displayName: "Alice Chen",
      email: "alice@techhub.com",
      avatarUrl: "/img/icon.png",
      bio: "Tech enthusiast and community builder",
      passwordHash: "$2b$10$dummyhash", // In real app, hash passwords properly
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: "bob_organizer" },
    update: {},
    create: {
      id: "bob-organizer",
      username: "bob_organizer",
      displayName: "Bob Wilson",
      email: "bob@community.org",
      avatarUrl: "/img/logo.png",
      bio: "Event organizer and community leader",
      passwordHash: "$2b$10$dummyhash",
    },
  });

  // Add admins
  await prisma.organizationAdmin.upsert({
    where: {
      userId_organizationId: {
        userId: user1.id,
        organizationId: org1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      organizationId: org1.id,
      assignedAt: new Date(),
    },
  });

  await prisma.organizationAdmin.upsert({
    where: {
      userId_organizationId: {
        userId: user2.id,
        organizationId: org2.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      organizationId: org2.id,
      assignedAt: new Date(),
    },
  });

  // Create member relationships
  const user3 = await prisma.user.upsert({
    where: { username: "carol_member" },
    update: {},
    create: {
      id: "carol-member",
      username: "carol_member",
      displayName: "Carol Davis",
      email: "carol@example.com",
      avatarUrl: "/img/icon.png",
      passwordHash: "$2b$10$dummyhash",
    },
  });

  const user4 = await prisma.user.upsert({
    where: { username: "david_member" },
    update: {},
    create: {
      id: "david-member",
      username: "david_member",
      displayName: "David Park",
      email: "david@example.com",
      avatarUrl: "/img/logo.png",
      passwordHash: "$2b$10$dummyhash",
    },
  });

  // Add members to organizations
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: user3.id,
        organizationId: org1.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      organizationId: org1.id,
      joinedAt: new Date(),
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: user4.id,
        organizationId: org2.id,
      },
    },
    update: {},
    create: {
      userId: user4.id,
      organizationId: org2.id,
      joinedAt: new Date(),
    },
  });

  // =========================================================================
  // COMPREHENSIVE MUSIC LIBRARY DATA
  // =========================================================================

  console.log("🎵 Creating comprehensive music library...");

  // Create a wide variety of songs across different genres
  const songs = await Promise.all([
    // Gospel & Hymns
    prisma.song.upsert({
      where: { id: "song-gospel-1" },
      update: {},
      create: {
        id: "song-gospel-1",
        title: "Amazing Grace",
        artist: "Traditional",
        genre: "Gospel",
        duration: 180,
        lyrics: "Amazing grace, how sweet the sound That saved a wretch like me...",
        audioUrl: "/audio/amazing-grace.mp3",
        sheetMusicUrl: "/sheets/amazing-grace.pdf",
        coverUrl: "/covers/gospel-1.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-gospel-2" },
      update: {},
      create: {
        id: "song-gospel-2",
        title: "How Great Thou Art",
        artist: "Stuart K. Hine",
        genre: "Hymn",
        duration: 240,
        lyrics: "O Lord my God, When I in awesome wonder...",
        audioUrl: "/audio/how-great-thou-art.mp3",
        sheetMusicUrl: "/sheets/how-great-thou-art.pdf",
        coverUrl: "/covers/gospel-2.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-gospel-3" },
      update: {},
      create: {
        id: "song-gospel-3",
        title: "It Is Well With My Soul",
        artist: "Horatio Spafford",
        genre: "Hymn",
        duration: 210,
        lyrics: "When peace like a river attendeth my way...",
        audioUrl: "/audio/it-is-well.mp3",
        sheetMusicUrl: "/sheets/it-is-well.pdf",
        coverUrl: "/covers/gospel-3.jpg",
      },
    }),

    // Contemporary Christian
    prisma.song.upsert({
      where: { id: "song-ccm-1" },
      update: {},
      create: {
        id: "song-ccm-1",
        title: "Oceans (Where Feet May Fail)",
        artist: "Hillsong UNITED",
        genre: "Contemporary Christian",
        duration: 537,
        lyrics: "You call me out upon the waters The great unknown where feet may fail...",
        audioUrl: "/audio/oceans.mp3",
        sheetMusicUrl: "/sheets/oceans.pdf",
        coverUrl: "/covers/ccm-1.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-ccm-2" },
      update: {},
      create: {
        id: "song-ccm-2",
        title: "What A Beautiful Name",
        artist: "Hillsong Worship",
        genre: "Contemporary Christian",
        duration: 295,
        lyrics: "You were the Word at the beginning One with God the Lord Most High...",
        audioUrl: "/audio/beautiful-name.mp3",
        sheetMusicUrl: "/sheets/beautiful-name.pdf",
        coverUrl: "/covers/ccm-2.jpg",
      },
    }),

    // Classical
    prisma.song.upsert({
      where: { id: "song-classical-1" },
      update: {},
      create: {
        id: "song-classical-1",
        title: "Moonlight Sonata",
        artist: "Ludwig van Beethoven",
        genre: "Classical",
        duration: 900,
        audioUrl: "/audio/moonlight-sonata.mp3",
        sheetMusicUrl: "/sheets/moonlight-sonata.pdf",
        coverUrl: "/covers/classical-1.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-classical-2" },
      update: {},
      create: {
        id: "song-classical-2",
        title: "Clair de Lune",
        artist: "Claude Debussy",
        genre: "Classical",
        duration: 320,
        audioUrl: "/audio/clair-de-lune.mp3",
        sheetMusicUrl: "/sheets/clair-de-lune.pdf",
        coverUrl: "/covers/classical-2.jpg",
      },
    }),

    // Jazz
    prisma.song.upsert({
      where: { id: "song-jazz-1" },
      update: {},
      create: {
        id: "song-jazz-1",
        title: "Take Five",
        artist: "Dave Brubeck",
        genre: "Jazz",
        duration: 324,
        audioUrl: "/audio/take-five.mp3",
        sheetMusicUrl: "/sheets/take-five.pdf",
        coverUrl: "/covers/jazz-1.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-jazz-2" },
      update: {},
      create: {
        id: "song-jazz-2",
        title: "So What",
        artist: "Miles Davis",
        genre: "Jazz",
        duration: 562,
        audioUrl: "/audio/so-what.mp3",
        sheetMusicUrl: "/sheets/so-what.pdf",
        coverUrl: "/covers/jazz-2.jpg",
      },
    }),

    // Pop/Rock
    prisma.song.upsert({
      where: { id: "song-pop-1" },
      update: {},
      create: {
        id: "song-pop-1",
        title: "Imagine",
        artist: "John Lennon",
        genre: "Pop",
        duration: 183,
        lyrics: "Imagine there's no heaven It's easy if you try...",
        audioUrl: "/audio/imagine.mp3",
        sheetMusicUrl: "/sheets/imagine.pdf",
        coverUrl: "/covers/pop-1.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-rock-1" },
      update: {},
      create: {
        id: "song-rock-1",
        title: "Bohemian Rhapsody",
        artist: "Queen",
        genre: "Rock",
        duration: 354,
        lyrics: "Is this the real life? Is this just fantasy?...",
        audioUrl: "/audio/bohemian-rhapsody.mp3",
        sheetMusicUrl: "/sheets/bohemian-rhapsody.pdf",
        coverUrl: "/covers/rock-1.jpg",
      },
    }),

    // Traditional & Folk
    prisma.song.upsert({
      where: { id: "song-folk-1" },
      update: {},
      create: {
        id: "song-folk-1",
        title: "This Little Light of Mine",
        artist: "Traditional",
        genre: "Folk",
        duration: 120,
        lyrics: "This little light of mine, I'm gonna let it shine...",
        audioUrl: "/audio/this-little-light.mp3",
        sheetMusicUrl: "/sheets/this-little-light.pdf",
        coverUrl: "/covers/folk-1.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-folk-2" },
      update: {},
      create: {
        id: "song-folk-2",
        title: "We Shall Overcome",
        artist: "Traditional",
        genre: "Folk",
        duration: 210,
        lyrics: "We shall overcome, we shall overcome...",
        audioUrl: "/audio/we-shall-overcome.mp3",
        sheetMusicUrl: "/sheets/we-shall-overcome.pdf",
        coverUrl: "/covers/folk-2.jpg",
      },
    }),

    // Christmas Songs
    prisma.song.upsert({
      where: { id: "song-christmas-1" },
      update: {},
      create: {
        id: "song-christmas-1",
        title: "Silent Night",
        artist: "Traditional",
        genre: "Christmas",
        duration: 240,
        lyrics: "Silent night, holy night All is calm, all is bright...",
        audioUrl: "/audio/silent-night.mp3",
        sheetMusicUrl: "/sheets/silent-night.pdf",
        coverUrl: "/covers/christmas-1.jpg",
      },
    }),
    prisma.song.upsert({
      where: { id: "song-christmas-2" },
      update: {},
      create: {
        id: "song-christmas-2",
        title: "Joy to the World",
        artist: "Traditional",
        genre: "Christmas",
        duration: 180,
        lyrics: "Joy to the world! The Lord is come Let earth receive her King...",
        audioUrl: "/audio/joy-to-the-world.mp3",
        sheetMusicUrl: "/sheets/joy-to-the-world.pdf",
        coverUrl: "/covers/christmas-2.jpg",
      },
    }),
  ]);

  // =========================================================================
  // PLAYLISTS
  // =========================================================================

  console.log("🎧 Creating playlists...");

  // Create personal playlists for users
  const worshipPlaylist = await prisma.playlist.upsert({
    where: { id: "playlist-worship-1" },
    update: {},
    create: {
      id: "playlist-worship-1",
      name: "Sunday Worship Set",
      description: "Perfect songs for Sunday morning worship service",
      coverUrl: "/covers/worship-playlist.jpg",
      userId: user1.id,
      songs: {
        create: [
          { songId: "song-ccm-1", addedAt: new Date() },
          { songId: "song-ccm-2", addedAt: new Date() },
          { songId: "song-gospel-1", addedAt: new Date() },
          { songId: "song-gospel-2", addedAt: new Date() },
        ],
      },
    },
  });

  const classicalPlaylist = await prisma.playlist.upsert({
    where: { id: "playlist-classical-1" },
    update: {},
    create: {
      id: "playlist-classical-1",
      name: "Classical Masterpieces",
      description: "Timeless classical compositions for reflection and study",
      coverUrl: "/covers/classical-playlist.jpg",
      userId: user2.id,
      songs: {
        create: [
          { songId: "song-classical-1", addedAt: new Date() },
          { songId: "song-classical-2", addedAt: new Date() },
        ],
      },
    },
  });

  const jazzPlaylist = await prisma.playlist.upsert({
    where: { id: "playlist-jazz-1" },
    update: {},
    create: {
      id: "playlist-jazz-1",
      name: "Jazz Essentials",
      description: "Essential jazz standards for musicians and enthusiasts",
      coverUrl: "/covers/jazz-playlist.jpg",
      userId: user3.id,
      songs: {
        create: [
          { songId: "song-jazz-1", addedAt: new Date() },
          { songId: "song-jazz-2", addedAt: new Date() },
        ],
      },
    },
  });

  // =========================================================================
  // ORGANIZATION SELECTIONS (SETLISTS)
  // =========================================================================

  console.log("🎼 Creating organization song selections...");

  // Create multiple organization selections for different purposes
  const sundayServiceSelection = await prisma.organizationSelection.upsert({
    where: { id: "selection-sunday-service" },
    update: {},
    create: {
      id: "selection-sunday-service",
      title: "Sunday Service Setlist",
      description: "Curated selection of hymns and worship songs for our Sunday morning service",
      purpose: "Sunday Service",
      organizationId: org2.id,
      userId: user2.id,
      songs: {
        create: [
          { songId: "song-gospel-1", order: 1 },
          { songId: "song-gospel-2", order: 2 },
          { songId: "song-ccm-1", order: 3 },
          { songId: "song-ccm-2", order: 4 },
        ],
      },
    },
  });

  const choirPracticeSelection = await prisma.organizationSelection.upsert({
    where: { id: "selection-choir-practice" },
    update: {},
    create: {
      id: "selection-choir-practice",
      title: "Choir Practice Repertoire",
      description: "Weekly practice songs for the community choir",
      purpose: "Choir Practice",
      organizationId: org2.id,
      userId: user2.id,
      songs: {
        create: [
          { songId: "song-folk-1", order: 1 },
          { songId: "song-folk-2", order: 2 },
          { songId: "song-gospel-3", order: 3 },
        ],
      },
    },
  });

  const christmasProgramSelection = await prisma.organizationSelection.upsert({
    where: { id: "selection-christmas-program" },
    update: {},
    create: {
      id: "selection-christmas-program",
      title: "Christmas Celebration Program",
      description: "Songs for our annual Christmas community celebration",
      purpose: "Christmas Program",
      organizationId: org2.id,
      userId: user2.id,
      songs: {
        create: [
          { songId: "song-christmas-1", order: 1 },
          { songId: "song-christmas-2", order: 2 },
          { songId: "song-gospel-1", order: 3 }, // Amazing Grace often included in Christmas
        ],
      },
    },
  });

  // =========================================================================
  // SONG LIKES (to simulate user engagement)
  // =========================================================================

  console.log("❤️ Adding song likes...");

  // Add likes to songs to simulate user engagement
  await prisma.like.createMany({
    data: [
      { userId: user1.id, songId: "song-ccm-1" },
      { userId: user1.id, songId: "song-ccm-2" },
      { userId: user2.id, songId: "song-gospel-1" },
      { userId: user2.id, songId: "song-jazz-1" },
      { userId: user3.id, songId: "song-classical-1" },
      { userId: user3.id, songId: "song-pop-1" },
      { userId: user4.id, songId: "song-rock-1" },
      { userId: user4.id, songId: "song-folk-1" },
    ],
  });

  // =========================================================================
  // EXISTING EVENTS AND OTHER DATA (from original seed)
  // =========================================================================

  console.log("📅 Creating events and other data...");

  // Create events
  const event1 = await prisma.event.upsert({
    where: { id: "tech-conference-2024" },
    update: {},
    create: {
      id: "tech-conference-2024",
      title: "Future of Technology Conference 2024",
      description:
        "Join industry leaders and innovators as we explore the future of technology, AI, and digital transformation. An immersive conference featuring keynotes, workshops, and networking opportunities.",
      organizationId: org1.id,
      category: "Technology Conference",
      startDate: new Date("2024-10-15T09:00:00Z"),
      endDate: new Date("2024-10-17T18:00:00Z"),
      location: "San Francisco",
      venue: "Moscone Center",
      address: "747 Howard St, San Francisco, CA 94103",
      ticketType: "PAID",
      ticketPrice: 299.99,
      ticketUrl: "https://techhub.com/conference/tickets",
      programmeOverview:
        "Three days of transformative content covering AI, Blockchain, Cybersecurity, and Digital Innovation. Featuring 50+ speakers, 20 workshops, and unlimited networking opportunities.",
      status: "PUBLISHED",
      isPublished: true,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: "community-festival-2024" },
    update: {},
    create: {
      id: "community-festival-2024",
      title: "Community Builders Festival 2024",
      description:
        "A celebration of community spirit featuring food, music, workshops, and collaborative projects that bring people together.",
      organizationId: org2.id,
      category: "Community Event",
      startDate: new Date("2024-11-02T10:00:00Z"),
      endDate: new Date("2024-11-03T22:00:00Z"),
      location: "Downtown Park",
      venue: "Central Park Plaza",
      address: "123 Main St, Downtown City, ST 12345",
      ticketType: "FREE",
      ticketUrl: "https://community.org/festival/register",
      programmeOverview:
        "Two days of community celebration with free food, live music, art installations, and interactive workshops for all ages.",
      status: "PUBLISHED",
      isPublished: true,
    },
  });

  // Create event activities
  await prisma.eventActivity.createMany({
    data: [
      {
        eventId: event1.id,
        userId: user1.id,
        title: "Opening Keynote: AI Revolution",
        description:
          "Dr. Emily Carter presents groundbreaking research on AI advancements and their societal implications.",
        startTime: new Date("2024-10-15T09:00:00Z"),
        endTime: new Date("2024-10-15T10:30:00Z"),
        location: "Main Auditorium",
      },
      {
        eventId: event1.id,
        userId: user1.id,
        title: "Workshop: Building AI Applications",
        description:
          "Hands-on workshop teaching practical AI development using modern frameworks and tools.",
        startTime: new Date("2024-10-15T14:00:00Z"),
        endTime: new Date("2024-10-15T17:00:00Z"),
        location: "Workshop Room A",
      },
      {
        eventId: event2.id,
        userId: user2.id,
        title: "Community Leaders Roundtable",
        description:
          "Local leaders discuss community challenges and success stories with festival attendees.",
        startTime: new Date("2024-11-02T11:00:00Z"),
        endTime: new Date("2024-11-02T12:30:00Z"),
        location: "Festival Tent",
      },
    ],
  });

  // Create media items (for gallery)
  const media1 = await prisma.media.upsert({
    where: { id: "conference-opening-photo" },
    update: {},
    create: {
      id: "conference-opening-photo",
      type: "IMAGE",
      url: "/img/icon.png",
      createdAt: new Date(),
    },
  });

  const media2 = await prisma.media.upsert({
    where: { id: "festival-stage-photo" },
    update: {},
    create: {
      id: "festival-stage-photo",
      type: "IMAGE",
      url: "/img/logo.png",
      createdAt: new Date(),
    },
  });

  // Create event gallery items
  await prisma.eventGallery.createMany({
    data: [
      {
        eventId: event1.id,
        mediaId: media1.id,
        caption:
          "Conference opening with keynote speaker Dr. Emily Carter addressing the crowd on AI innovations.",
        createdAt: new Date("2024-10-15T09:30:00Z"),
      },
      {
        eventId: event2.id,
        mediaId: media2.id,
        caption:
          "Festival stages featuring local musicians and community performers.",
        createdAt: new Date("2024-11-02T15:00:00Z"),
      },
    ],
  });

  // Create attendees
  await prisma.eventAttendee.createMany({
    data: [
      {
        eventId: event1.id,
        userId: user1.id,
        status: "CONFIRMED",
        ticketCode: "TECH2024-001",
        registeredAt: new Date("2024-09-01T10:00:00Z"),
      },
      {
        eventId: event1.id,
        userId: user3.id,
        status: "REGISTERED",
        ticketCode: "TECH2024-002",
        registeredAt: new Date("2024-09-15T14:30:00Z"),
      },
      {
        eventId: event2.id,
        userId: user2.id,
        status: "ATTENDED",
        ticketCode: "FEST2024-001",
        registeredAt: new Date("2024-10-01T09:00:00Z"),
      },
      {
        eventId: event2.id,
        userId: user4.id,
        status: "REGISTERED",
        ticketCode: "FEST2024-002",
        registeredAt: new Date("2024-10-20T16:45:00Z"),
      },
    ],
  });

  // Create posts for organizations
  await prisma.organizationPost.createMany({
    data: [
      {
        organizationId: org1.id,
        userId: user1.id,
        content:
          "Excited to announce our upcoming Future of Technology Conference! Join us October 15-17 for groundbreaking sessions on AI, blockchain, and digital transformation. Early bird tickets available now! 🎟️ #TechConference #Innovation",
      },
      {
        organizationId: org2.id,
        userId: user2.id,
        content:
          "Our Community Builders Festival is just around the corner! Mark your calendars for November 2-3 in Downtown Park. Free admission, great food, music, and meaningful connections await! 🌟 #CommunityFestival #TogetherStronger",
      },
    ],
  });

  // Create sample organization highlight
  await prisma.organizationHighlight.create({
    data: {
      title: "Community Garden Success Story",
      content: "Our community garden project has yielded incredible results this season, providing fresh produce to over 50 families and serving as an educational hub for sustainable farming practices. Volunteers from all age groups have contributed, creating lasting friendships and environmental impact.",
      excerpt: "Overcoming challenges to create a thriving community space that nourishes both people and the environment.",
      type: "STORY",
      category: "Success Stories",
      organizationId: org2.id,
      userId: user2.id,
      featured: true,
      published: true,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`🎵 Created ${songs.length} songs across multiple genres`);
  console.log(`🎧 Created 3 playlists with various songs`);
  console.log(`🎼 Created 3 organization song selections`);
  console.log(`❤️ Added likes to popular songs`);
  console.log(`🏢 Created organizations: ${org1.name}, ${org2.name}`);
  console.log(`📅 Created events: ${event1.title}, ${event2.title}`);
  console.log("🎉 All data seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });