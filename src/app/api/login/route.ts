import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    const { smo_studentID } = await req.json();

    if (!smo_studentID) {
        return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
        .from('smo_user')
        .select('smo_studentID')
        .eq('smo_studentID', smo_studentID)
        .single();

    if (error || !user) {
        return NextResponse.json({ error: 'Invalid student ID' }, { status: 401 });
    }

    return NextResponse.json({ smo_user: user });
}
