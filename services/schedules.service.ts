import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError } from "@/lib/errors"
import type { Schedule, ScheduleInsert, ScheduleUpdate } from "@/types/database"

export class SchedulesService {
  /**
   * スケジュールを作成
   */
  static async create(data: Omit<ScheduleInsert, "user_id">): Promise<Schedule> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Creating schedule for user:", user.id, "data:", data)

      const insertData: ScheduleInsert = {
        ...data,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: schedule, error } = await supabase.from("schedules").insert(insertData).select().single()

      if (error) {
        console.error("Database insert error:", error)
        handleSupabaseError(error)
      }

      console.log("Schedule created successfully:", schedule)
      return schedule
    } catch (error) {
      console.error("SchedulesService.create error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを取得（ユーザー別）
   */
  static async getAll(): Promise<Schedule[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Fetching schedules for user:", user.id)

      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })

      if (error) {
        console.error("Database select error:", error)
        handleSupabaseError(error)
      }

      console.log("Schedules fetched successfully:", schedules?.length || 0, "schedules")
      return schedules || []
    } catch (error) {
      console.error("SchedulesService.getAll error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * 特定の日付のスケジュールを取得
   */
  static async getByDate(date: string): Promise<Schedule[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Fetching schedules for user:", user.id, "date:", date)

      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .order("time", { ascending: true })

      if (error) {
        console.error("Database select error:", error)
        handleSupabaseError(error)
      }

      console.log("Schedules fetched for date:", schedules?.length || 0, "schedules")
      return schedules || []
    } catch (error) {
      console.error("SchedulesService.getByDate error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * 期間内のスケジュールを取得
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Schedule[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Fetching schedules for user:", user.id, "from:", startDate, "to:", endDate)

      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .order("time", { ascending: true })

      if (error) {
        console.error("Database select error:", error)
        handleSupabaseError(error)
      }

      console.log("Schedules fetched for date range:", schedules?.length || 0, "schedules")
      return schedules || []
    } catch (error) {
      console.error("SchedulesService.getByDateRange error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを更新
   */
  static async update(id: string, data: ScheduleUpdate): Promise<Schedule> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Updating schedule:", id, "for user:", user.id, "data:", data)

      const updateData: ScheduleUpdate = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: schedule, error } = await supabase
        .from("schedules")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Database update error:", error)
        handleSupabaseError(error)
      }

      console.log("Schedule updated successfully:", schedule)
      return schedule
    } catch (error) {
      console.error("SchedulesService.update error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを削除
   */
  static async delete(id: string): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Deleting schedule:", id, "for user:", user.id)

      const { error } = await supabase.from("schedules").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Database delete error:", error)
        handleSupabaseError(error)
      }

      console.log("Schedule deleted successfully")
    } catch (error) {
      console.error("SchedulesService.delete error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
 * 繰り返しスケジュールを作成
 */
static async createRecurring(
  data: Omit<ScheduleInsert, "user_id">,
  endDate: string,
  frequency: "daily" | "weekly" | "monthly",
): Promise<Schedule[]> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User authentication error:", userError);
      throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。");
    }

    if (!user) {
      throw new DatabaseError("認証が必要です。ログインしてください。");
    }

    if (!data.date) {
      throw new DatabaseError("開始日が未設定です。");
    }

    console.log("Creating recurring schedule for user:", user.id, "frequency:", frequency);

    const schedules: ScheduleInsert[] = [];
    const startDate = new Date(data.date);
    const end = new Date(endDate);
    const currentDate = new Date(startDate);

    while (currentDate <= end) {
      schedules.push({
        ...data,
        user_id: user.id,
        date: currentDate.toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // 次の日付を計算
      switch (frequency) {
        case "daily":
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case "weekly":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "monthly":
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    const { data: createdSchedules, error } = await supabase.from("schedules").insert(schedules).select();

    if (error) {
      console.error("Database insert error:", error);
      handleSupabaseError(error);
    }

    console.log("Recurring schedules created successfully:", createdSchedules?.length || 0, "schedules");
    return createdSchedules || [];
  } catch (error) {
    console.error("SchedulesService.createRecurring error:", error);
    if (error instanceof DatabaseError) {
      throw error;
    }
    handleSupabaseError(error);
  }
}}
