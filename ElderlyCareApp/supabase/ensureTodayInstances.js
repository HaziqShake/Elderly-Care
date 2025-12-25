import { supabase } from "./supabaseClient";

// Ensures daily instances exist for TODAY
export async function ensureTodayInstances() {
  const todayDate = new Date();
  const todayWeekday = todayDate.getDay(); // 0 = Sunday
  const today = todayDate.toISOString().slice(0, 10);
  const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  throw new Error("User not authenticated");
}


  try {
    /* ---------------- RESIDENT (SPECIFIC) TASKS ---------------- */

    const { data: residentActs, error: raError } = await supabase
      .from("resident_activities")
      .select(`
        resident_id,
        activity_id,
        scheduled_time,
        activities(default_time, repeat_days)
      `);

    if (raError) throw raError;

    /* ---------------- FETCH TODAY'S INSTANCES ---------------- */

    const { data: todayInstances, error: instError } = await supabase
      .from("daily_task_instances")
      .select("activity_id, resident_id, date")
      .eq("date", today);

    if (instError) throw instError;

    const existingMap = new Set(
      (todayInstances || []).map(
        (i) => `${i.resident_id}_${i.activity_id}_${i.date}`
      )
    );

    const inserts = [];

    /* ---------------- SPECIFIC TASKS ---------------- */

    for (const ra of residentActs || []) {
      const repeatDays = ra.activities?.repeat_days;

      if (
        Array.isArray(repeatDays) &&
        repeatDays.length > 0 &&
        !repeatDays.includes(todayWeekday)
      ) {
        continue;
      }

      const key = `${ra.resident_id}_${ra.activity_id}_${today}`;

      if (!existingMap.has(key)) {
        inserts.push({
          resident_id: ra.resident_id,
          activity_id: ra.activity_id,
          date: today,
          scheduled_time: ra.scheduled_time || ra.activities?.default_time,
          status: "pending",
          owner_id: user.id,
        });
      }
    }

    /* ---------------- COMMON TASKS ---------------- */

    const { data: commonActs, error: commonErr } = await supabase
      .from("activities")
      .select("id, default_time, repeat_days")
      .eq("type", "common");

    if (commonErr) throw commonErr;

    for (const act of commonActs || []) {
      const repeatDays = act.repeat_days;

      if (
        Array.isArray(repeatDays) &&
        repeatDays.length > 0 &&
        !repeatDays.includes(todayWeekday)
      ) {
        continue;
      }

      const key = `null_${act.id}_${today}`;

      if (!existingMap.has(key)) {
        inserts.push({
          resident_id: null,
          activity_id: act.id,
          date: today,
          scheduled_time: act.default_time,
          status: "pending",
          owner_id: user.id,
        });
      }
    }

    /* ---------------- INSERT ---------------- */

    if (inserts.length > 0) {
      const { error } = await supabase
        .from("daily_task_instances")
        .insert(inserts);

      if (error) throw error;
    }

    return null;
  } catch (err) {
    console.error("ensureTodayInstances ERROR:", err.message);
    return err;
  }
}
