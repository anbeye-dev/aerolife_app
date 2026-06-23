-- Sport Tables
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 4),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INT NOT NULL,
  reps TEXT NOT NULL,
  weight DECIMAL(6,2) DEFAULT 0,
  completed_sets INT[] DEFAULT '{}',
  rest_seconds INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercise_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(6,2),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PART-66 Tables
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_number INT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'B1',
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  exam_date DATE,
  time_spent_minutes INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE module_qcms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  duration_minutes INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Tables
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  budget_limit DECIMAL(10,2) DEFAULT 0,
  color TEXT DEFAULT '#5BA3E6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE monthly_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_qcms ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_sessions
CREATE POLICY "select_own_workout_sessions" ON workout_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_workout_sessions" ON workout_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_workout_sessions" ON workout_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_workout_sessions" ON workout_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for exercise_completions
CREATE POLICY "select_own_exercise_completions" ON exercise_completions FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM workout_sessions WHERE workout_sessions.id = exercise_completions.session_id AND workout_sessions.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_exercise_completions" ON exercise_completions FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM workout_sessions WHERE workout_sessions.id = exercise_completions.session_id AND workout_sessions.user_id = auth.uid()
  ));
CREATE POLICY "update_own_exercise_completions" ON exercise_completions FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM workout_sessions WHERE workout_sessions.id = exercise_completions.session_id AND workout_sessions.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_exercise_completions" ON exercise_completions FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM workout_sessions WHERE workout_sessions.id = exercise_completions.session_id AND workout_sessions.user_id = auth.uid()
  ));

-- RLS Policies for exercise_history
CREATE POLICY "select_own_exercise_history" ON exercise_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_exercise_history" ON exercise_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_exercise_history" ON exercise_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for modules (global data, readable by all authenticated)
CREATE POLICY "select_modules" ON modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_modules" ON modules FOR UPDATE TO authenticated USING (true);

-- RLS Policies for module_qcms
CREATE POLICY "select_module_qcms" ON module_qcms FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_module_qcms" ON module_qcms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "delete_module_qcms" ON module_qcms FOR DELETE TO authenticated USING (true);

-- RLS Policies for study_sessions
CREATE POLICY "select_own_study_sessions" ON study_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_study_sessions" ON study_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_study_sessions" ON study_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for categories (global data)
CREATE POLICY "select_categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for expenses
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for monthly_income
CREATE POLICY "select_own_monthly_income" ON monthly_income FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_monthly_income" ON monthly_income FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_monthly_income" ON monthly_income FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_monthly_income" ON monthly_income FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for savings_goals
CREATE POLICY "select_own_savings_goals" ON savings_goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_savings_goals" ON savings_goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_savings_goals" ON savings_goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_savings_goals" ON savings_goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, icon, color) VALUES
  ('Alimentation', 'UtensilsCrossed', '#5BA3E6'),
  ('Transport', 'Car', '#50C878'),
  ('Internet', 'Wifi', '#9B59B6'),
  ('Logement', 'Home', '#E67E22'),
  ('Épargne', 'PiggyBank', '#3498DB'),
  ('Formation', 'GraduationCap', '#E74C3C'),
  ('Sport', 'Dumbbell', '#2ECC71'),
  ('Santé', 'Heart', '#E91E63'),
  ('Divers', 'Ellipsis', '#95A5A6');

-- Insert default modules
INSERT INTO modules (module_number, name, category) VALUES
  (1, 'Mathématiques', 'B1, B2'),
  (2, 'Physique', 'B1'),
  (3, 'Principes essentiels d''électricité', 'B1, B2'),
  (4, 'Principes essentiels d''électronique', 'B1'),
  (5, 'Techniques numériques et systèmes d''instrumentation électronique', 'B1'),
  (6, 'Matériaux et matériels', 'B1'),
  (7, 'Procédures d''entretien', 'B1'),
  (8, 'Aérodynamique de base', 'B1, B2'),
  (9, 'Facteurs humains', 'B1, B2'),
  (10, 'Législation aéronautique', 'B1, B2'),
  (11, 'Aérodynamique des avions, structures et systèmes', 'B1.1'),
  (15, 'Turbine à gaz', 'B1'),
  (17, 'Hélice', 'B1');