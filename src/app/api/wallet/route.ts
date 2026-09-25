import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  depositToWallet,
  getWalletWithLedger,
  transferWalletFunds,
  getOrgWalletWithLedger,
  depositToOrgWallet,
} from "@/lib/financial/walletService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    // Fetch user's affiliated guilds for the vault scope selector
    const guilds = await prisma.organization.findMany({
      where: {
        OR: [
          { members: { some: { userId: user.id } } },
          { admins: { some: { userId: user.id } } },
        ],
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        admins: {
          where: { userId: user.id },
          select: { userId: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const userGuilds = guilds.map((g) => ({
      id: g.id,
      name: g.name,
      logoUrl: g.logoUrl,
      isAdmin: g.admins.length > 0,
    }));

    // If an organization treasury scope is requested
    if (organizationId) {
      const isAffiliated = userGuilds.some((g) => g.id === organizationId);
      if (!isAffiliated) {
        return NextResponse.json(
          { error: "You are not a member or steward of this organization" },
          { status: 403 }
        );
      }

      const activeGuild = userGuilds.find((g) => g.id === organizationId);
      const orgWalletData = await getOrgWalletWithLedger(organizationId);

      return NextResponse.json({
        scope: "organization",
        organization: {
          id: organizationId,
          name: activeGuild?.name,
          logoUrl: activeGuild?.logoUrl,
          isAdmin: activeGuild?.isAdmin || false,
        },
        userGuilds,
        ...orgWalletData,
      });
    }

    // Default: Personal Citizen Vault
    const personalWalletData = await getWalletWithLedger(user.id);
    return NextResponse.json({
      scope: "personal",
      userGuilds,
      ...personalWalletData,
    });
  } catch (error: any) {
    console.error("Fetch wallet error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load wallet" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, organizationId } = body;

    if (action === "deposit") {
      const { amount, reference, narration } = body;
      const parsedAmount = Number(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
      }

      if (organizationId) {
        // Verify user is an admin of the guild to deposit into treasury
        const adminCheck = await prisma.organizationAdmin.findUnique({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId,
            },
          },
        });

        if (!adminCheck) {
          return NextResponse.json(
            { error: "Admin privilege required to deposit into guild treasury" },
            { status: 403 }
          );
        }

        const result = await depositToOrgWallet({
          organizationId,
          actorId: user.id,
          amount: parsedAmount,
          reference,
          narration: narration || "Guild treasury deposit via instant clearing",
        });

        return NextResponse.json({ success: true, ...result });
      }

      const result = await depositToWallet({
        userId: user.id,
        amount: parsedAmount,
        reference,
        narration: narration || "Instant personal wallet deposit",
      });

      return NextResponse.json({ success: true, ...result });
    }

    if (action === "transfer") {
      const { recipient, amount, narration } = body;
      const parsedAmount = Number(amount);

      if (!recipient || isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ error: "Recipient and valid amount required" }, { status: 400 });
      }

      const result = await transferWalletFunds({
        senderId: user.id,
        recipientIdentifier: recipient,
        amount: parsedAmount,
        narration: narration || "Community peer transfer",
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { error: "Invalid action. Expected 'deposit' or 'transfer'." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Wallet action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process transaction" },
      { status: 400 }
    );
  }
}
