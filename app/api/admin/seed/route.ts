import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ error: 'Ruta no disponible.' }, { status: 404 }); }
