import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function NewProblemPage() {
  async function create(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "");
    const slug = String(formData.get("slug") || "");
    const difficulty = String(formData.get("difficulty") || "EASY") as any;
    const description = String(formData.get("description") || "");
    await prisma.problem.create({
      data: { title, slug, difficulty, description, examples: [], tags: [] }
    });
    redirect("/admin");
  }

  return (
    <form action={create} className="grid gap-3 max-w-2xl">
      <h1 className="text-2xl font-semibold">New Problem</h1>
      <div>
        <label>Title</label>
        <input name="title" required/>
      </div>
      <div>
        <label>Slug</label>
        <input name="slug" required/>
      </div>
      <div>
        <label>Difficulty</label>
        <select name="difficulty">
          <option value="EASY">EASY</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HARD">HARD</option>
        </select>
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" rows={6}/>
      </div>
      <button className="btn border-neutral-300 w-fit">Create</button>
    </form>
  );
}
