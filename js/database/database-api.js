import "../../vendor/supabase/supabase-js@2.js";

const { createClient } = supabase;

const supabaseUrl = "https://yseozmctkahaaxecwmyn.supabase.co";
const supabasePublicAPIKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZW96bWN0a2FoYWF4ZWN3bXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NTk2OTEsImV4cCI6MjA1NTIzNTY5MX0.pOF3tUTP_fN3JO-6CJ3kr1eke70CGGBs-9Uq_y2h-SQ";

const client = createClient(supabaseUrl, supabasePublicAPIKey);

const getAllFromDatabase = async (tableName) => {
  try {
    const result = await client.from(tableName).select();
    return result.data;
  } catch (error) {
    console.error("Error getting data", error);
    throw error;
  }
};

const getSomeFromDatabase = async (tableName, key, value) => {
  try {
    const result = await client.from(tableName).select().eq(key, value);
    return result.data;
  } catch (error) {
    console.error("Error getting data", error);
    throw error;
  }
};

const getOneFromDatabase = async (tableName, key, value) => {
  try {
    const result = await client
      .from(tableName)
      .select()
      .eq(key, value)
      .single();
    return result.data;
  } catch (error) {
    console.error("Error getting data", error);
    throw error;
  }
};

const addToDatabase = async (tableName, items) => {
  try {
    await client.from(tableName).insert(items);
  } catch (error) {
    console.error("Error adding data", error);
    throw error;
  }
};

const updateInDatabase = async (tableName, items, ID) => {
  try {
    await client.from(tableName).update(items).eq("id", ID);
  } catch (error) {
    console.error("Error updating data", error);
    throw error;
  }
};

const deleteFromDatabase = async (tableName, ID) => {
  try {
    await client.from(tableName).delete().eq("id", ID);
  } catch (error) {
    console.error("Error deleting data", error);
    throw error;
  }
};

export {
  getAllFromDatabase,
  getSomeFromDatabase,
  getOneFromDatabase,
  addToDatabase,
  updateInDatabase,
  deleteFromDatabase,
};
