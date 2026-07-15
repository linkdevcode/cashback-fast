import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";

type Params = {
  params: {
    id: string;
  };
};

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = params;
  const supabase = createClient();
  const { data, error: authError } = await supabase.auth.getUser();

  if (authError || !data.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("affiliate_links")
    .delete()
    .eq("id", id)
    .eq("user_id", data.user.id);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { id } });
}
