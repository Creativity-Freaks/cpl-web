import { supabase } from "../lib/supabase";

const auditDatabase = async () => {
  try {
    console.log("Starting database audit...");

    // Fetch all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from("pg_tables")
      .select("schemaname, tablename")
      .eq("schemaname", "public");

    if (tablesError) {
      console.error("Error fetching tables:", tablesError);
      return;
    }

    console.log("Tables in the public schema:", tables);

    // Fetch RLS policies for each table
    for (const table of tables) {
      const { data: policies, error: policiesError } = await supabase
        .from("pg_policies")
        .select("policyname, permissive, roles")
        .eq("tablename", table.tablename);

      if (policiesError) {
        console.error(`Error fetching policies for table ${table.tablename}:`, policiesError);
        continue;
      }

      console.log(`Policies for table ${table.tablename}:`, policies);
    }

    console.log("Database audit completed.");
  } catch (error) {
    console.error("Unexpected error during database audit:", error);
  }
};

auditDatabase();