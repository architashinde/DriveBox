import { revalidatePath } from "next/cache";
import { uploadFiles } from "@/lib/data/drive";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await uploadFiles(formData);
  if (!result.error) {
    const path = String(formData.get("path") || "/");
    revalidatePath(path);
    revalidatePath("/");
  }
  return Response.json(result, { status: result.error ? 400 : 200 });
}