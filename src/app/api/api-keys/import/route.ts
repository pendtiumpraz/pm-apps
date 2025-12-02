import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { rows } = body

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data to import" }, { status: 400 })
    }

    const userId = session.user.id

    // Get all platforms for this user
    const platforms = await prisma.apiPlatform.findMany({
      where: { userId, deletedAt: null },
    })

    const platformMap = new Map(platforms.map((p) => [p.slug.toLowerCase(), p.id]))
    const platformNameMap = new Map(platforms.map((p) => [p.name.toLowerCase(), p.id]))

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 because row 1 is header

      try {
        // Find platform by slug or name
        const platformKey = (row.platform || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        let platformId = platformMap.get(platformKey) || platformNameMap.get((row.platform || "").toLowerCase())

        // If platform doesn't exist, create it
        if (!platformId && row.platform) {
          const newPlatform = await prisma.apiPlatform.create({
            data: {
              userId,
              name: row.platform,
              slug: platformKey,
              color: "#6366F1",
            },
          })
          platformId = newPlatform.id
          platformMap.set(platformKey, platformId)
          platformNameMap.set(row.platform.toLowerCase(), platformId)
        }

        if (!platformId) {
          results.failed++
          results.errors.push(`Row ${rowNum}: Platform is required`)
          continue
        }

        if (!row.email) {
          results.failed++
          results.errors.push(`Row ${rowNum}: Email is required`)
          continue
        }

        await prisma.apiKey.create({
          data: {
            userId,
            platformId,
            email: row.email,
            password: row.password || null,
            loginMethod: row.loginMethod || null,
            apiKey: row.apiKey || null,
            creditTotal: parseFloat(row.creditTotal) || 0,
            creditUsed: parseFloat(row.creditUsed) || 0,
            tokenTotal: parseFloat(row.tokenTotal) || 0,
            tokenUsed: parseFloat(row.tokenUsed) || 0,
            referralCode: row.referralCode || null,
            referralLink: row.referralLink || null,
            notes: row.notes || null,
          },
        })

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`Row ${rowNum}: ${error.message}`)
      }
    }

    return NextResponse.json({
      message: `Imported ${results.success} keys, ${results.failed} failed`,
      data: results,
    })
  } catch (error) {
    console.error("POST /api/api-keys/import error:", error)
    return NextResponse.json({ error: "Failed to import API keys" }, { status: 500 })
  }
}
