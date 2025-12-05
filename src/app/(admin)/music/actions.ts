"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { revalidatePath } from "next/cache";

export type CreateSongInput = {
  title: string;
  artist: string;
  genre?: string;
  duration?: number;
  lyrics?: string;
  audioUrl?: string;
  sheetMusicUrl?: string;
  coverUrl?: string;
};

export async function getSongs(query?: string, genre?: string) {
  const songs = await prisma.song.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { artist: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        genre ? { genre: { equals: genre, mode: "insensitive" } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      likes: true,
    },
  });
  return songs;
}

export async function getRecentSongs(limit: number = 10) {
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      likes: true,
    },
  });
  return songs;
}

export async function getSong(id: string) {
  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      likes: true,
    },
  });
  return song;
}

export async function createSong(data: CreateSongInput) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const orgAdmins = await prisma.organizationAdmin.findMany({
    where: { userId: user.id },
  });

  if (orgAdmins.length === 0) {
      throw new Error("Only organization admins can upload songs");
  }

  const song = await prisma.song.create({
    data,
  });

  revalidatePath("/music");
  return song;
}

export async function updateSong(id: string, data: CreateSongInput) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const orgAdmins = await prisma.organizationAdmin.findMany({
    where: { userId: user.id },
  });

  if (orgAdmins.length === 0) {
      throw new Error("Only organization admins can update songs");
  }

  const song = await prisma.song.update({
    where: { id },
    data,
  });

  revalidatePath("/music");
  revalidatePath(`/music/${id}`);
  return song;
}

export async function deleteSong(id: string) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }
  
  const orgAdmins = await prisma.organizationAdmin.findMany({
    where: { userId: user.id },
  });

  if (orgAdmins.length === 0) {
      throw new Error("Only organization admins can delete songs");
  }

  await prisma.song.delete({
    where: { id },
  });

  revalidatePath("/music");
}

export async function toggleSongLike(songId: string) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_songId: {
        userId: user.id,
        songId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: {
        userId: user.id,
        songId,
      },
    });
  }

  revalidatePath("/music");
}

export async function createPlaylist(name: string) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const playlist = await prisma.playlist.create({
    data: {
      name,
      userId: user.id,
    },
  });

  revalidatePath("/music");
  return playlist;
}

export async function getPlaylists() {
  const { user } = await validateRequest();

  if (!user) return [];

  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { songs: true },
      },
    },
  });

  return playlists;
}

export async function addToPlaylist(playlistId: string, songId: string) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!playlist || playlist.userId !== user.id) {
    throw new Error("Playlist not found or unauthorized");
  }

  try {
    await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      },
    });
    revalidatePath("/music");
    return { success: true };
  } catch (error) {
    // Ignore unique constraint violation (already added)
    return { success: false, error: "Song already in playlist" };
  }
}

export async function getOrganizationSelections() {
  const selections = await prisma.organizationSelection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      songs: {
        include: {
          song: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });
  return selections;
}

export async function getSelectionById(id: string) {
  const selection = await prisma.organizationSelection.findUnique({
    where: { id },
    include: {
      songs: {
        include: {
          song: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });
  return selection;
}

export async function addToSelection(selectionId: string, songId: string) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const orgAdmins = await prisma.organizationAdmin.findMany({
    where: { userId: user.id },
  });

  if (orgAdmins.length === 0) {
      throw new Error("Only organization admins can manage selections");
  }

  // Get current max order
  const lastItem = await prisma.songSelection.findFirst({
    where: { selectionId },
    orderBy: { order: 'desc' },
  });

  const newOrder = lastItem ? lastItem.order + 1 : 0;

  try {
    await prisma.songSelection.create({
      data: {
        selectionId,
        songId,
        order: newOrder,
      },
    });
    revalidatePath("/music");
    revalidatePath(`/music/selection/${selectionId}`);
    return { success: true };
  } catch (error) {
    // Ignore unique constraint violation (already added)
    return { success: false, error: "Song already in selection" };
  }
}

export async function removeFromSelection(selectionId: string, songId: string) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const orgAdmins = await prisma.organizationAdmin.findMany({
    where: { userId: user.id },
  });

  if (orgAdmins.length === 0) {
      throw new Error("Only organization admins can manage selections");
  }

  await prisma.songSelection.delete({
    where: {
      selectionId_songId: {
        selectionId,
        songId,
      },
    },
  });

  revalidatePath("/music");
  revalidatePath(`/music/selection/${selectionId}`);
  return { success: true };
}
