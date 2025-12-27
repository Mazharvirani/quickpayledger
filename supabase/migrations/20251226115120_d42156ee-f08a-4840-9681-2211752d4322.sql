-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT DEFAULT 'Your Business Name',
  business_address TEXT DEFAULT '123 Business Street, City, State 12345',
  business_phone TEXT DEFAULT '+92 300 1234567',
  business_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  price_per_unit NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_address TEXT,
  buyer_phone TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for inventory
CREATE POLICY "Users can view their own inventory" ON public.inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" ON public.inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON public.inventory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" ON public.inventory
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for invoice_items (based on invoice ownership)
CREATE POLICY "Users can view their own invoice items" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own invoice items" ON public.invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own invoice items" ON public.invoice_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid())
  );

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, business_email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();