-- =========================================================
-- Skema Database Ceklis Kota Tegal (Supabase SQL)
-- =========================================================

-- 1. Tabel Master Wilayah Kota Tegal
CREATE TABLE IF NOT EXISTS public.wilayah_tegal (
    id BIGSERIAL PRIMARY KEY,
    kecamatan VARCHAR(100) NOT NULL,
    kelurahan VARCHAR(100) NOT NULL,
    kode_pos VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pencarian wilayah
CREATE INDEX IF NOT EXISTS idx_wilayah_tegal_kec_kel ON public.wilayah_tegal (kecamatan, kelurahan);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.wilayah_tegal ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS: Publik / Anon dapat membaca data wilayah
DROP POLICY IF EXISTS "Public read access for wilayah_tegal" ON public.wilayah_tegal;
CREATE POLICY "Public read access for wilayah_tegal"
    ON public.wilayah_tegal
    FOR SELECT
    USING (true);

-- Isi Data Master 4 Kecamatan & 27 Kelurahan Kota Tegal
INSERT INTO public.wilayah_tegal (kecamatan, kelurahan) VALUES
    -- Margadana
    ('Margadana', 'Cabawan'),
    ('Margadana', 'Kaligangsa'),
    ('Margadana', 'Kalinyamat Kulon'),
    ('Margadana', 'Krandon'),
    ('Margadana', 'Margadana'),
    ('Margadana', 'Pesurungan Lor'),
    ('Margadana', 'Sumurpanggang'),

    -- Tegal Barat
    ('Tegal Barat', 'Debong Lor'),
    ('Tegal Barat', 'Kemandungan'),
    ('Tegal Barat', 'Kraton'),
    ('Tegal Barat', 'Muarareja'),
    ('Tegal Barat', 'Pekauman'),
    ('Tegal Barat', 'Pesurungan Kidul'),
    ('Tegal Barat', 'Tegalsari'),

    -- Tegal Selatan
    ('Tegal Selatan', 'Bandung'),
    ('Tegal Selatan', 'Debong Kidul'),
    ('Tegal Selatan', 'Debong Kulon'),
    ('Tegal Selatan', 'Debong Tengah'),
    ('Tegal Selatan', 'Kalinyamat Wetan'),
    ('Tegal Selatan', 'Randugunting'),
    ('Tegal Selatan', 'Tunon'),

    -- Tegal Timur
    ('Tegal Timur', 'Kejambon'),
    ('Tegal Timur', 'Mangkukusuman'),
    ('Tegal Timur', 'Mintaragen'),
    ('Tegal Timur', 'Panggung'),
    ('Tegal Timur', 'Slerok')
ON CONFLICT DO NOTHING;

-- 2. Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    nik VARCHAR(16),
    phone VARCHAR(20),
    community VARCHAR(50), -- 'RT', 'POSYANDU', 'SEKOLAH'
    role VARCHAR(50),
    kecamatan VARCHAR(100),
    kelurahan VARCHAR(100),
    rw VARCHAR(10),
    rt VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Aktifkan RLS untuk tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS untuk profiles
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 3. Tabel Peserta Didik PAUD-PNF (Dapodik, DDTK, PMT-AS)
CREATE TABLE IF NOT EXISTS public.paud_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    npsn VARCHAR(20) NOT NULL,
    nama_sekolah VARCHAR(150) NOT NULL,
    nisn VARCHAR(10) NOT NULL,
    nik VARCHAR(16) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    nama_ibu_kandung VARCHAR(150) NOT NULL,
    rombel VARCHAR(50) NOT NULL, -- 'Kelompok A', 'Kelompok B', 'KB', 'TPA', 'SPS'
    jenis_kelamin VARCHAR(2) DEFAULT 'L', -- 'L' / 'P'
    tanggal_lahir DATE,
    rt VARCHAR(10) NOT NULL,
    rw VARCHAR(10) NOT NULL,
    kelurahan VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    status_ddtk BOOLEAN DEFAULT true,
    status_pmtas BOOLEAN DEFAULT true,
    catatan_kesehatan TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pencarian siswa Dapodik
CREATE INDEX IF NOT EXISTS idx_paud_students_npsn ON public.paud_students (npsn);
CREATE INDEX IF NOT EXISTS idx_paud_students_nisn ON public.paud_students (nisn);
CREATE INDEX IF NOT EXISTS idx_paud_students_nik ON public.paud_students (nik);

-- Aktifkan RLS untuk paud_students
ALTER TABLE public.paud_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read paud_students" ON public.paud_students;
CREATE POLICY "Authenticated users can read paud_students"
    ON public.paud_students
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert paud_students" ON public.paud_students;
CREATE POLICY "Authenticated users can insert paud_students"
    ON public.paud_students
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update paud_students" ON public.paud_students;
CREATE POLICY "Authenticated users can update paud_students"
    ON public.paud_students
    FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete paud_students" ON public.paud_students;
CREATE POLICY "Authenticated users can delete paud_students"
    ON public.paud_students
    FOR DELETE
    TO authenticated
    USING (true);
