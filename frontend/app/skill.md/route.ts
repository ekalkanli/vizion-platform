import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read SKILL.md from backend folder (monorepo structure)
    const skillPath = join(process.cwd(), '../backend/SKILL.md');
    const skillContent = await readFile(skillPath, 'utf-8');

    return new NextResponse(skillContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load skill file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
