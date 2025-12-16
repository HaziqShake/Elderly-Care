import { supabase } from "./supabaseClient";

// Ensures daily instances exist for TODAY for every resident_activity
export async function ensureTodayInstances() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    // 1. Fetch all assigned resident activities (who should have tasks)
    const { data: residentActs, error: raError } = await supabase
      .from("resident_activities")
      .select(`
        id,
        resident_id,
        activity_id,
        scheduled_time,
        activities(default_time)
      `);

    if (raError) throw raError;

    if (!residentActs || residentActs.length === 0) return null;

    // 2. Fetch today's existing instances
    const { data: todayInstances, error: instError } = await supabase
      .from("daily_task_instances")
      .select("activity_id, resident_id, date")
      .eq("date", today);

    if (instError) throw instError;

    const existingMap = new Set(
      todayInstances?.map(
        (i) => `${i.resident_id}_${i.activity_id}_${i.date}`
      )
    );

    // 3. Build list of missing instances
    const inserts = [];

    for (const ra of residentActs) {
      const key = `${ra.resident_id}_${ra.activity_id}_${today}`;

      if (!existingMap.has(key)) {
        inserts.push({
          resident_id: ra.resident_id,
          activity_id: ra.activity_id,
          date: today,
          scheduled_time: ra.scheduled_time || ra.activities?.default_time,
          status: "pending",
        });
      }
    }

    // 4. Insert missing ones
    if (inserts.length > 0) {
      const { error: insErr } = await supabase
        .from("daily_task_instances")
        .insert(inserts);

      if (insErr) throw insErr;
    }

    return null;
  } catch (err) {
    console.error("ensureTodayInstances ERROR:", err.message);
    return err;
  }
}
