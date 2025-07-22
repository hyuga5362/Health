# Health Calendar App

This is a health calendar application built with Next.js, React, and Supabase.

## Features

- User authentication with Supabase
- Record daily health status (good, normal, bad)
- Calendar view to visualize health status
- Display health statistics
- Generate sample data for testing
- User settings management
- Schedule management

## Getting Started

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/your-username/health-calendar-app.git
cd health-calendar-app
\`\`\`

### 2. Install dependencies

\`\`\`bash
pnpm install
\`\`\`

### 3. Set up Supabase

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  Get your Supabase URL and Anon Key from Project Settings -> API.
3.  Set up environment variables:

    Create a `.env.local` file in the root of your project and add the following:

    \`\`\`
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    \`\`\`

### 4. Run SQL migrations

Execute the SQL script to create necessary tables in your Supabase database.

\`\`\`sql
-- scripts/01-create-tables.sql
CREATE TABLE public.health_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    status text CHECK (status IN ('good', 'normal', 'bad')) NOT NULL,
    score integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, date)
);

CREATE TABLE public.user_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme text DEFAULT 'system' NOT NULL,
    notifications_enabled boolean DEFAULT true NOT NULL,
    weekly_report_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.schedules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    start_time time with time zone NOT NULL,
    end_time time with time zone NOT NULL,
    day_of_week integer[] NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_records
CREATE POLICY "Users can view their own health records." ON public.health_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health records." ON public.health_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records." ON public.health_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records." ON public.health_records
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings." ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings." ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings." ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for schedules
CREATE POLICY "Users can view their own schedules." ON public.schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules." ON public.schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules." ON public.schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules." ON public.schedules
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`

### 5. Run the development server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
-   `components/`: Reusable React components (UI, custom components).
-   `hooks/`: Custom React hooks for logic encapsulation.
-   `lib/`: Utility functions and Supabase client setup.
-   `services/`: Service classes for interacting with Supabase.
-   `scripts/`: SQL scripts for database setup.
-   `types/`: TypeScript type definitions.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
